import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Link,
  Typography,
  Container,
  Paper,
  Button,
  Fab,
  IconButton,
} from "@mui/material";
import { AllCardsGridSkeleton } from "../shared/Skeletons";
import { ArrowUp, DeviceMobileCamera, DeviceMobileSpeaker, PenNib, Sparkle, Heart } from "@phosphor-icons/react";
import { GET_ARTIST_BY_NAME, GET_CARD_PRICES, GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS, GET_USER_CARD_COLLECTION } from "../graphql/queries";
import { TOGGLE_CARD_COLLECTION_FIELD, LOG_PRICE_CLICK } from "../graphql/mutations";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import { allCardsStyles } from "../../styles/all-cards-styles";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { colors, themeColors, spacing } from "../../styles/design-tokens";
import { FixedSizeList, ListChildComponentProps } from 'react-window';

interface Card {
  related_uris: any;
  id: string;
  name?: string;
  artist?: string;
  scryfall_uri?: string;
  set?: string;
  set_name?: string;
  collector_number?: string;
  released_at?: string;
  tcgplayer_id?: number;
  prices?: {
    usd?: string | null;
  };
  image_uris?: {
    border_crop: string;
  };
  card_faces?: {
    image_uris?: {
      normal: string;
    };
  }[];
}

interface ScryfallResponse {
  data: Card[];
  has_more: boolean;
  next_page?: string;
  total_cards: number;
}

interface CardData {
  data: Card[];
  total_cards: number;
}

interface CardsAndTotal {
  cards: Card[];
  totalCards: number;
}

interface CardPrice {
  id: string;
  name: string;
  set_code: string;
  number: string;
  price_cents_nm: number | null;
  price_cents_lp_plus: number | null;
  price_cents: number | null;
  price_cents_foil: number | null;
  url: string;
}

interface CardKingdomPrice {
  id: string;
  name: string;
  edition: string;
  condition: string;
  foil: boolean;
  price: number;
  url: string;
  scryfallId: string;
}

interface CollectionItem {
  id: string;
  scryfallId: string;
  cardName: string;
  set: string;
  collectorNumber: string;
  signedNonfoil: boolean;
  signedFoil: boolean;
  wishlistSigned: boolean;
  artistProof: boolean;
  artistProofFoil: boolean;
}

