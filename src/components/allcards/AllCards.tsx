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
} from "@mui/material";
import { GET_ARTIST_BY_NAME } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import { useLoading } from '../../LoadingContext';

interface Card {
  related_uris: any;
  id: string;
  artist?: string;
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
    return {
      withDuplicates: `https://api.scryfall.com/cards/search?as=grid&unique=prints&order=name&q=%28${formattedQuery}%29`,
      withoutDuplicates: `https://api.scryfall.com/cards/search?as=grid&order=name&q=%28${formattedQuery}%29`,
    };
  }, [formattedArtistName, artist]);

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
      // Filter for artist match (exact or as part of multiple artists)
      const exactArtist = artist?.toLowerCase() || "";
      const filteredCards = fetchedCards.filter((card) => {
        const cardArtist = card.artist?.toLowerCase() || "";
        // Match if exact match OR artist name appears in the string
        // This handles cases like "Artist A & Artist B" or "Artist A, Artist B"
        return cardArtist === exactArtist ||
               cardArtist.split(/[&,]/).some(name => name.trim() === exactArtist);
      });

setCardData({ data: filteredCards, total_cards: filteredCards.length });

    };
    
    fetchData();
  }, [scryfallQuery, showDupes]);

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
          href={card?.related_uris.gatherer}
          target="_blank"
        >
          <img
            height={500}
            alt=""
            key={card.id}
            src={card.image_uris.border_crop}
            style={styles.cardImage}
          />
        </Link>
      );
    } else if (card.card_faces) {
      return (
        <Link 
          href={card?.related_uris?.gatherer}
          target="_blank"
        >
          <img
            height={500}
            alt=""
            key={card.id}
            src={card.card_faces[0]?.image_uris?.normal}
            style={styles.cardImage}
          />
        </Link>
      );
    }
    return null;
  };

  const handleCheck = () => {
    setShowDupes(!showDupes);
  };

  const styles = {
    container: {
      background: "linear-gradient(135deg, #507A60 0%, #3c5c48 50%, #2d4a36 100%)",
      minHeight: "100vh",
      padding: { xs: 3, md: 6 },
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)",
        pointerEvents: "none",
      },
    },
    wrapper: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: { xs: 2, md: 3 },
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(30px) saturate(1.2)",
      borderRadius: 4,
      boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 16px 40px rgba(80, 122, 96, 0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      position: "relative",
      zIndex: 1,
    },
    bannerContainer: {
      width: "100%",
      height: { xs: "150px", md: "200px" },
      overflow: "hidden",
      marginBottom: 2,
      borderRadius: 3,
      position: "relative",
      boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
      "& img": {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transition: "transform 0.3s ease",
      },
      "&:hover img": {
        transform: "scale(1.05)",
      },
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)",
        borderRadius: 3,
      },
    },
    headerText: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 800,
      fontSize: { xs: "2rem", md: "2.8rem" },
      marginBottom: 1.5,
      textAlign: "center",
      letterSpacing: "-0.02em",
      lineHeight: 1,
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      padding: "0px 0px 12px 0px",
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "-6px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "60px",
        height: "2px",
        background: "linear-gradient(90deg, transparent, #507A60, transparent)",
        borderRadius: "1px",
      },
    },
    checkbox: {
      color: "#507A60",
      "&.Mui-checked": {
        color: "#507A60",
      },
    },
    checkboxContainer: {
      background: "rgba(255, 255, 255, 0.7)",
      borderRadius: 2,
      padding: "6px 24px",
      marginBottom: 3,
      border: "1px solid rgba(255, 255, 255, 0.5)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.9)",
        transform: "translateY(-1px)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.08), 0 3px 8px rgba(80, 122, 96, 0.06)",
      },
    },
    checkboxLabel: {
      margin: 0,
      "& .MuiFormControlLabel-label": {
        fontWeight: 600,
        color: "#2d3748",
        fontSize: "0.95rem",
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      },
    },
    cards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: 3,
      justifyContent: "center",
      marginTop: 3,
    },
    cardImage: {
      width: "100%",
      height: "auto",
      borderRadius: 3,
      boxShadow: "0 8px 20px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.06)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      ":hover": {
        transform: "translateY(-4px) scale(1.03)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.12), 0 8px 20px rgba(80, 122, 96, 0.1)",
      },
    },
    loadingContainer: {
      background: "linear-gradient(135deg, #507A60 0%, #3c5c48 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50vh",
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
      },
      "& .MuiCircularProgress-root": {
        color: "#507A60",
      },
    },
    loadingCardsContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: 4,
      minHeight: "300px",
      "& .MuiCircularProgress-root": {
        color: "#507A60",
      },
    },
    loadingCardsText: {
      marginTop: 2,
      color: "#507A60",
      fontWeight: 600,
    },
    loadingMessage: {
      color: "#507A60",
      textAlign: "center",
      padding: 4,
      backgroundColor: "#999999",
      borderRadius: 2,
    },
    errorMessage: {
      color: "#d32f2f",
      textAlign: "center",
      padding: 4,
      background: "linear-gradient(135deg, rgba(211, 47, 47, 0.08) 0%, rgba(211, 47, 47, 0.12) 100%)",
      borderRadius: 3,
      border: "1px solid rgba(211, 47, 47, 0.2)",
      backdropFilter: "blur(10px)",
      fontSize: "1.1rem",
      fontWeight: 500,
    },
    viewCardsLink: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      color: "white",
      textDecoration: "none",
      fontWeight: 600,
      display: "inline-block",
      marginBottom: 2,
      padding: "10px 20px",
      borderRadius: 2,
      textAlign: "center",
      fontSize: "0.95rem",
      letterSpacing: "0.3px",
      boxShadow: "0 6px 16px rgba(80, 122, 96, 0.2), 0 2px 6px rgba(80, 122, 96, 0.12)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
        transition: "left 0.6s ease",
      },
      "&:hover": {
        transform: "translateY(-2px) scale(1.02)",
        boxShadow: "0 10px 24px rgba(80, 122, 96, 0.25), 0 4px 12px rgba(80, 122, 96, 0.15)",
        "&::before": {
          left: "100%",
        },
      },
    },
  };

  if (!artist) return null;
  if (loading)
    return (
      <Box sx={styles.container}>
        <Box sx={styles.loadingContainer}>
          <CircularProgress size={40} sx={{ color: "#507A60" }} />
        </Box>
      </Box>
    );
  if (error) 
    return (
      <Box sx={styles.container}>
        <Box sx={styles.wrapper}>
          <Typography sx={styles.errorMessage}>
            Error loading artist: {error.message}
          </Typography>
        </Box>
      </Box>
    );
  if (!artistData?.artistByName) 
    return (
      <Box sx={styles.container}>
        <Box sx={styles.wrapper}>
          <Typography sx={styles.errorMessage}>
            Artist not found
          </Typography>
        </Box>
      </Box>
    );

  return (
    <Box sx={styles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={styles.wrapper}>
          <Box sx={styles.bannerContainer}>
            <img
              src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${artistData.artistByName.filename}.jpeg`}
              alt={`${artist} banner`}
            />
          </Box>
          <Typography variant="h2" sx={styles.headerText}>
            All {artist} Cards ({totalCards})
          </Typography>
          { totalCards === 0 && (
            <Typography sx={styles.loadingMessage}>
              Loading....
            </Typography>
          )}
          <Link 
            href={`/artistcardbreakdown/${artist}`}
            underline="none"
            sx={styles.viewCardsLink}
          >
            <Typography variant="h5">{`Card Statistics`}</Typography>
          </Link>
          <br />
          <Box sx={styles.checkboxContainer}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={showDupes} 
                  onChange={handleCheck} 
                  sx={styles.checkbox}
                  disabled={!cardData}
                />
              }
              label="Show All Printings"
              sx={styles.checkboxLabel}
            />
          </Box>
          
          {!cardData ? (
            <Box sx={styles.loadingCardsContainer}>
              <CircularProgress size={40} />
              <Typography sx={styles.loadingCardsText}>
                Loading cards...
              </Typography>
            </Box>
          ) : (
            <Box sx={styles.cards}>
              {cards.map((card) => getImage(card))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AllCards;