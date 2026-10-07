import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  memo,
  MouseEvent,
} from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useParams } from "react-router";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Divider,
  FormControlLabel,
  Fab,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { AllCardsGridSkeleton } from "../shared/Skeletons";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowsClockwise, ArrowsDownUp, CaretDown, Check, DeviceMobileCamera, DeviceMobileSpeaker, PenNib, Sparkle, Heart } from "@phosphor-icons/react";
import { GET_ARTIST_BY_NAME, GET_CARD_PRICES, GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS, GET_USER_CARD_COLLECTION } from "../graphql/queries";
import { TOGGLE_CARD_COLLECTION_FIELD, LOG_PRICE_CLICK } from "../graphql/mutations";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import { allCardsStyles, CARD_COL_MIN_WIDTH, CARD_METRICS, RAIL_HEIGHT } from "../../styles/all-cards-styles";
import artistCardOverrides from "../../data/artist-card-overrides.json";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { colors, themeColors, vault, vaultLayout } from "../../styles/design-tokens";
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import Slab from "../shared/Slab";
import GlowPill from "../shared/GlowPill";
import MonoLabel from "../shared/MonoLabel";
import FilterChip from "../shared/FilterChip";

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
      border_crop?: string;
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
  { field: 'artistProof',    Icon: DeviceMobileCamera,  label: 'Artist Proof (nonfoil)', shortLabel: 'AP',       color: colors.accent.blue },
  { field: 'artistProofFoil',Icon: DeviceMobileSpeaker, label: 'Artist Proof (foil)',    shortLabel: 'AP Foil',  color: colors.accent.orange },
  { field: 'signedNonfoil',  Icon: PenNib,             label: 'Signed (nonfoil)',        shortLabel: 'Signed',   color: colors.accent.blueDark },
  { field: 'signedFoil',     Icon: Sparkle,            label: 'Signed (foil)',           shortLabel: 'Signed F', color: themeColors.primary.main },
  { field: 'wishlistSigned', Icon: Heart,              label: 'Wishlist: want signed',   shortLabel: 'Wishlist', color: colors.accent.red },
] as const;

const ROW_TOP_PAD = 6;          // headroom so the slab hover lift isn't clipped by the list

type FilterMode = 'all' | 'signed' | 'wishlisted' | 'artistProof';

const COLLECTION_FILTERS: { mode: Exclude<FilterMode, 'all'>; label: string; title: string }[] = [
  { mode: 'signed',      label: 'Signed',        title: 'Cards you have signed' },
  { mode: 'artistProof', label: 'Artist proofs', title: 'Cards you have artist proofs of' },
  { mode: 'wishlisted',  label: 'Wishlist',      title: 'Cards on your signing wishlist' },
];

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

// Everything below the slab has a fixed height so the virtualized list can use
// one row height. Derived from the column width and viewport.
interface CardLayout {
  m: typeof CARD_METRICS.desktop;
  /** Price chips stack the label above the value when three won't fit side by side. */
  pricesStacked: boolean;
  priceHeight: number;
  cellHeight: number;
  /** Touch devices can't hover for tooltips, so cells show a short text label. */
  showCellLabels: boolean;
  /** Mobile wraps the five toggles 3 + 2 for bigger tap targets. */
  stripTwoRows: boolean;
  rowHeight: number;
}

function getCardLayout(columnWidth: number, isMobile: boolean, isTouch: boolean): CardLayout {
  const m = isMobile ? CARD_METRICS.mobile : CARD_METRICS.desktop;
  const pricesStacked = (columnWidth - 12) / 3 < 72;
  const priceHeight = pricesStacked ? m.priceHeightStacked : m.priceHeight;
  const cellHeight = isTouch ? m.cellHeightTouch : m.cellHeight;
  const stripTwoRows = isMobile;
  const stripHeight = (stripTwoRows ? cellHeight * 2 + 1 : cellHeight) + 2;
  // Slab = padding + 1px border on each side around a 63:88 art window.
  const slabInner = columnWidth - 2 * m.slabPadding - 2;
  const slabHeight = slabInner * (88 / 63) + 2 * m.slabPadding + 2;
  const below = m.infoGap + m.nameHeight + m.metaHeight + m.pricesGap + priceHeight + m.stripGap + stripHeight;
  return {
    m,
    pricesStacked,
    priceHeight,
    cellHeight,
    showCellLabels: isTouch,
    stripTwoRows,
    rowHeight: Math.ceil(slabHeight + below) + m.rowGap + ROW_TOP_PAD,
  };
}

