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
} from "@mui/material";
import { GET_ARTIST_BY_NAME } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import { allCardsStyles } from "../../styles/all-cards-styles";

interface Card {
  related_uris: any;
  id: string;
  artist?: string;
  scryfall_uri?: string;
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

const AllCards = () => {
  const { name: artist } = useParams<{ name?: string }>();
  const navigate = useNavigate();
  const [showDupes, setShowDupes] = useState<boolean>(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [includeDigital, setIncludeDigital] = useState<boolean>(false);

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
    return { cards: cardData.data, totalCards: cardData.total_cards };
  }, [cardData]);

  const getImage = (card: Card) => {
    if (card.image_uris) {
      return (
        <Link
          href={card?.scryfall_uri}
          target="_blank"
          key={card.id}
        >
          <Box
            component="img"
            alt={card.artist || "Card"}
            src={card.image_uris.border_crop}
            sx={allCardsStyles.cardImage}
          />
        </Link>
      );
    } else if (card.card_faces) {
      return (
        <Link
          href={card?.scryfall_uri}
          target="_blank"
          key={card.id}
        >
          <Box
            component="img"
            alt={card.artist || "Card"}
            src={card.card_faces[0]?.image_uris?.normal}
            sx={allCardsStyles.cardImage}
          />
        </Link>
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
    </Box>
  );
};

export default AllCards;