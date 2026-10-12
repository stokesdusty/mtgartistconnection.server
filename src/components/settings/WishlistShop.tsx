import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { useSelector } from "react-redux";
import axios from "axios";
import { ShoppingCart } from "@phosphor-icons/react";
import { RootState } from "../../store/store";
import { LOG_LINK_CLICK } from "../graphql/mutations";
import { usePriceClickLogger } from "../../hooks/usePriceClickLogger";
import { useTcgplayerProducts } from "../../hooks/useTcgplayerProducts";
import {
  ebaySearchUrl,
  tcgplayerMassEntryUrl,
  tcgplayerProductUrl,
  tcgplayerSearchUrl,
  trackAffiliateEvent,
} from "../../utils/affiliateLinks";
import { yourCardsStyles as styles } from "../../styles/your-cards-styles";
import MonoLabel from "../shared/MonoLabel";
import PriceChip from "../shared/PriceChip";

export interface WishlistItem {
  scryfallId: string;
  cardName: string;
  artistName: string;
  set: string;
  collectorNumber: string;
}

interface ScryfallPrice {
  id: string;
  tcgplayer_id?: number;
  prices?: { usd?: string | null };
}

// Scryfall's /cards/collection accepts up to 75 identifiers per request.
const SCRYFALL_BATCH = 75;

/** Current TCGplayer prices for wishlist cards, keyed by Scryfall ID. */
function useScryfallPrices(ids: string[]) {
  const [prices, setPrices] = useState(new Map<string, ScryfallPrice>());
  const key = ids.join(',');

  useEffect(() => {
    if (!key) return;
    const all = key.split(',');
    let cancelled = false;
    const batches: string[][] = [];
    for (let i = 0; i < all.length; i += SCRYFALL_BATCH) batches.push(all.slice(i, i + SCRYFALL_BATCH));

    Promise.all(
      batches.map((batch) =>
        axios
          .post<{ data: ScryfallPrice[] }>('https://api.scryfall.com/cards/collection', {
            identifiers: batch.map((id) => ({ id })),
          })
          .then((res) => res.data.data)
          .catch(() => [] as ScryfallPrice[])
      )
    ).then((results) => {
      if (!cancelled) setPrices(new Map(results.flat().map((card) => [card.id, card])));
    });
    return () => { cancelled = true; };
  }, [key]);

  return prices;
}

/** Signing wishlist with links to buy a copy to bring, or one that's already signed. */
const WishlistShop = ({ items }: { items: WishlistItem[] }) => {
  const prices = useScryfallPrices(items.map((item) => item.scryfallId));
  const tcgplayerIdOf = (item: WishlistItem) => prices.get(item.scryfallId)?.tcgplayer_id;
  const tcgplayerProducts = useTcgplayerProducts(items.map(tcgplayerIdOf));
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const logPriceClick = usePriceClickLogger('wishlist');
  // Click logging is best-effort; a failed log must never surface as an error.
  const [logLinkClick] = useMutation(LOG_LINK_CLICK, { onError: () => {} });

  const total = items.reduce((sum, item) => sum + Number(prices.get(item.scryfallId)?.prices?.usd ?? 0), 0);

  const handleEbayClick = (item: WishlistItem) => {
    trackAffiliateEvent('ebay_link_click', 'wishlist', { artist_name: item.artistName, event_label: item.cardName });
    if (userRole !== 'admin') logLinkClick({ variables: { artistName: item.artistName, linkType: 'ebay' } });
  };

  return (
    <Box component="section" aria-labelledby="signing-wishlist" sx={styles.wishlistSection}>
      <Box sx={styles.wishlistHeader}>
        <Box component="h2" id="signing-wishlist" sx={styles.sectionTitle}>Signing wishlist</Box>
        {items.length > 1 && (
          <Box
            component="a"
            href={tcgplayerMassEntryUrl(
              items.map((item) => {
                const tcgplayerId = tcgplayerIdOf(item);
                return {
                  name: item.cardName,
                  set: item.set,
                  collectorNumber: item.collectorNumber,
                  tcgplayer: tcgplayerId ? tcgplayerProducts.get(tcgplayerId) : undefined,
                };
              }),
              'wishlist',
            )}
            target="_blank"
            rel="noopener noreferrer sponsored"
            // Spans many artists, so it can't go in the per-artist click log; GA only.
            onClick={() => trackAffiliateEvent('tcgplayer_mass_entry_click', 'wishlist', { value: String(items.length) })}
            sx={styles.buyAllButton}
          >
            <ShoppingCart size={16} aria-hidden />
            Buy all {items.length} on TCGplayer{total > 0 && ` · about $${total.toFixed(2)}`}
          </Box>
        )}
      </Box>
      <Box component="p" sx={styles.wishlistIntro}>
        Need a copy to bring to the next signing? Grab one here, or skip the wait with one that's already signed.
      </Box>

      <Box component="ul" sx={styles.wishlistList}>
        {items.map((item) => {
          const price = prices.get(item.scryfallId);
          const usd = price?.prices?.usd;
          return (
            <Box component="li" key={item.scryfallId} sx={styles.wishlistRow}>
              <Box sx={styles.wishlistCard}>
                <Box title={item.cardName} sx={styles.wishlistCardName}>{item.cardName}</Box>
                <MonoLabel size={11} tracking="tight">
                  {[item.set?.toUpperCase(), item.collectorNumber && `#${item.collectorNumber}`, item.artistName]
                    .filter(Boolean)
                    .join(' · ')}
                </MonoLabel>
              </Box>
              <PriceChip
                label="TCG"
                value={usd ? `$${usd}` : 'Shop'}
                title="Buy on TCGplayer"
                href={price?.tcgplayer_id
                  ? tcgplayerProductUrl(price.tcgplayer_id, 'wishlist')
                  : tcgplayerSearchUrl(item.cardName, 'wishlist')}
                onClick={() => logPriceClick('tcgplayer', { artistName: item.artistName, cardName: item.cardName, cardSet: item.set })}
              />
              <Box
                component="a"
                href={ebaySearchUrl(`${item.cardName} ${item.artistName} signed`, 'wishlist')}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => handleEbayClick(item)}
                sx={styles.ebayLink}
              >
                Signed on eBay
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box component="p" sx={styles.disclosure}>
        We may earn a commission on purchases through these links.{' '}
        <Box component={RouterLink} to="/affiliate-disclosure" sx={{ color: 'inherit' }}>Learn more</Box>
      </Box>
    </Box>
  );
};

export default WishlistShop;
