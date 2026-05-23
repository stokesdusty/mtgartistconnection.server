import {
  useEffect,
  useState,
  useMemo,
  useCallback,
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
import { AllCardsSkeleton, AllCardsGridSkeleton } from "../shared/Skeletons";
import { ArrowUp, DeviceMobileCamera, DeviceMobileSpeaker, PenNib, Sparkle, Heart } from "@phosphor-icons/react";
import { GET_ARTIST_BY_NAME, GET_CARD_PRICES, GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS, GET_USER_CARD_COLLECTION } from "../graphql/queries";
import { TOGGLE_CARD_COLLECTION_FIELD } from "../graphql/mutations";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import { allCardsStyles } from "../../styles/all-cards-styles";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { colors, spacing } from "../../styles/design-tokens";

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

const COLLECTION_FIELDS = [
  { field: 'artistProof',    Icon: DeviceMobileCamera,  label: 'Artist Proof (nonfoil)', color: colors.accent.blue },
  { field: 'artistProofFoil',Icon: DeviceMobileSpeaker, label: 'Artist Proof (foil)',    color: colors.accent.orange },
  { field: 'signedNonfoil',  Icon: PenNib,             label: 'Signed (nonfoil)',        color: colors.accent.blueDark },
  { field: 'signedFoil',     Icon: Sparkle,            label: 'Signed (foil)',           color: colors.primary.main },
  { field: 'wishlistSigned', Icon: Heart,              label: 'Wishlist: want signed',   color: colors.accent.red },
] as const;

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
}

const CardItem = memo(({ card, price, ckPrice, collectionItem, isLoggedIn, onToggle }: CardItemProps) => {
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
        <Typography sx={{ fontSize: '0.90rem', color: colors.primary.main, fontWeight: 600, textDecoration: 'underline' }}>
          {formatPrice(manapoolPrice)}
        </Typography>
      )}
      <img src="/manapool-icon.ico" alt="Manapool" style={{ height: '16px', width: '16px' }} />
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
      <Typography sx={{ fontSize: '0.90rem', color: colors.primary.main, fontWeight: 600, textDecoration: 'underline' }}>
        ${card.prices.usd}
      </Typography>
      <Box
        component="img"
        src="/tcgplayer.png"
        alt="TCGPlayer"
        sx={{ height: '16px', width: '32px', objectFit: 'cover', objectPosition: 'left center' }}
      />
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
      <Typography sx={{ fontSize: '0.90rem', color: colors.primary.main, fontWeight: 600, textDecoration: 'underline' }}>
        {formatPrice(ckPrice.price)}
      </Typography>
      <Box
        component="img"
        src="/cardkingdom.jpg"
        alt="Card Kingdom"
        sx={{ height: '16px', width: '16px', objectFit: 'contain' }}
      />
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
                color: active ? color : 'text.disabled',
                p: 0.5,
                cursor: isLoggedIn ? 'pointer' : 'default',
                '&:hover': { backgroundColor: isLoggedIn ? colors.neutral[50] : 'transparent' },
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

// ─── AllCards ─────────────────────────────────────────────────────────────────

const AllCards = () => {
  const { name: artist } = useParams<{ name?: string }>();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
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
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [sortByNewest, setSortByNewest] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
  });

  const formattedArtistName = useMemo(() => {
    return "!" + artist?.split(" ").join(" ") || "";
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
    const fetchAllCards = async (url: string, allCards: Card[] = []): Promise<Card[]> => {
      try {
        const response = await axios.get<ScryfallResponse>(url);
        const newCards = [...allCards, ...response.data.data];
        if (response.data.has_more && response.data.next_page) {
          return await fetchAllCards(response.data.next_page, newCards);
        }
        return newCards;
      } catch (error) {
        console.error("Error fetching cards:", error);
        return allCards;
      }
    };

    const fetchData = async () => {
      if (!scryfallQuery) return;

      const url = hideReprints ? scryfallQuery.withoutDuplicates : scryfallQuery.withDuplicates;
      const fetchedCards = await fetchAllCards(url);

      const normalize = (str: string) => {
        return str
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
      };

      const normalizedArtist = normalize(artist || "");
      const filteredCards = fetchedCards.filter((card) => {
        const cardArtist = card.artist || "";
        const normalizedCardArtist = normalize(cardArtist);
        return normalizedCardArtist === normalizedArtist ||
               normalizedCardArtist.split(/[&,]/).some(name => name.trim() === normalizedArtist);
      });

      setCardData({ data: filteredCards, total_cards: filteredCards.length });
    };

    fetchData();
  }, [scryfallQuery, hideReprints, includeDigital, artist]);

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
    if (cards.length > 0) {
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
    }
  }, [cards, fetchCardPrices, fetchCardKingdomPrices, fetchUserCardCollection, isLoggedIn]);

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
  if (loading) return <AllCardsSkeleton />;
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
  if (!artistData?.artistByName)
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
      {/* Full-bleed hero banner */}
      <Box sx={allCardsStyles.heroBanner}>
        <img
          src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${artistData.artistByName.filename}.jpeg`}
          alt={`${artist} banner`}
        />
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

          {!cardData ? (
            <AllCardsGridSkeleton count={12} />
          ) : (
            <>
              <Box sx={allCardsStyles.cardsGrid}>
                {displayedCards.map((card) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    price={getCardPrice(card)}
                    ckPrice={getCardKingdomPrice(card)}
                    collectionItem={cardCollection.get(card.id)}
                    isLoggedIn={isLoggedIn}
                    onToggle={handleCollectionToggle}
                  />
                ))}
              </Box>
            </>
          )}
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
