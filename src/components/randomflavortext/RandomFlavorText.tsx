import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Container,
  Paper,
} from "@mui/material";
import AutorenewIcon from '@mui/icons-material/Autorenew';
import axios from "axios";

interface CardData {
  id: string;
  name: string;
  flavor_text: string;
  image_uris?: {
    art_crop: string;
  };
}

const RandomFlavorText = () => {
  document.title = "MtG Artist Connection - Random Flavor Text";
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const scryfallQuery = "https://api.scryfall.com/cards/random?q=has%3Aflavor";

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
    headerText: {
      color: "#507A60",
      fontWeight: 700,
      fontSize: { xs: "1.8rem", md: "2.5rem" },
      marginBottom: 3,
      textAlign: "center",
    },
    contentContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
    },
    cardContainer: {
      maxWidth: 800,
      width: "100%",
      padding: 3,
      borderRadius: 2,
      border: "1px solid rgba(80, 122, 96, 0.2)",
      backgroundColor: "rgba(80, 122, 96, 0.05)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
    },
    cardName: {
      color: "#507A60",
      fontWeight: 600,
      fontSize: { xs: "1.5rem", md: "1.8rem" },
      textAlign: "center",
    },
    imageContainer: {
      width: "100%",
      borderRadius: 1,
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      marginBottom: 2,
      "& img": {
        width: "100%",
        height: "auto",
        objectFit: "cover",
        display: "block",
      },
    },
    flavorText: {
      fontStyle: "italic",
      fontSize: { xs: "1rem", md: "1.2rem" },
      color: "#333",
      textAlign: "center",
      lineHeight: 1.6,
      padding: 2,
      backgroundColor: "white",
      borderRadius: 1,
      borderLeft: "3px solid #507A60",
      maxWidth: "90%",
    },
    button: {
      backgroundColor: "#507A60",
      color: "white",
      paddingX: 4,
      paddingY: 1,
      fontWeight: 600,
      borderRadius: 8,
      "&:hover": {
        backgroundColor: "#3c5c48",
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
    errorAlert: {
      marginBottom: 3,
      width: "100%",
      maxWidth: 800,
    },
  };

  const fetchCardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<CardData>(scryfallQuery);
      setCardData(response.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [scryfallQuery]);

  useEffect(() => {
    fetchCardData();
  }, [fetchCardData]);

  const handleReload = () => {
    fetchCardData();
  };

  if (isLoading)
    return (
      <Box sx={styles.container}>
        <Box sx={styles.loadingContainer}>
          <CircularProgress />
        </Box>
      </Box>
    );

  return (
    <Box sx={styles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={styles.wrapper}>
          <Typography variant="h2" sx={styles.headerText}>
            Random Flavor Text
          </Typography>
          
          {error && (
            <Alert severity="error" sx={styles.errorAlert}>
              {error}
            </Alert>
          )}
          
          {cardData && (
            <Box sx={styles.contentContainer}>
              <Paper elevation={0} sx={styles.cardContainer}>
                <Typography variant="h5" sx={styles.cardName}>
                  {cardData.name}
                </Typography>
                
                <Box sx={styles.imageContainer}>
                  <img
                    alt={`${cardData.name} artwork`}
                    key={cardData.id}
                    src={cardData.image_uris?.art_crop}
                  />
                </Box>
                
                <Typography variant="body1" sx={styles.flavorText}>
                  {cardData.flavor_text}
                </Typography>
              </Paper>
              
              <Button
                variant="contained"
                startIcon={<AutorenewIcon />}
                sx={styles.button}
                onClick={handleReload}
                disableElevation
              >
                Get Another Quote
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default RandomFlavorText;