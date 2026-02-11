import {
  useEffect,
  useState,
  useMemo,
} from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Link,
  Typography,
  Container,
  Paper,
  Button,
  Fab,
} from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";
import { GET_ARTIST_BY_NAME, GET_CARD_PRICES, GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS } from "../graphql/queries";
import { useQuery, useLazyQuery } from "@apollo/client";
import { allCardsStyles } from "../../styles/all-cards-styles";

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

const AllCards = () => {
  const { name: artist } = useParams<{ name?: string }>();
  const navigate = useNavigate();
  const [showDupes, setShowDupes] = useState<boolean>(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [includeDigital, setIncludeDigital] = useState<boolean>(false);
  const [cardPrices, setCardPrices] = useState<Map<string, CardPrice>>(new Map());
  const [cardKingdomPrices, setCardKingdomPrices] = useState<Map<string, CardKingdomPrice>>(new Map());
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
          // Key by set_code (lowercase) + number to match with scryfall data
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
          // Store by scryfallId for exact matching
          ckPriceMap.set(price.scryfallId, price);
        });
        setCardKingdomPrices(ckPriceMap);
      }
    },
    onError: (error) => {
      console.error('Error fetching CardKingdom prices:', error);
    },
  });

  useEffect(() => {
    if (!artist) {
      navigate("/");
    }
  }, [artist, navigate]);

  document.title = `MtG Artist Connection - All ${artist} Cards`;

  const { data: artistData, error, loading } = useQuery(GET_ARTIST_BY_NAME, {
    variables: {
      name: artist || "",
    },
    skip: !artist,
  });

  const formattedArtistName = useMemo(() => {
    return "!" + artist?.split(" ").join(" ") || "";
  }, [artist]);

  const scryfallQuery = useMemo(() => {
    if (!artist) return null;
    const baseQuery = "artist%3A";
    const formattedQuery = `${baseQuery}"${formattedArtistName}"`;
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
        return allCards; // Return what we have so far
      }
    };

    const fetchData = async () => {
      if (!scryfallQuery) return;

      const url = showDupes ? scryfallQuery.withDuplicates : scryfallQuery.withoutDuplicates;
      const fetchedCards = await fetchAllCards(url);

      // Normalize function to remove diacritics and special characters
      const normalize = (str: string) => {
        return str
          .toLowerCase()
          .normalize("NFD") // Decompose combined characters
          .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
          .replace(/\./g, " ") // Replace periods with spaces (handles "D. J." → "D J")
          .replace(/-/g, " ") // Replace hyphens with spaces
          .replace(/"/g, "") // Remove quotation marks
          .replace(/[()]/g, "") // Remove parentheses
          .replace(/'/g, " ") // Replace apostrophes with spaces
          .replace(/,/g, "") // Remove commas (handles "Beard, Jr." → "Beard Jr")
          .replace(/\s+/g, "") // Remove ALL spaces to ensure consistent matching
          .trim();
      };

      // Filter for artist match (exact or as part of multiple artists)
      const normalizedArtist = normalize(artist || "");
      const filteredCards = fetchedCards.filter((card) => {
        const cardArtist = card.artist || "";
        const normalizedCardArtist = normalize(cardArtist);

        // Match if exact match OR artist name appears in the string
        // This handles cases like "Artist A & Artist B" or "Artist A, Artist B"
        return normalizedCardArtist === normalizedArtist ||
               normalizedCardArtist.split(/[&,]/).some(name => name.trim() === normalizedArtist);
      });

    setCardData({ data: filteredCards, total_cards: filteredCards.length });
  };

    fetchData();
  }, [scryfallQuery, showDupes, includeDigital, artist]);

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
    return { cards: sortedCards, totalCards: cardData.total_cards };
  }, [cardData, sortByNewest]);

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

      // Fetch CardKingdom prices for all unique scryfall IDs in a single batch query
      const uniqueScryfallIds = Array.from(new Set(cards.map(card => card.id).filter(Boolean)));
      if (uniqueScryfallIds.length > 0) {
        fetchCardKingdomPrices({ variables: { scryfallIds: uniqueScryfallIds } });
      }
    }
  }, [cards, fetchCardPrices, fetchCardKingdomPrices]);

  const formatPrice = (cents: number | null): string => {
    if (cents === null || cents === undefined) return '-';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getCardPrice = (card: Card): CardPrice | undefined => {
    if (!card.set || !card.collector_number) return undefined;
    const key = `${card.set.toLowerCase()}-${card.collector_number}`;
    return cardPrices.get(key);
  };

  const getCardKingdomPrice = (card: Card): CardKingdomPrice | undefined => {
    if (!card.id) return undefined;
    // Match by scryfallId for exact accuracy
    return cardKingdomPrices.get(card.id);
  };

  const getImage = (card: Card) => {
    const price = getCardPrice(card);

    if (card.name === '_____ ' || card.name?.includes('_____')) {
      console.log('Card:', card.name, 'Set:', card.set, 'Number:', card.collector_number);
      console.log('Price object:', price);
    }

    // Convert card name to URL slug (lowercase, replace spaces/special chars with hyphens)
    // Keep apostrophes, replace other special chars with hyphens
    const cardSlug = card.name
      ? card.name
          .toLowerCase()
          .replace(/[^a-z0-9']+/g, '-')
          .replace(/^-+|-+$/g, '')
      : '';

    // Fallback chain for price: NM -> LP -> generic -> no price (just link)
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
          mt: 0.5,
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(45, 74, 54, 0.1)',
          },
        }}
      >
        {manapoolPrice && (
          <Typography sx={{ fontSize: '0.75rem', color: 'text.primary', fontWeight: 600 }}>
            {formatPrice(manapoolPrice)}
          </Typography>
        )}
        <img
          src="/manapool-icon.ico"
          alt="Manapool"
          style={{ height: '16px', width: '16px' }}
        />
      </Link>
    );

    const tcgplayerDisplay = card.tcgplayer_id && card.prices?.usd && (
      <Link
        href={`https://tcgplayer.com/product/${card.tcgplayer_id}?partner=mtgartistconnection&utm_campaign=affiliate&utm_medium=mtgartistconnection&utm_source=mtgartistconnection`}
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
          mt: 0.5,
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(45, 74, 54, 0.1)',
          },
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', color: 'text.primary', fontWeight: 600 }}>
          ${card.prices.usd}
        </Typography>
        <Box
          component="img"
          src="/tcgplayer.png"
          alt="TCGPlayer"
          sx={{
            height: '16px',
            width: '32px',
            objectFit: 'cover',
            objectPosition: 'left center',
          }}
        />
      </Link>
    );

    const ckPrice = getCardKingdomPrice(card);
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
          mt: 0.5,
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(45, 74, 54, 0.1)',
          },
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', color: 'text.primary', fontWeight: 600 }}>
          {formatPrice(ckPrice.price)}
        </Typography>
        <Box
          component="img"
          src="/cardkingdom.jpg"
          alt="Card Kingdom"
          sx={{
            height: '16px',
            width: '16px',
            objectFit: 'contain',
          }}
        />
      </Link>
    );

    if (card.image_uris) {
      return (
        <Box key={card.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Link
            href={card?.scryfall_uri}
            target="_blank"
          >
            <Box
              component="img"
              alt={card.artist || "Card"}
              src={card.image_uris.border_crop}
              sx={allCardsStyles.cardImage}
            />
          </Link>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {priceDisplay}
            {tcgplayerDisplay}
            {cardKingdomDisplay}
          </Box>
        </Box>
      );
    } else if (card.card_faces) {
      return (
        <Box key={card.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Link
            href={card?.scryfall_uri}
            target="_blank"
          >
            <Box
              component="img"
              alt={card.artist || "Card"}
              src={card.card_faces[0]?.image_uris?.normal}
              sx={allCardsStyles.cardImage}
            />
          </Link>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {priceDisplay}
            {tcgplayerDisplay}
            {cardKingdomDisplay}
          </Box>
        </Box>
      );
    }
    return null;
  };

  const handleCheck = () => {
    setShowDupes(!showDupes);
  };

  const handleExpandSearch = () => {
    setIncludeDigital(true);
  };

  if (!artist) return null;
  if (loading)
    return (
      <Box sx={allCardsStyles.container}>
        <Box sx={allCardsStyles.loadingContainer}>
          <CircularProgress size={40} sx={allCardsStyles.loadingSpinner} />
        </Box>
      </Box>
    );
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
      <Container maxWidth="lg">
        <Paper elevation={0} sx={allCardsStyles.wrapper}>
          <Box sx={allCardsStyles.bannerContainer}>
            <img
              src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${artistData.artistByName.filename}.jpeg`}
              alt={`${artist} banner`}
            />
          </Box>

          <Typography variant="h2" sx={allCardsStyles.artistName}>
            All {artist} Cards
          </Typography>

          <Box sx={allCardsStyles.controlsSection}>
            <Typography sx={allCardsStyles.cardCount}>
              {totalCards} {totalCards === 1 ? 'card' : 'cards'} found
            </Typography>

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
                    checked={showDupes}
                    onChange={handleCheck}
                    sx={allCardsStyles.checkbox}
                    disabled={!cardData}
                  />
                }
                label="Show All Printings"
                sx={allCardsStyles.checkboxLabel}
              />

              <Link
                href={`/artistcardbreakdown/${artist}`}
                underline="none"
              >
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
            <Box sx={allCardsStyles.loadingContainer}>
              <CircularProgress size={40} sx={allCardsStyles.loadingSpinner} />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                Loading cards...
              </Typography>
            </Box>
          ) : (
            <Box sx={allCardsStyles.cardsGrid}>
              {cards.map((card) => getImage(card))}
            </Box>
          )}
        </Paper>
      </Container>

      {/* Scroll to Top Button - positioned left of cart button (56px FAB + 24px gap + 24px right margin = 104px) */}
      {showScrollTop && (
        <Fab
          color="primary"
          onClick={scrollToTop}
          size="medium"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 96,
            bgcolor: '#2d4a36',
            '&:hover': { bgcolor: '#1e3425' },
            zIndex: 999,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}
    </Box>
  );
};

export default AllCards;