interface PriceChipProps {
  label: string;
  value: string;
  href: string;
  title: string;
  layout: CardLayout;
  onClick: () => void;
}

const PriceChip = ({ label, value, href, title, layout, onClick }: PriceChipProps) => (
  <Box
    component="a"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    title={title}
    aria-label={`${title}: ${value}`}
    onClick={onClick}
    sx={[
      allCardsStyles.priceChip,
      layout.pricesStacked && allCardsStyles.priceChipStacked,
      { height: layout.priceHeight },
    ]}
  >
    <span className="price-label">{label}</span>
    <span className="price-value">{value}</span>
  </Box>
);

// ─── CardItem ────────────────────────────────────────────────────────────────
// Defined outside AllCards so React.memo works correctly and getCardPrice/
// getCardKingdomPrice lookups don't cause unnecessary re-renders of the whole list.

interface CardItemProps {
  card: Card;
  price: CardPrice | undefined;
  ckPrice: CardKingdomPrice | undefined;
  collectionItem: CollectionItem | undefined;
  isLoggedIn: boolean;
  layout: CardLayout;
  onToggle: (card: Card, field: string) => void;
  onPriceClick: (platform: string, cardName: string, cardSet: string) => void;
}

const CardItem = memo(({ card, price, ckPrice, collectionItem, isLoggedIn, layout, onToggle, onPriceClick }: CardItemProps) => {
  const [showBack, setShowBack] = useState(false);
  const { m } = layout;

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
    <PriceChip
      label="MP"
      value={manapoolPrice ? formatPrice(manapoolPrice) : '-'}
      title="Buy on Manapool"
      layout={layout}
      href={`https://manapool.com/card/${card.set}/${card.collector_number}/${cardSlug}?ref=mtgartistconnection`}
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
    />
  );

  const tcgplayerDisplay = card.tcgplayer_id && card.prices?.usd && (
    <PriceChip
      label="TCG"
      value={`$${card.prices.usd}`}
      title="Buy on TCGplayer"
      layout={layout}
      href={`https://partner.tcgplayer.com/JkbQGE?u=https://www.tcgplayer.com/product/${card.tcgplayer_id}`}
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
    />
  );

  const ckUrl = ckPrice?.url
    ? `${ckPrice.url}?partner=mtgartistconnection&utm_source=mtgartistconnection&utm_medium=affiliate&utm_campaign=mtgartistconnection`
    : `https://www.cardkingdom.com/mtg/${card.name?.toLowerCase().replace(/\s+/g, '-')}?partner=mtgartistconnection&utm_source=mtgartistconnection&utm_medium=affiliate&utm_campaign=mtgartistconnection`;

  const cardKingdomDisplay = ckPrice && (
    <PriceChip
      label="CK"
      value={formatPrice(ckPrice.price)}
      title="Buy on Card Kingdom"
      layout={layout}
      href={ckUrl}
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
    />
  );

  // Use native title attribute instead of MUI Tooltip — zero JS overhead, no portals or event listeners per card.
  // On touch devices (hover: none), show a short text label in each cell since hover tooltips are inaccessible.
  const collectionControls = (
    <Box
      role="group"
      aria-label="Your collection"
      sx={[
        allCardsStyles.strip,
        {
          mt: `${m.stripGap}px`,
          gridTemplateColumns: layout.stripTwoRows ? 'repeat(6, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))',
          gridAutoRows: `${layout.cellHeight}px`,
        },
      ]}
    >
      {COLLECTION_FIELDS.map(({ field, Icon, label, shortLabel, color }, i) => {
        const active = collectionItem ? (collectionItem as any)[field] : false;
        const tooltip = isLoggedIn ? label : "Log in to track your collection";
        return (
          <Box
            key={field}
            component="button"
            type="button"
            title={tooltip}
            onClick={() => onToggle(card, field)}
            aria-label={tooltip}
            aria-pressed={!!active}
            sx={[
              allCardsStyles.stripCell,
              {
                color: active ? color : vault.faint,
                cursor: isLoggedIn ? 'pointer' : 'default',
                gridColumn: layout.stripTwoRows ? `span ${i < 3 ? 2 : 3}` : undefined,
              },
            ]}
          >
            <Icon size={layout.showCellLabels ? 17 : 16} weight={active ? 'fill' : 'regular'} aria-hidden />
            {layout.showCellLabels && (
              <Box component="span" sx={allCardsStyles.stripLabel}>{shortLabel}</Box>
            )}
          </Box>
        );
      })}
    </Box>
  );

  const isTwoFaced = !!(card.card_faces && card.card_faces.length >= 2 && card.card_faces[1]?.image_uris);
  const imageSrc = showBack && card.card_faces?.[1]?.image_uris
    ? (card.card_faces[1].image_uris.border_crop ?? card.card_faces[1].image_uris.normal)
    : (card.image_uris?.border_crop ?? card.card_faces?.[0]?.image_uris?.border_crop ?? card.card_faces?.[0]?.image_uris?.normal);
  if (!imageSrc) return null;

  const isSigned = !!(collectionItem?.signedNonfoil || collectionItem?.signedFoil);
  const setLine = [card.set?.toUpperCase(), card.collector_number && `#${card.collector_number}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box sx={allCardsStyles.card}>
      <Box sx={allCardsStyles.artWrap}>
        <Box
          component="a"
          href={card?.scryfall_uri}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${card.name ?? 'Card'} on Scryfall`}
          sx={allCardsStyles.artLink}
        >
          <Slab
            size="sm"
            src={imageSrc}
            alt={card.name || card.artist || "Card"}
            aspectRatio="63 / 88"
            interactive
            topRight={isSigned ? (
              <GlowPill variant="onArt" dot={false} sx={allCardsStyles.signedBadge}>SIGNED</GlowPill>
            ) : undefined}
          />
        </Box>
        {isTwoFaced && (
          <IconButton
            size="small"
            title={showBack ? "Show front face" : "Show back face"}
            aria-label={showBack ? "Show front face" : "Show back face"}
            onClick={(e) => { e.preventDefault(); setShowBack((prev) => !prev); }}
            sx={allCardsStyles.flipButton}
          >
            <ArrowsClockwise size={20} />
          </IconButton>
        )}
      </Box>

      <Box sx={{ mt: `${m.infoGap}px` }}>
        <Box component="h3" title={card.name} sx={[allCardsStyles.name, { height: m.nameHeight, lineHeight: `${m.nameHeight}px` }]}>
          {card.name}
        </Box>
        <MonoLabel size={11} tracking="tight" sx={[allCardsStyles.meta, { height: m.metaHeight, lineHeight: `${m.metaHeight}px` }]}>
          {setLine}
        </MonoLabel>
      </Box>

      <Box sx={[allCardsStyles.prices, { mt: `${m.pricesGap}px`, height: layout.priceHeight }]}>
        {priceDisplay}
        {cardKingdomDisplay}
        {tcgplayerDisplay}
      </Box>

      {collectionControls}
    </Box>
  );
});

