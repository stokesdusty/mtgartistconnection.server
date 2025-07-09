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
  const { setIsLoading } = useLoading();
  const [isCardViewChanging, setIsCardViewChanging] = useState(false);
  const [cardsWithDupes, setCardsWithDupes] = useState<CardData>({
    data: [],
    total_cards: 0,
  });
  const [cardsWithoutDupes, setCardsWithoutDupes] = useState<CardData>({
    data: [],
    total_cards: 0,
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
    return artist?.split(" ").join(" ") || "";
  }, [artist]);

  const scryfallQuery = useMemo(() => {
    if (!artist) return null;
    const baseQuery = "artist%3A";
    const formattedQuery = `${baseQuery}"${formattedArtistName}"`;
    return {
      withDuplicates: `https://api.scryfall.com/cards/search?as=grid&unique=prints&order=name&q=%28game%3Apaper%29+%28${formattedQuery}%29`,
      withoutDuplicates: `https://api.scryfall.com/cards/search?as=grid&order=name&q=%28game%3Apaper%29+%28${formattedQuery}%29`,
    };
  }, [formattedArtistName, artist]);

  useEffect(() => {
    const fetchCards = async (
      url: string,
      showDuplicates: boolean,
      previousData: Card[] = []
    ): Promise<Card[] | null> => {
      try {
        const response = await axios.get<ScryfallResponse>(url);
        let allData: Card[] = [...previousData, ...response.data.data];

        if (response.data.has_more && response.data.next_page) {
          const nextPageData = await fetchCards(
            response.data.next_page,
            showDuplicates,
            allData
          );
          if (nextPageData) allData = nextPageData;
        }

        return allData;
      } catch (error) {
        console.error("Error fetching cards:", error);
        return null;
      }
    };

    const fetchData = async () => {
      if (!scryfallQuery) return;
      
      setIsLoading(true);
      
      const noDupesData = await fetchCards(
        scryfallQuery.withoutDuplicates,
        false
      );
      if (noDupesData) {
        setCardsWithoutDupes({data: noDupesData, total_cards: noDupesData.length});
      }
      const withDupesData = await fetchCards(
        scryfallQuery.withDuplicates,
        true
      );
      if (withDupesData) {
        setCardsWithDupes({data: withDupesData, total_cards: withDupesData.length});
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [scryfallQuery, setIsLoading]);

  useEffect(() => {
    if (cardsWithDupes.data.length > 0 && cardsWithoutDupes.data.length > 0) {
      setIsCardViewChanging(true);
      const timeoutId = setTimeout(() => {
        setIsCardViewChanging(false);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [showDupes, cardsWithDupes, cardsWithoutDupes]);

  const { cards, totalCards } = useMemo<CardsAndTotal>(() => {
    if (!scryfallQuery) {
      return { cards: [], totalCards: 0 };
    }
    const selectedData = showDupes ? cardsWithDupes : cardsWithoutDupes;
    return { cards: selectedData.data, totalCards: selectedData.total_cards };
  }, [showDupes, scryfallQuery, cardsWithDupes, cardsWithoutDupes]);

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
      backgroundColor: "#507A60",
      minHeight: "100vh",
      padding: { xs: 2, md: 4 },
    },
    wrapper: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: { xs: 2, md: 4 },
      backgroundColor: "#fff",
      borderRadius: 2,
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    },
    bannerContainer: {
      width: "100%",
      height: { xs: "150px", md: "200px" },
      overflow: "hidden",
      marginBottom: 4,
      borderRadius: 2,
      "& img": {
        width: "100%",
        height: "100%",
        objectFit: "cover",
      },
    },
    headerText: {
      color: "#507A60",
      fontWeight: 700,
      fontSize: { xs: "1.8rem", md: "2.5rem" },
      marginBottom: 2,
    },
    checkbox: {
      color: "#507A60",
      "&.Mui-checked": {
        color: "#507A60",
      },
    },
    checkboxLabel: {
      marginBottom: 2,
      "& .MuiFormControlLabel-label": {
        fontWeight: 600,
      },
    },
    cards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: 3,
      justifyContent: "center",
    },
    cardImage: {
      width: "100%",
      height: "auto",
      borderRadius: 2,
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      ":hover": {
        transform: "scale(1.02)",
        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
      },
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50vh",
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
      backgroundColor: "rgba(211, 47, 47, 0.1)",
      borderRadius: 2,
    },
    viewCardsLink: {
      color: "#507A60",
      textDecoration: "none",
      fontWeight: 600,
      display: "inline-block",
      marginBottom: 3,
      transition: "color 0.2s ease",
      "&:hover": {
        color: "#3c5c48",
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
          <FormControlLabel
            control={
              <Checkbox 
                checked={showDupes} 
                onChange={handleCheck} 
                sx={styles.checkbox}
                disabled={isCardViewChanging}
              />
            }
            label="Show All Printings"
            sx={styles.checkboxLabel}
          />
          
          {isCardViewChanging ? (
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