const normalizeArtistName = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\./g, " ")
    .replace(/-/g, " ")
    .replace(/"/g, "")
    .replace(/[()]/g, "")
    .replace(/'/g, " ")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .trim();

const COLLECTION_FIELDS = [
  { field: 'artistProof',    Icon: DeviceMobileCamera,  label: 'Artist Proof (nonfoil)', color: colors.accent.blue },
  { field: 'artistProofFoil',Icon: DeviceMobileSpeaker, label: 'Artist Proof (foil)',    color: colors.accent.orange },
  { field: 'signedNonfoil',  Icon: PenNib,             label: 'Signed (nonfoil)',        color: colors.accent.blueDark },
  { field: 'signedFoil',     Icon: Sparkle,            label: 'Signed (foil)',           color: themeColors.primary.main },
  { field: 'wishlistSigned', Icon: Heart,              label: 'Wishlist: want signed',   color: colors.accent.red },
] as const;

const CARD_COL_MIN_WIDTH = 220; // px — narrowest column before adding another
const GRID_GAP = 24;            // spacing.lg = 1.5rem
const STICKY_TOP = 68;          // height of the sticky nav rail in px

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

// ─── CardItem ────────────────────────────────────────────────────────────────
// Defined outside AllCards so React.memo works correctly and getCardPrice/
// getCardKingdomPrice lookups don't cause unnecessary re-renders of the whole list.

interface CardItemProps {
  card: Card;
  price: CardPrice | undefined;
  ckPrice: CardKingdomPrice | undefined;
  collectionItem: CollectionItem | undefined;
  isLoggedIn: boolean;
  onToggle: (card: Card, field: string) => void;
  onPriceClick: (platform: string, cardName: string, cardSet: string) => void;
}

const CardItem = memo(({ card, price, ckPrice, collectionItem, isLoggedIn, onToggle, onPriceClick }: CardItemProps) => {
  const formatPrice = (cents: number | null): string => {
    if (cents === null || cents === undefined) return '-';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const cardSlug = card.name
    ? card.name
        .toLowerCase()
        .replace(/[^a-z0-9']+/g, '-')
        .replace(/^-+|-+$/g, '')
    : '';

  const manapoolPrice = price?.price_cents_nm || price?.price_cents_lp_plus || price?.price_cents;

  const priceDisplay = cardSlug && (
    <Link
      href={`https://manapool.com/card/${card.set}/${card.collector_number}/${cardSlug}?ref=mtgartistconnection`}
      target="_blank"
      onClick={() => {
        if ((window as any).gtag) {
          (window as any).gtag("event", "manapool_price_click", {
            event_category: "affiliate_links",
            event_label: card.name,
            card_set: card.set,
          });
        }
        onPriceClick('manapool', card.name || '', card.set || '');
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        textDecoration: 'none',
        padding: '2px 4px',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
        '&:hover': { backgroundColor: 'rgba(45, 74, 54, 0.1)' },
      }}
    >
      {manapoolPrice && (
        <Typography sx={{ fontSize: '0.90rem', color: themeColors.primary.main, fontWeight: 600, textDecoration: 'underline' }}>
          {formatPrice(manapoolPrice)}
        </Typography>
      )}
      <Box sx={{ width: 20, height: 20, backgroundColor: themeColors.neutral.white, borderRadius: '3px', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Box component="img" src="/manapool-icon.ico" alt="Manapool" sx={{ width: 14, height: 14, objectFit: 'contain' }} />
      </Box>
    </Link>
  );

  const tcgplayerDisplay = card.tcgplayer_id && card.prices?.usd && (
    <Link
      href={`https://partner.tcgplayer.com/JkbQGE?u=https://www.tcgplayer.com/product/${card.tcgplayer_id}`}
      target="_blank"
      onClick={() => {
        if ((window as any).gtag) {
          (window as any).gtag("event", "tcgplayer_price_click", {
            event_category: "affiliate_links",
            event_label: card.name,
            card_set: card.set,
          });
        }
        onPriceClick('tcgplayer', card.name || '', card.set || '');
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        textDecoration: 'none',
        padding: '2px 4px',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
        '&:hover': { backgroundColor: 'rgba(45, 74, 54, 0.1)' },
      }}
    >
      <Typography sx={{ fontSize: '0.90rem', color: themeColors.primary.main, fontWeight: 600, textDecoration: 'underline' }}>
        ${card.prices.usd}
      </Typography>
      <Box sx={{ width: 20, height: 20, backgroundColor: themeColors.neutral.white, borderRadius: '3px', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
        <Box component="img" src="/tcgplayer.png" alt="TCGPlayer" sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center' }} />
      </Box>
    </Link>
  );

  const ckUrl = ckPrice?.url
    ? `${ckPrice.url}?partner=mtgartistconnection&utm_source=mtgartistconnection&utm_medium=affiliate&utm_campaign=mtgartistconnection`
    : `https://www.cardkingdom.com/mtg/${card.name?.toLowerCase().replace(/\s+/g, '-')}?partner=mtgartistconnection&utm_source=mtgartistconnection&utm_medium=affiliate&utm_campaign=mtgartistconnection`;

  const cardKingdomDisplay = ckPrice && (
    <Link
      href={ckUrl}
      target="_blank"
      onClick={() => {
        if ((window as any).gtag) {
          (window as any).gtag("event", "cardkingdom_price_click", {
            event_category: "affiliate_links",
            event_label: card.name,
            card_set: card.set,
          });
        }
        onPriceClick('cardkingdom', card.name || '', card.set || '');
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        textDecoration: 'none',
        padding: '2px 4px',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
        '&:hover': { backgroundColor: 'rgba(45, 74, 54, 0.1)' },
      }}
    >
      <Typography sx={{ fontSize: '0.90rem', color: themeColors.primary.main, fontWeight: 600, textDecoration: 'underline' }}>
        {formatPrice(ckPrice.price)}
      </Typography>
      <Box sx={{ width: 20, height: 20, backgroundColor: themeColors.neutral.white, borderRadius: '3px', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Box component="img" src="/cardkingdom.jpg" alt="Card Kingdom" sx={{ width: 14, height: 14, objectFit: 'contain' }} />
      </Box>
    </Link>
  );

  // Use native title attribute instead of MUI Tooltip — zero JS overhead, no portals or event listeners per card.
  const collectionControls = (
    <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center', mt: 0.5 }}>
      {COLLECTION_FIELDS.map(({ field, Icon, label, color }) => {
        const active = collectionItem ? (collectionItem as any)[field] : false;
        const tooltip = isLoggedIn ? label : "Log in to track your collection";
        return (
          <span key={field} title={tooltip}>
            <IconButton
              size="small"
              onClick={() => onToggle(card, field)}
              sx={{
                color: active ? color : themeColors.text.disabled,
                p: 0.5,
                cursor: isLoggedIn ? 'pointer' : 'default',
                '&:hover': { backgroundColor: isLoggedIn ? themeColors.neutral[100] : 'transparent' },
              }}
            >
              <Icon size={18} weight={active ? 'fill' : 'regular'} />
            </IconButton>
          </span>
        );
      })}
    </Box>
  );

  const imageSrc = card.image_uris?.border_crop ?? card.card_faces?.[0]?.image_uris?.normal;
  if (!imageSrc) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Link href={card?.scryfall_uri} target="_blank">
        <Box
          component="img"
          alt={card.artist || "Card"}
          src={imageSrc}
          sx={allCardsStyles.cardImage}
        />
      </Link>
      {collectionControls}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        {priceDisplay}
        {tcgplayerDisplay}
        {cardKingdomDisplay}
      </Box>
    </Box>
  );
});

// ─── VirtualRow ───────────────────────────────────────────────────────────────

interface VirtualRowData {
  rows: Card[][];
  columnWidth: number;
  getCardPrice: (card: Card) => CardPrice | undefined;
  getCardKingdomPrice: (card: Card) => CardKingdomPrice | undefined;
  cardCollection: Map<string, CollectionItem>;
  isLoggedIn: boolean;
  onToggle: (card: Card, field: string) => void;
  onPriceClick: (platform: string, cardName: string, cardSet: string) => void;
}

const VirtualRow = memo(({ index, style, data }: ListChildComponentProps<VirtualRowData>) => {
  const { rows, columnWidth, getCardPrice, getCardKingdomPrice, cardCollection, isLoggedIn, onToggle, onPriceClick } = data;
  const rowCards = rows[index] ?? [];
  return (
    <div style={{ ...style, display: 'flex', gap: GRID_GAP, boxSizing: 'border-box', paddingBottom: GRID_GAP }}>
      {rowCards.map((card) => (
        <div key={card.id} style={{ flex: `0 0 ${columnWidth}px`, minWidth: 0 }}>
          <CardItem
            card={card}
            price={getCardPrice(card)}
            ckPrice={getCardKingdomPrice(card)}
            collectionItem={cardCollection.get(card.id)}
            isLoggedIn={isLoggedIn}
            onToggle={onToggle}
            onPriceClick={onPriceClick}
          />
        </div>
      ))}
    </div>
  );
});

// ─── AllCards ─────────────────────────────────────────────────────────────────

const AllCards = () => {
  const { name: artist } = useParams<{ name?: string }>();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const [hideReprints, setHideReprints] = useState<boolean>(() => {
    try { return localStorage.getItem('mtgac-hide-reprints') === 'true'; }
    catch { return false; }
  });
  const [filterMode, setFilterMode] = useState<'all' | 'signed' | 'wishlisted' | 'artistProof'>('all');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [includeDigital, setIncludeDigital] = useState<boolean>(false);
  const [cardPrices, setCardPrices] = useState<Map<string, CardPrice>>(new Map());
  const [cardKingdomPrices, setCardKingdomPrices] = useState<Map<string, CardKingdomPrice>>(new Map());
  const [cardCollection, setCardCollection] = useState<Map<string, CollectionItem>>(new Map());
  const listRef = useRef<FixedSizeList>(null);
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  // Cached document-offset of the grid wrapper; updated on mount, resize, and cardData change.
  const scrollStartRef = useRef(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [sortByNewest, setSortByNewest] = useState<boolean>(false);
  const [isFetchingCards, setIsFetchingCards] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(() => window.innerWidth - 80);
  const [viewportHeight, setViewportHeight] = useState<number>(() => Math.max(300, window.innerHeight - STICKY_TOP));

  // Measure how far the grid wrapper is from the top of the document so the
  // window-scroll handler knows when to start offsetting the list.
  const measureScrollStart = useCallback(() => {
    if (gridWrapperRef.current) {
      scrollStartRef.current =
        gridWrapperRef.current.getBoundingClientRect().top + window.scrollY - STICKY_TOP;
    }
  }, []);

  useEffect(() => {
    const el = gridWrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    measureScrollStart();
    const onResize = () => {
      setViewportHeight(Math.max(300, window.innerHeight - STICKY_TOP));
      measureScrollStart();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measureScrollStart]);

  // Re-measure after cardData arrives — the controls section may shift layout.
  useEffect(() => {
    if (cardData) measureScrollStart();
  }, [cardData, measureScrollStart]);

  useEffect(() => {
    const onScroll = () => {
      const offset = Math.max(0, window.scrollY - scrollStartRef.current);
      listRef.current?.scrollTo(offset);
      setShowScrollTop(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [fetchCardPrices] = useLazyQuery(GET_CARD_PRICES, {
    onCompleted: (data) => {
      if (data?.cardPricesByCards) {
        const priceMap = new Map<string, CardPrice>();
        data.cardPricesByCards.forEach((price: CardPrice) => {
          const key = `${price.set_code.toLowerCase()}-${price.number}`;
          priceMap.set(key, price);
        });
        setCardPrices(priceMap);
      }
    },
    onError: (error) => {
      console.error('Error fetching card prices:', error);
    },
  });

  const [fetchCardKingdomPrices] = useLazyQuery(GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS, {
    onCompleted: (data) => {
      if (data?.cardKingdomPricesByScryfallIds) {
        const ckPriceMap = new Map<string, CardKingdomPrice>();
        data.cardKingdomPricesByScryfallIds.forEach((price: CardKingdomPrice) => {
          ckPriceMap.set(price.scryfallId, price);
        });
        setCardKingdomPrices(ckPriceMap);
      }
    },
    onError: (error) => {
      console.error('Error fetching CardKingdom prices:', error);
    },
  });

  const [fetchUserCardCollection] = useLazyQuery(GET_USER_CARD_COLLECTION, {
    onCompleted: (data) => {
      if (data?.userCardCollection) {
        const collectionMap = new Map<string, CollectionItem>();
        data.userCardCollection.forEach((item: CollectionItem) => {
          collectionMap.set(item.scryfallId, item);
        });
        setCardCollection(collectionMap);
      }
    },
    onError: (error) => {
      console.error('Error fetching card collection:', error);
    },
  });

  const [toggleCardCollectionField] = useMutation(TOGGLE_CARD_COLLECTION_FIELD, {
    onError: (error) => {
      console.error('Error toggling card collection field:', error);
    },
  });

  const [logPriceClick] = useMutation(LOG_PRICE_CLICK);

  const handlePriceClick = useCallback((platform: string, cardName: string, cardSet: string) => {
    if (userRole === 'admin') return;
    logPriceClick({ variables: { artistName: artist || '', platform, cardName, cardSet } });
  }, [userRole, artist, logPriceClick]);

  useEffect(() => {
    if (!artist) {
      navigate("/");
    }
  }, [artist, navigate]);

  useEffect(() => {
    setFilterMode('all');
  }, [artist]);

  usePageTitle(artist ? `All ${artist} Cards` : undefined);

  const { data: artistData, error, loading } = useQuery(GET_ARTIST_BY_NAME, {
    variables: { name: artist || "" },
    skip: !artist,
    fetchPolicy: 'network-only',
  });

  const [noResultsFromPrimary, setNoResultsFromPrimary] = useState(false);
  const fallbackInitiatedRef = useRef(false);
  useEffect(() => {
    setNoResultsFromPrimary(false);
    fallbackInitiatedRef.current = false;
  }, [artist]);

  const formattedArtistName = useMemo(() => {
    return artist?.split(" ").join(" ") || "";
  }, [artist]);

  const scryfallQuery = useMemo(() => {
    if (!artist) return null;
    const baseQuery = "artist%3A";
    const encodedArtistName = encodeURIComponent(formattedArtistName);
    const formattedQuery = `${baseQuery}"${encodedArtistName}"`;
    const gameFilter = includeDigital ? "" : "%28game%3Apaper%29+";
    return {
      withDuplicates: `https://api.scryfall.com/cards/search?as=grid&unique=prints&order=name&q=${gameFilter}%28${formattedQuery}%29`,
      withoutDuplicates: `https://api.scryfall.com/cards/search?as=grid&order=name&q=${gameFilter}%28${formattedQuery}%29`,
    };
  }, [formattedArtistName, artist, includeDigital]);

  useEffect(() => {
    if (!scryfallQuery) return;

    let cancelled = false;
    const accumulated: Card[] = [];
    const normalizedArtist = normalizeArtistName(artist || "");

    const run = async () => {
      setIsFetchingCards(true);
      setCardData(null);

      let nextUrl: string | undefined =
        hideReprints ? scryfallQuery.withoutDuplicates : scryfallQuery.withDuplicates;

      while (nextUrl) {
        const currentUrl: string = nextUrl;
        if (cancelled) break;
        try {
          const response = await axios.get<ScryfallResponse>(currentUrl);
          if (cancelled) break;

          const pageFiltered = response.data.data.filter((card: Card) => {
            const rawArtist = card.artist || "";
            const normalizedCard = normalizeArtistName(rawArtist);
            return (
              normalizedCard === normalizedArtist ||
              rawArtist.split(/[&,]/).some((n) => normalizeArtistName(n.trim()) === normalizedArtist)
            );
          });

          accumulated.push(...pageFiltered);
          // Render whatever we have so far — first page appears immediately
          setCardData({ data: [...accumulated], total_cards: accumulated.length });

          nextUrl = response.data.has_more ? response.data.next_page : undefined;
        } catch (err) {
          console.error("Error fetching cards:", err);
          break;
        }
      }

      // Scryfall returns 404 (throws) when there are no results, so cardData stays
      // null after the loop. Set it to an empty array so the "no results" UI renders.
      if (!cancelled && accumulated.length === 0) {
        setNoResultsFromPrimary(true);
        setCardData({ data: [], total_cards: 0 });
      }

      if (!cancelled) setIsFetchingCards(false);
    };

    run();
    return () => { cancelled = true; };
  }, [scryfallQuery, hideReprints, includeDigital, artist]);

  // Fallback: when the primary fetch returns 0 results, retry with scryfall_name if the
  // artist has been renamed on Scryfall but our DB still uses the old display name.
  // This runs as a separate effect so it naturally waits for artistData to resolve,
  // avoiding the race condition where the Scryfall fetch finishes before GraphQL does.
  useEffect(() => {
    if (!noResultsFromPrimary || fallbackInitiatedRef.current) return;
    const scryfallName = artistData?.artistByName?.scryfall_name;
    // If artistData hasn't loaded yet, keep noResultsFromPrimary true so we retry when it does.
    if (!scryfallName || normalizeArtistName(scryfallName) === normalizeArtistName(artist || "")) return;

    // Use a ref (no state change) so this effect isn't immediately cancelled by its own re-render.
    // The state reset happens after the fetch completes inside run().
    fallbackInitiatedRef.current = true;

    let cancelled = false;
    const accumulated: Card[] = [];
    const normalizedFallback = normalizeArtistName(scryfallName);

    const run = async () => {
      setIsFetchingCards(true);
      const gameFilter = includeDigital ? "" : "%28game%3Apaper%29+";
      const encodedFallback = encodeURIComponent(scryfallName);
      const withDupes = `https://api.scryfall.com/cards/search?as=grid&unique=prints&order=name&q=${gameFilter}%28artist%3A"${encodedFallback}"%29`;
      const withoutDupes = `https://api.scryfall.com/cards/search?as=grid&order=name&q=${gameFilter}%28artist%3A"${encodedFallback}"%29`;

      let nextUrl: string | undefined = hideReprints ? withoutDupes : withDupes;
      while (nextUrl) {
        const currentUrl: string = nextUrl;
        if (cancelled) break;
        try {
          const response = await axios.get<ScryfallResponse>(currentUrl);
          if (cancelled) break;
          const pageFiltered = response.data.data.filter((card: Card) => {
            const rawArtist = card.artist || "";
            const normalizedCard = normalizeArtistName(rawArtist);
            return (
              normalizedCard === normalizedFallback ||
              rawArtist.split(/[&,]/).some((n) => normalizeArtistName(n.trim()) === normalizedFallback)
            );
          });
          accumulated.push(...pageFiltered);
          if (accumulated.length > 0) {
            setCardData({ data: [...accumulated], total_cards: accumulated.length });
          }
          nextUrl = response.data.has_more ? response.data.next_page : undefined;
        } catch {
          break;
        }
      }
      if (!cancelled) {
        setNoResultsFromPrimary(false);
        setIsFetchingCards(false);
      }
    };

    run();
    return () => {
      cancelled = true;
      fallbackInitiatedRef.current = false;
    };
  }, [noResultsFromPrimary, artistData, artist, hideReprints, includeDigital]);

  const { cards, totalCards } = useMemo<CardsAndTotal>(() => {
    if (!cardData) {
      return { cards: [], totalCards: 0 };
    }
    let sortedCards = [...cardData.data];
    if (sortByNewest) {
      sortedCards.sort((a, b) => {
        const dateA = a.released_at || '';
        const dateB = b.released_at || '';
        return dateB.localeCompare(dateA);
      });
    }
    return { cards: sortedCards, totalCards: sortedCards.length };
  }, [cardData, sortByNewest]);

  const displayedCards = useMemo(() => {
    if (filterMode === 'signed') {
      return cards.filter(c => {
        const col = cardCollection.get(c.id ?? '');
        return col?.signedNonfoil || col?.signedFoil;
      });
    }
    if (filterMode === 'wishlisted') {
      return cards.filter(c => cardCollection.get(c.id ?? '')?.wishlistSigned);
    }
    if (filterMode === 'artistProof') {
      return cards.filter(c => {
        const col = cardCollection.get(c.id ?? '');
        return col?.artistProof || col?.artistProofFoil;
      });
    }
    return cards;
  }, [cards, filterMode, cardCollection]);

  useEffect(() => {
    // Wait until all Scryfall pages are in before sending price/collection requests,
    // so we don't fire once-per-page for artists with large card counts.
    if (cards.length === 0 || isFetchingCards) return;

    const cardLookups = cards
      .filter(card => card.set && card.collector_number)
      .map(card => ({
        set_code: card.set!.toUpperCase(),
        number: card.collector_number!,
      }));

    if (cardLookups.length > 0) {
      fetchCardPrices({ variables: { cards: cardLookups } });
    }

    const uniqueScryfallIds = Array.from(new Set(cards.map(card => card.id).filter(Boolean)));
    if (uniqueScryfallIds.length > 0) {
      fetchCardKingdomPrices({ variables: { scryfallIds: uniqueScryfallIds } });
      if (isLoggedIn) {
        fetchUserCardCollection({ variables: { scryfallIds: uniqueScryfallIds } });
      }
    }
  }, [cards, isFetchingCards, fetchCardPrices, fetchCardKingdomPrices, fetchUserCardCollection, isLoggedIn]);

  const signedCount = useMemo(
    () => Array.from(cardCollection.values()).filter(item => item.signedNonfoil || item.signedFoil).length,
    [cardCollection]
  );

  const wishlistCount = useMemo(
    () => Array.from(cardCollection.values()).filter(item => item.wishlistSigned).length,
    [cardCollection]
  );

  const artistProofCount = useMemo(
    () => Array.from(cardCollection.values()).filter(item => item.artistProof || item.artistProofFoil).length,
    [cardCollection]
  );

  const getCardPrice = useCallback((card: Card): CardPrice | undefined => {
    if (!card.set || !card.collector_number) return undefined;
    const key = `${card.set.toLowerCase()}-${card.collector_number}`;
    return cardPrices.get(key);
  }, [cardPrices]);

  const getCardKingdomPrice = useCallback((card: Card): CardKingdomPrice | undefined => {
    if (!card.id) return undefined;
    return cardKingdomPrices.get(card.id);
  }, [cardKingdomPrices]);

  const handleCollectionToggle = useCallback((card: Card, field: string) => {
    if (!isLoggedIn || !card.id || !card.name || !card.set || !card.collector_number) return;
    toggleCardCollectionField({
      variables: {
        scryfallId: card.id,
        cardName: card.name,
        artistName: artist || "",
        set: card.set,
        collectorNumber: card.collector_number,
        field,
      },
      onCompleted: (data) => {
        if (data?.toggleCardCollectionField) {
          setCardCollection(prev => {
            const next = new Map(prev);
            next.set(data.toggleCardCollectionField.scryfallId, data.toggleCardCollectionField);
            return next;
          });
        }
      },
    });
  }, [isLoggedIn, toggleCardCollectionField, artist]);

  const columnCount = useMemo(
    () => Math.max(1, Math.floor((containerWidth + GRID_GAP) / (CARD_COL_MIN_WIDTH + GRID_GAP))),
    [containerWidth]
  );

  // Effective column width drives row height so images never clip on resize.
  const columnWidth = useMemo(
    () => (containerWidth - (columnCount - 1) * GRID_GAP) / columnCount,
    [containerWidth, columnCount]
  );

  // border_crop images are 480×680px (aspect ratio 480/680 ≈ 0.706).
  const rowHeight = useMemo(
    () => Math.ceil(columnWidth * (680 / 480)) + 80 + GRID_GAP,
    [columnWidth]
  );

  const rows = useMemo(
    () => chunkArray(displayedCards, columnCount),
    [displayedCards, columnCount]
  );

  const itemData = useMemo<VirtualRowData>(
    () => ({
      rows,
      columnWidth,
      getCardPrice,
      getCardKingdomPrice,
      cardCollection,
      isLoggedIn,
      onToggle: handleCollectionToggle,
      onPriceClick: handlePriceClick,
    }),
    [rows, columnWidth, getCardPrice, getCardKingdomPrice, cardCollection, isLoggedIn, handleCollectionToggle, handlePriceClick]
  );

  const totalListHeight = rows.length * rowHeight;

  // When column count changes the list re-chunks, so scroll back to top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [columnCount]);

  const handleCheck = () => {
    setHideReprints(prev => {
      const next = !prev;
      try { localStorage.setItem('mtgac-hide-reprints', String(next)); } catch {}
      return next;
    });
  };

  const handleExpandSearch = () => {
    setIncludeDigital(true);
  };

  if (!artist) return null;
  // Don't gate the whole page on the GraphQL artist query — Scryfall cards fetch in
  // parallel and should be visible as soon as the first page arrives.
  // Only block for definitive error states once the query has settled.
  if (error)
    return (
      <Box sx={allCardsStyles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={allCardsStyles.wrapper}>
            <Typography sx={allCardsStyles.noCards}>
              Error loading artist: {error.message}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  if (!loading && !artistData?.artistByName)
    return (
      <Box sx={allCardsStyles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={allCardsStyles.wrapper}>
            <Typography sx={allCardsStyles.noCards}>
              Artist not found
            </Typography>
          </Paper>
        </Container>
      </Box>
    );

  return (
    <Box sx={allCardsStyles.container}>
      {/* Full-bleed hero banner — image fades in once GraphQL resolves */}
      <Box sx={allCardsStyles.heroBanner}>
        {artistData?.artistByName?.filename && (
          <img
            src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${artistData.artistByName.filename}.jpeg`}
            alt={`${artist} banner`}
          />
        )}
        <Box sx={allCardsStyles.bannerGradient} />
        <Box sx={allCardsStyles.bannerNameOverlay}>
          <Container maxWidth="lg" disableGutters>
            <Box sx={{ px: { xs: spacing.lg, md: spacing.xxl }, pb: { xs: spacing.lg, md: spacing.xl } }}>
              <Typography sx={allCardsStyles.bannerHeroName}>
                {artist}
              </Typography>
              <Typography sx={allCardsStyles.bannerAltName}>
                All Cards
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Sticky navigation rail */}
      <Box sx={allCardsStyles.stickyRail}>
        <Container maxWidth="lg">
          <Box sx={allCardsStyles.stickyRailInner}>
            <Typography sx={allCardsStyles.stickyName}>
              All {artist} Cards
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Link
              href={`/artist/${artist}`}
              underline="none"
              sx={allCardsStyles.stickyCtaLink}
            >
              View Artist Details
            </Link>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: spacing.xl }}>
        <Paper elevation={0} sx={allCardsStyles.wrapper}>
          <Box sx={allCardsStyles.controlsSection}>
            <Box>
              <Typography sx={allCardsStyles.cardCount}>
                {displayedCards.length} {displayedCards.length === 1 ? 'card' : 'cards'} found
              </Typography>
              {isLoggedIn && (signedCount > 0 || wishlistCount > 0 || artistProofCount > 0) && (
                <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: 0.5 }}>
                  {signedCount > 0 && (
                    <Box
                      component="span"
                      onClick={() => setFilterMode(f => f === 'signed' ? 'all' : 'signed')}
                      sx={{
                        cursor: 'pointer',
                        textDecoration: filterMode === 'signed' ? 'underline' : 'none',
                        fontWeight: filterMode === 'signed' ? 600 : 400,
                      }}
                    >
                      {signedCount} signed
                    </Box>
                  )}
                  {signedCount > 0 && wishlistCount > 0 && ' · '}
                  {wishlistCount > 0 && (
                    <Box
                      component="span"
                      onClick={() => setFilterMode(f => f === 'wishlisted' ? 'all' : 'wishlisted')}
                      sx={{
                        cursor: 'pointer',
                        textDecoration: filterMode === 'wishlisted' ? 'underline' : 'none',
                        fontWeight: filterMode === 'wishlisted' ? 600 : 400,
                      }}
                    >
                      {wishlistCount} wishlisted
                    </Box>
                  )}
                  {(signedCount > 0 || wishlistCount > 0) && artistProofCount > 0 && ' · '}
                  {artistProofCount > 0 && (
                    <Box
                      component="span"
                      onClick={() => setFilterMode(f => f === 'artistProof' ? 'all' : 'artistProof')}
                      sx={{
                        cursor: 'pointer',
                        textDecoration: filterMode === 'artistProof' ? 'underline' : 'none',
                        fontWeight: filterMode === 'artistProof' ? 600 : 400,
                      }}
                    >
                      {artistProofCount} artist proof
                    </Box>
                  )}
                  {filterMode !== 'all' && (
                    <Box
                      component="span"
                      onClick={() => setFilterMode('all')}
                      sx={{ cursor: 'pointer', fontSize: '0.75rem', ml: 1, opacity: 0.6, '&:hover': { opacity: 1 } }}
                    >
                      × clear filter
                    </Box>
                  )}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sortByNewest}
                    onChange={() => setSortByNewest(!sortByNewest)}
                    sx={allCardsStyles.checkbox}
                    disabled={!cardData}
                  />
                }
                label="Sort by Release (Newest)"
                sx={allCardsStyles.checkboxLabel}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hideReprints}
                    onChange={handleCheck}
                    sx={allCardsStyles.checkbox}
                    disabled={!cardData}
                  />
                }
                label="Hide Reprints"
                sx={allCardsStyles.checkboxLabel}
              />

              <Link href={`/artistcardbreakdown/${artist}`} underline="none">
                <Button sx={allCardsStyles.expandButton}>
                  Card Statistics
                </Button>
              </Link>
            </Box>
          </Box>

          {totalCards === 0 && cardData && (
            <Typography sx={allCardsStyles.noCards}>
              No results found. This artist may have only done digital cards for Arena or MTG-related artwork such as Vanguard.
              {!includeDigital && (
                <>
                  {" "}
                  <Button
                    onClick={handleExpandSearch}
                    sx={{ ...allCardsStyles.expandButton, ml: 1 }}
                  >
                    Expand search to include digital cards
                  </Button>
                </>
              )}
            </Typography>
          )}

          <Box
            ref={gridWrapperRef}
            sx={{
              mt: spacing.xl,
              width: '100%',
              // Reserve the full virtual scroll height so the page is scrollable.
              height: cardData ? totalListHeight : 'auto',
            }}
          >
            {!cardData ? (
              <AllCardsGridSkeleton count={12} />
            ) : (
              <div style={{ position: 'sticky', top: STICKY_TOP, height: viewportHeight }}>
                <FixedSizeList
                  ref={listRef}
                  height={viewportHeight}
                  itemCount={rows.length}
                  itemSize={rowHeight}
                  itemData={itemData}
                  width={containerWidth}
                  overscanCount={3}
                  style={{ overflow: 'hidden', outline: 'none' }}
                >
                  {VirtualRow}
                </FixedSizeList>
              </div>
            )}
          </Box>
        </Paper>
      </Container>

      {showScrollTop && (
        <Fab
          color="primary"
          onClick={scrollToTop}
          size="medium"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 96,
            bgcolor: colors.primary.main,
            '&:hover': { bgcolor: colors.primary.dark },
            zIndex: 999,
          }}
        >
          <ArrowUp size={24} />
        </Fab>
      )}
    </Box>
  );
};

export default AllCards;