// ─── VirtualRow ───────────────────────────────────────────────────────────────

interface VirtualRowData {
  rows: Card[][];
  columnWidth: number;
  layout: CardLayout;
  getCardPrice: (card: Card) => CardPrice | undefined;
  getCardKingdomPrice: (card: Card) => CardKingdomPrice | undefined;
  cardCollection: Map<string, CollectionItem>;
  isLoggedIn: boolean;
  onToggle: (card: Card, field: string) => void;
  onPriceClick: (platform: string, cardName: string, cardSet: string) => void;
}

const VirtualRow = memo(({ index, style, data }: ListChildComponentProps<VirtualRowData>) => {
  const { rows, columnWidth, layout, getCardPrice, getCardKingdomPrice, cardCollection, isLoggedIn, onToggle, onPriceClick } = data;
  const rowCards = rows[index] ?? [];
  return (
    <div style={{ ...style, display: 'flex', gap: layout.m.columnGap, boxSizing: 'border-box', paddingBottom: layout.m.rowGap, paddingTop: ROW_TOP_PAD }}>
      {rowCards.map((card) => (
        <div key={card.id} style={{ flex: `0 0 ${columnWidth}px`, minWidth: 0 }}>
          <CardItem
            card={card}
            price={getCardPrice(card)}
            ckPrice={getCardKingdomPrice(card)}
            collectionItem={cardCollection.get(card.id)}
            isLoggedIn={isLoggedIn}
            layout={layout}
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
  const [searchParams, setSearchParams] = useSearchParams();
  const showParam = searchParams.get('show');
  // Collection filters only apply when logged in; ignore a stale ?show= otherwise.
  const filterMode: FilterMode =
    isLoggedIn && COLLECTION_FILTERS.some(f => f.mode === showParam) ? (showParam as FilterMode) : 'all';
  const setFilterMode = useCallback((mode: FilterMode) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (mode === 'all') next.delete('show');
      else next.set('show', mode);
      return next;
    }, { replace: true });
  }, [setSearchParams]);
  const isMobile = useMediaQuery(`(max-width:${vaultLayout.mobileMax}px)`);
  const isTouch = useMediaQuery('(hover: none)');
  const stickyTop = isMobile ? RAIL_HEIGHT.mobile : RAIL_HEIGHT.desktop;
  const [sortMenuAnchor, setSortMenuAnchor] = useState<HTMLElement | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [includeDigital, setIncludeDigital] = useState<boolean>(false);
  const [cardPrices, setCardPrices] = useState<Map<string, CardPrice>>(new Map());
  const [cardKingdomPrices, setCardKingdomPrices] = useState<Map<string, CardKingdomPrice>>(new Map());
  const [cardCollection, setCardCollection] = useState<Map<string, CollectionItem>>(new Map());
  const cardCollectionRef = useRef(cardCollection);
  useEffect(() => { cardCollectionRef.current = cardCollection; }, [cardCollection]);
  const [toastError, setToastError] = useState<string | null>(null);
  const listRef = useRef<FixedSizeList>(null);
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  // Cached document-offset of the grid wrapper; updated on mount, resize, and cardData change.
  const scrollStartRef = useRef(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [sortByNewest, setSortByNewest] = useState<boolean>(false);
  const [isFetchingCards, setIsFetchingCards] = useState<boolean>(false);
  const [overrideCards, setOverrideCards] = useState<Card[]>([]);
  const [containerWidth, setContainerWidth] = useState<number>(
    () => window.innerWidth - (window.innerWidth <= vaultLayout.mobileMax ? 36 : 80),
  );
  const [windowHeight, setWindowHeight] = useState<number>(() => window.innerHeight);
  const viewportHeight = Math.max(300, windowHeight - stickyTop);

  // Measure how far the grid wrapper is from the top of the document so the
  // window-scroll handler knows when to start offsetting the list.
  const measureScrollStart = useCallback(() => {
    if (gridWrapperRef.current) {
      scrollStartRef.current =
        gridWrapperRef.current.getBoundingClientRect().top + window.scrollY - stickyTop;
    }
  }, [stickyTop]);

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
      setWindowHeight(window.innerHeight);
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

  // Fetch any cards manually mapped to this artist that Scryfall doesn't credit them for.
  useEffect(() => {
    setOverrideCards([]);
    if (!artist) return;

    const overrideIds: string[] =
      (artistCardOverrides as Record<string, string[]>)[normalizeArtistName(artist)] ?? [];
    if (overrideIds.length === 0) return;

    let cancelled = false;
    const run = async () => {
      const fetched: Card[] = [];
      for (const chunk of chunkArray(overrideIds, 75)) {
        if (cancelled) break;
        try {
          const response = await axios.post<{ data: Card[]; not_found: unknown[] }>(
            'https://api.scryfall.com/cards/collection',
            { identifiers: chunk.map((id) => ({ id })) },
          );
          if (!cancelled) fetched.push(...response.data.data);
        } catch (err) {
          console.error('Error fetching artist override cards:', err);
        }
      }
      if (!cancelled) setOverrideCards(fetched);
    };
    run();
    return () => { cancelled = true; };
  }, [artist]);

  const { cards, totalCards } = useMemo<CardsAndTotal>(() => {
    if (!cardData) {
      return { cards: [], totalCards: 0 };
    }

    const mainIds = new Set(cardData.data.map((c) => c.id));
    let newOverrides = overrideCards.filter((c) => !mainIds.has(c.id));
    if (hideReprints) {
      const seenNames = new Set<string>();
      newOverrides = newOverrides.filter((c) => {
        const name = c.name ?? '';
        if (seenNames.has(name)) return false;
        seenNames.add(name);
        return true;
      });
    }

    const sortedCards = [...cardData.data, ...newOverrides];
    if (sortByNewest) {
      sortedCards.sort((a, b) =>
        (b.released_at || '').localeCompare(a.released_at || ''),
      );
    } else {
      sortedCards.sort((a, b) => {
        const nameCompare = (a.name ?? '').localeCompare(b.name ?? '');
        if (nameCompare !== 0) return nameCompare;
        return (a.released_at ?? '').localeCompare(b.released_at ?? '');
      });
    }
    return { cards: sortedCards, totalCards: sortedCards.length };
  }, [cardData, sortByNewest, overrideCards, hideReprints]);

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

    // Snapshot current state for rollback if the mutation fails.
    const previous = cardCollectionRef.current.get(card.id);

    // Build the optimistic item — start from existing or create a blank entry.
    const base: CollectionItem = previous ?? {
      id: card.id,
      scryfallId: card.id,
      cardName: card.name,
      set: card.set,
      collectorNumber: card.collector_number,
      signedNonfoil: false,
      signedFoil: false,
      wishlistSigned: false,
      artistProof: false,
      artistProofFoil: false,
    };
    const optimistic: CollectionItem = { ...base, [field]: !(base as any)[field] };

    setCardCollection(prev => {
      const next = new Map(prev);
      next.set(card.id, optimistic);
      return next;
    });

    toggleCardCollectionField({
      variables: {
        scryfallId: card.id,
        cardName: card.name,
        artistName: (artist || "").replace(/\./g, ''),
        set: card.set,
        collectorNumber: card.collector_number,
        field,
      },
      onCompleted: (data) => {
        if (data?.toggleCardCollectionField) {
          // Merge server response with optimistic item so cardName/set/collectorNumber aren't lost
          // (the mutation response only returns id, scryfallId, and the boolean fields).
          setCardCollection(prev => {
            const next = new Map(prev);
            const existing = next.get(data.toggleCardCollectionField.scryfallId);
            next.set(data.toggleCardCollectionField.scryfallId, {
              ...existing,
              ...data.toggleCardCollectionField,
            } as CollectionItem);
            return next;
          });
        }
      },
      onError: () => {
        setCardCollection(prev => {
          const next = new Map(prev);
          if (previous) {
            next.set(card.id, previous);
          } else {
            next.delete(card.id);
          }
          return next;
        });
        setToastError('Could not save. Please try again.');
      },
    });
  }, [isLoggedIn, toggleCardCollectionField, artist]);

  const columnGap = isMobile ? CARD_METRICS.mobile.columnGap : CARD_METRICS.desktop.columnGap;

  // Mobile is always two columns; wider screens auto-fill at CARD_COL_MIN_WIDTH.
  const columnCount = useMemo(
    () => isMobile
      ? 2
      : Math.max(1, Math.floor((containerWidth + columnGap) / (CARD_COL_MIN_WIDTH + columnGap))),
    [containerWidth, columnGap, isMobile]
  );

  // Effective column width drives row height so images never clip on resize.
  const columnWidth = useMemo(
    () => (containerWidth - (columnCount - 1) * columnGap) / columnCount,
    [containerWidth, columnCount, columnGap]
  );

  const layout = useMemo(
    () => getCardLayout(columnWidth, isMobile, isTouch),
    [columnWidth, isMobile, isTouch]
  );
  const rowHeight = layout.rowHeight;

  const rows = useMemo(
    () => chunkArray(displayedCards, columnCount),
    [displayedCards, columnCount]
  );

  const itemData = useMemo<VirtualRowData>(
    () => ({
      rows,
      columnWidth,
      layout,
      getCardPrice,
      getCardKingdomPrice,
      cardCollection,
      isLoggedIn,
      onToggle: handleCollectionToggle,
      onPriceClick: handlePriceClick,
    }),
    [rows, columnWidth, layout, getCardPrice, getCardKingdomPrice, cardCollection, isLoggedIn, handleCollectionToggle, handlePriceClick]
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

  const handleSortSelect = (newest: boolean) => {
    setSortByNewest(newest);
    setSortMenuAnchor(null);
  };

  if (!artist) return null;
  // Don't gate the whole page on the GraphQL artist query — Scryfall cards fetch in
  // parallel and should be visible as soon as the first page arrives.
  // Only block for definitive error states once the query has settled.
  if (error)
    return (
      <Box sx={allCardsStyles.page}>
        <Box component="p" sx={[allCardsStyles.statusMessage, { m: 0 }]}>
          Error loading artist: {error.message}
        </Box>
      </Box>
    );
  if (!loading && !artistData?.artistByName)
    return (
      <Box sx={allCardsStyles.page}>
        <Box component="p" sx={[allCardsStyles.statusMessage, { m: 0 }]}>
          Artist not found
        </Box>
      </Box>
    );

  const displayName = artistData?.artistByName?.name ?? artist;
  const sortLabel = sortByNewest ? 'Newest first' : 'Name (A–Z)';
  const isFiltered = filterMode !== 'all';

  let gridContent;
  if (!cardData) {
    gridContent = <AllCardsGridSkeleton count={12} />;
  } else if (totalCards === 0) {
    gridContent = (
      <Box sx={allCardsStyles.emptyMessage}>
        No results found. This artist may have only done digital cards for Arena or MTG-related artwork such as Vanguard.
        {!includeDigital && (
          <Box>
            <Box component="button" type="button" onClick={handleExpandSearch} sx={allCardsStyles.expandButton}>
              Expand search to include digital cards
            </Box>
          </Box>
        )}
      </Box>
    );
  } else if (displayedCards.length === 0) {
    gridContent = (
      <Box sx={allCardsStyles.emptyMessage}>
        No cards match this filter.
        <Box>
          <Box component="button" type="button" onClick={() => setFilterMode('all')} sx={allCardsStyles.expandButton}>
            Show all cards
          </Box>
        </Box>
      </Box>
    );
  } else {
    gridContent = (
      <div style={{ position: 'sticky', top: stickyTop, height: viewportHeight }}>
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
    );
  }
  const showList = !!cardData && displayedCards.length > 0;

  return (
    <Box sx={allCardsStyles.page}>
      <Box component="header" sx={allCardsStyles.header}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={allCardsStyles.backRow}>
            <Box
              component={RouterLink}
              to={`/artist/${encodeURIComponent(artist)}`}
              sx={allCardsStyles.backLink}
            >
              <ArrowLeft size={14} aria-hidden />
              {displayName}
            </Box>
            <Box
              component={RouterLink}
              to={`/artistcardbreakdown/${encodeURIComponent(artist)}`}
              sx={allCardsStyles.backLink}
            >
              Card statistics
              <ArrowRight size={14} aria-hidden />
            </Box>
          </Box>
          <Box component="h1" sx={allCardsStyles.title}>
            All cards{' '}
            {cardData && <Box component="span" sx={allCardsStyles.titleCount}>{totalCards}</Box>}
          </Box>
          <Box component="p" sx={allCardsStyles.blurb}>
            Prices shown are nonfoil, from three top online marketplaces: Mana Pool, Card Kingdom and TCGplayer.
            Use the icons under each card to track your artist proofs <DeviceMobileCamera size={14} aria-hidden />,
            signed copies <PenNib size={14} aria-hidden /> and signing wishlist <Heart size={14} aria-hidden />.
          </Box>
        </Box>

        <Box sx={allCardsStyles.headerAside}>
          {isLoggedIn && (
            <Box component="p" sx={allCardsStyles.summary}>
              Your collection: <strong>{signedCount} signed</strong> · <strong>{wishlistCount} wishlisted</strong>
              {artistProofCount > 0 && <> · <strong>{artistProofCount} artist {artistProofCount === 1 ? 'proof' : 'proofs'}</strong></>}
            </Box>
          )}
          <Box
            component="button"
            type="button"
            aria-haspopup="menu"
            aria-expanded={Boolean(sortMenuAnchor)}
            aria-controls="all-cards-sort-menu"
            aria-label={`Sort: ${sortLabel}`}
            disabled={!cardData}
            onClick={(e: MouseEvent<HTMLButtonElement>) => setSortMenuAnchor(e.currentTarget)}
            sx={allCardsStyles.sortButton}
          >
            {sortLabel}
            <CaretDown size={11} weight="bold" aria-hidden />
          </Box>
        </Box>
      </Box>

      {/* Sticky filter rail */}
      <Box sx={allCardsStyles.rail}>
        <Box sx={allCardsStyles.railChips} role="group" aria-label="Show cards">
          <MonoLabel size={11} sx={allCardsStyles.showLabel}>Show</MonoLabel>
          <FilterChip active={!isFiltered} onClick={() => setFilterMode('all')}>All</FilterChip>
          {isLoggedIn ? (
            COLLECTION_FILTERS.map(({ mode, label, title }) => (
              <FilterChip
                key={mode}
                title={title}
                active={filterMode === mode}
                onClick={() => setFilterMode(filterMode === mode ? 'all' : mode)}
              >
                {label}
              </FilterChip>
            ))
          ) : (
            <Box component={RouterLink} to="/auth" sx={allCardsStyles.signInHint}>
              Log in to track signed cards, artist proofs and wishlists
            </Box>
          )}
          <FilterChip
            icon={<ArrowsDownUp size={14} aria-hidden />}
            aria-haspopup="menu"
            aria-expanded={Boolean(sortMenuAnchor)}
            aria-label={`Sort: ${sortLabel}`}
            disabled={!cardData}
            onClick={(e) => setSortMenuAnchor(e.currentTarget)}
            sx={allCardsStyles.mobileOnly}
          >
            Sort
          </FilterChip>
        </Box>
        <Box sx={allCardsStyles.railSpacer} />
        <FormControlLabel
          labelPlacement="start"
          label="Hide reprints"
          disabled={!cardData}
          sx={allCardsStyles.reprintsToggle}
          control={<Switch checked={hideReprints} onChange={handleCheck} sx={allCardsStyles.switch} />}
        />
      </Box>

      <Menu
        id="all-cards-sort-menu"
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: allCardsStyles.menuPaper }}
      >
        <MenuItem selected={!sortByNewest} onClick={() => handleSortSelect(false)} sx={allCardsStyles.menuItem}>
          Name (A–Z)
          {!sortByNewest && <Check size={16} aria-hidden />}
        </MenuItem>
        <MenuItem selected={sortByNewest} onClick={() => handleSortSelect(true)} sx={allCardsStyles.menuItem}>
          Newest first
          {sortByNewest && <Check size={16} aria-hidden />}
        </MenuItem>
        {/* On phones the switch lives here instead of the rail. */}
        {isMobile && <Divider />}
        {isMobile && (
          <MenuItem onClick={handleCheck} sx={allCardsStyles.menuItem} role="menuitemcheckbox" aria-checked={hideReprints}>
            Hide reprints
            <Switch checked={hideReprints} tabIndex={-1} sx={allCardsStyles.switch} inputProps={{ 'aria-hidden': true, readOnly: true }} />
          </MenuItem>
        )}
      </Menu>

      <Box component="section" aria-label="Cards" sx={allCardsStyles.gridSection}>
        <Box
          ref={gridWrapperRef}
          sx={{
            width: '100%',
            // Reserve the full virtual scroll height so the page is scrollable.
            height: showList ? totalListHeight : 'auto',
          }}
        >
          {gridContent}
        </Box>
      </Box>

      <Snackbar
        open={!!toastError}
        autoHideDuration={4000}
        onClose={() => setToastError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setToastError(null)} sx={{ width: '100%' }}>
          {toastError}
        </Alert>
      </Snackbar>

      {showScrollTop && (
        <Fab
          onClick={scrollToTop}
          aria-label="Scroll to top"
          sx={allCardsStyles.scrollToTopFab}
        >
          <ArrowUp size={20} />
        </Fab>
      )}
    </Box>
  );
};

export default AllCards;
