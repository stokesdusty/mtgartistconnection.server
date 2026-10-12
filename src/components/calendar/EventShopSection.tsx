import { useEffect, useRef, useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import axios from "axios";
import { ArrowUpRight, ShoppingCart } from "@phosphor-icons/react";
import { RootState } from "../../store/store";
import { GET_CARD_PRICES, GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS } from "../graphql/queries";
import { LOG_LINK_CLICK } from "../graphql/mutations";
import { usePriceClickLogger } from "../../hooks/usePriceClickLogger";
import { useTcgplayerProducts } from "../../hooks/useTcgplayerProducts";
import {
  cardKingdomUrl,
  ebaySearchUrl,
  manapoolUrl,
  tcgplayerMassEntryUrl,
  tcgplayerProductUrl,
  trackAffiliateEvent,
} from "../../utils/affiliateLinks";
import { eventDetailStyles as styles, shopPickerPaper } from "../../styles/event-detail-styles";
import { priceChipStyles } from "../../styles/price-chip-styles";
import FilterChip from "../shared/FilterChip";
import PriceChip, { formatCents } from "../shared/PriceChip";
import Slab from "../shared/Slab";

// How many of an artist's most-played cards to suggest.
const CARD_LIMIT = 8;

// Up to this many artists fit as chips; bigger shows get a searchable picker so a
// wall of names doesn't push the cards down the page.
const MAX_ARTIST_CHIPS = 8;

export interface ShopCard {
  id: string;
  name: string;
  set: string;
  collector_number: string;
  tcgplayer_id?: number;
  prices?: { usd?: string | null };
  image_uris?: { normal: string };
  card_faces?: { image_uris?: { normal: string } }[];
}

interface ManapoolPrice {
  set_code: string;
  number: string;
  price_cents_nm: number | null;
  price_cents_lp_plus: number | null;
  price_cents: number | null;
}

interface CardKingdomPrice {
  scryfallId: string;
  price: number;
  url: string;
}

// Scryfall's EDHREC ordering puts the cards people actually play (and bring to signings) first.
// prefer:usd-low shows each card's cheapest printing by this artist rather than an arbitrary one.
export const scryfallTopCardsUrl = (artist: string) =>
  `https://api.scryfall.com/cards/search?order=edhrec&q=${encodeURIComponent(`game:paper artist:"${artist}" usd>0 prefer:usd-low`)}`;

// usd>0 only means *some* printing has a price, so promo-only cards (e.g. a Grand Prix
// Chrome Mox) can still come back unpriced. Those can't be bought, so skip them.
const isBuyable = (card: ShopCard) => !!card.prices?.usd;

const cardImage = (card: ShopCard) => card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal;

/**
 * "Bring cards to get signed": an attending artist's most popular cards with
 * vendor prices, for collectors stocking up before the event.
 */
const EventShopSection = ({ artists }: { artists: string[] }) => {
  const [selected, setSelected] = useState(artists[0]);
  const [cards, setCards] = useState<ShopCard[] | null>(null);
  const cache = useRef(new Map<string, ShopCard[]>());

  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const logPriceClick = usePriceClickLogger('event');
  // Click logging is best-effort; a failed log must never surface as an error.
  const [logLinkClick] = useMutation(LOG_LINK_CLICK, { onError: () => {} });

  useEffect(() => {
    if (!selected) return;
    const cached = cache.current.get(selected);
    if (cached) {
      setCards(cached);
      return;
    }

    let cancelled = false;
    setCards(null);
    axios
      .get<{ data: ShopCard[] }>(scryfallTopCardsUrl(selected))
      .then((res) => res.data.data.filter((card) => cardImage(card) && isBuyable(card)).slice(0, CARD_LIMIT))
      // Scryfall answers 404 when an artist has no matching cards.
      .catch(() => [] as ShopCard[])
      .then((result) => {
        cache.current.set(selected, result);
        if (!cancelled) setCards(result);
      });
    return () => { cancelled = true; };
  }, [selected]);

  const shown = cards ?? [];
  const { data: mpData } = useQuery(GET_CARD_PRICES, {
    variables: { cards: shown.map((c) => ({ set_code: c.set.toUpperCase(), number: c.collector_number })) },
    skip: shown.length === 0,
  });
  const { data: ckData } = useQuery(GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS, {
    variables: { scryfallIds: shown.map((c) => c.id) },
    skip: shown.length === 0,
  });

  const tcgplayerProducts = useTcgplayerProducts(shown.map((c) => c.tcgplayer_id));

  const mpPrices = new Map<string, ManapoolPrice>(
    (mpData?.cardPricesByCards ?? []).map((p: ManapoolPrice) => [`${p.set_code.toLowerCase()}-${p.number}`, p])
  );
  const ckPrices = new Map<string, CardKingdomPrice>(
    (ckData?.cardKingdomPricesByScryfallIds ?? []).map((p: CardKingdomPrice) => [p.scryfallId, p])
  );

  const handleEbayClick = () => {
    trackAffiliateEvent('ebay_link_click', 'event', { artist_name: selected });
    if (userRole !== 'admin') logLinkClick({ variables: { artistName: selected, linkType: 'ebay' } });
  };

  return (
    <Box component="section" aria-label="Bring cards to get signed">
      <Box component="p" sx={styles.shopIntro}>
        Their most-played cards, with current prices. Order early so they arrive before the show.
      </Box>

      {artists.length > MAX_ARTIST_CHIPS ? (
        <Autocomplete
          options={artists}
          value={selected}
          onChange={(_, name) => { if (name) setSelected(name); }}
          disableClearable
          autoHighlight
          size="small"
          sx={styles.shopPicker}
          componentsProps={{ paper: { sx: shopPickerPaper } }}
          renderInput={(params) => (
            <TextField {...params} label={`Artist (${artists.length} attending)`} />
          )}
        />
      ) : artists.length > 1 && (
        <Box role="group" aria-label="Choose an artist" sx={styles.shopChips}>
          {artists.map((name) => (
            <FilterChip key={name} active={name === selected} onClick={() => setSelected(name)}>
              {name}
            </FilterChip>
          ))}
        </Box>
      )}

      {cards === null ? (
        <Box sx={styles.shopGrid} aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <Slab key={i} size="sm" aspectRatio="63 / 88" />
          ))}
        </Box>
      ) : cards.length === 0 ? (
        <Box component="p" sx={styles.emptyMessage}>No cards found for {selected}.</Box>
      ) : (
        <Box component="ul" sx={[styles.shopGrid, { listStyle: 'none', m: 0, p: 0 }]}>
          {cards.map((card) => {
            const mp = mpPrices.get(`${card.set.toLowerCase()}-${card.collector_number}`);
            const mpCents = mp?.price_cents_nm || mp?.price_cents_lp_plus || mp?.price_cents;
            const ck = ckPrices.get(card.id);
            const click = { artistName: selected, cardName: card.name, cardSet: card.set };
            return (
              <Box component="li" key={card.id} sx={styles.shopCard}>
                <Slab size="sm" src={cardImage(card)} alt={card.name} aspectRatio="63 / 88" imgProps={{ loading: 'lazy' }} />
                <Box component="h3" title={card.name} sx={styles.shopCardName}>{card.name}</Box>
                <Box sx={priceChipStyles.row}>
                  <PriceChip
                    label="MP"
                    value={mpCents ? formatCents(mpCents) : '-'}
                    title="Buy on Manapool"
                    href={manapoolUrl(card.set, card.collector_number, card.name, 'event')}
                    onClick={() => logPriceClick('manapool', click)}
                  />
                  {ck && (
                    <PriceChip
                      label="CK"
                      value={formatCents(ck.price)}
                      title="Buy on Card Kingdom"
                      href={cardKingdomUrl(ck.url, card.name, 'event')}
                      onClick={() => logPriceClick('cardkingdom', click)}
                    />
                  )}
                  {card.tcgplayer_id && card.prices?.usd && (
                    <PriceChip
                      label="TCG"
                      value={`$${card.prices.usd}`}
                      title="Buy on TCGplayer"
                      href={tcgplayerProductUrl(card.tcgplayer_id, 'event')}
                      onClick={() => logPriceClick('tcgplayer', click)}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      <Box sx={styles.shopFooter}>
        {shown.length > 1 && (
          <Box
            component="a"
            href={tcgplayerMassEntryUrl(
              shown.map((c) => ({
                name: c.name,
                set: c.set,
                collectorNumber: c.collector_number,
                tcgplayer: c.tcgplayer_id ? tcgplayerProducts.get(c.tcgplayer_id) : undefined,
              })),
              'event',
            )}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => logPriceClick('tcgplayer', { artistName: selected, cardName: `Mass entry (${shown.length} cards)` })}
            sx={styles.shopFooterLink}
          >
            <ShoppingCart size={14} aria-hidden />
            Buy all {shown.length} on TCGplayer
          </Box>
        )}
        <Box
          component="a"
          href={ebaySearchUrl(`${selected} signed mtg`, 'event')}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleEbayClick}
          sx={styles.shopFooterLink}
        >
          Already-signed {selected} cards on eBay
          <ArrowUpRight size={13} aria-hidden />
        </Box>
        <Box component={RouterLink} to={`/allcards/${encodeURIComponent(selected)}`} sx={styles.shopFooterLink}>
          Every {selected} card
        </Box>
      </Box>
      <Box component="p" sx={styles.shopDisclosure}>
        We may earn a commission on purchases through these links.{' '}
        <Box component={RouterLink} to="/affiliate-disclosure" sx={{ color: 'inherit' }}>Learn more</Box>
      </Box>
    </Box>
  );
};

export default EventShopSection;
