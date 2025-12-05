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
import { contentPageStyles } from "../../styles/content-page-styles";

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

  if (isLoading && !cardData)
    return (
      <Box sx={contentPageStyles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={contentPageStyles.wrapper}>
            <Box sx={contentPageStyles.flavorLoadingContainer}>
              <CircularProgress />
            </Box>
          </Paper>
        </Container>
      </Box>
    );

  return (
    <Box sx={contentPageStyles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={contentPageStyles.wrapper}>
          <Typography variant="h1" sx={contentPageStyles.pageTitle}>
            Random Flavor Text
          </Typography>

          {error && (
            <Alert severity="error" sx={contentPageStyles.errorAlert}>
              {error}
            </Alert>
          )}

          {cardData && (
            <Box sx={contentPageStyles.contentContainer}>
              <Paper elevation={0} sx={contentPageStyles.flavorCardContainer}>
                <Typography variant="h3" sx={contentPageStyles.cardName}>
                  {cardData.name}
                </Typography>

                <Box sx={contentPageStyles.imageContainer}>
                  {isLoading && cardData && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1,
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  )}
                  <img
                    alt={`${cardData.name} artwork`}
                    key={cardData.id}
                    src={cardData.image_uris?.art_crop}
                  />
                </Box>

                <Typography variant="body1" sx={contentPageStyles.flavorText}>
                  {cardData.flavor_text}
                </Typography>
              </Paper>

              <Button
                variant="contained"
                startIcon={
                  isLoading ? <CircularProgress size={24} color="inherit" /> : <AutorenewIcon />
                }
                sx={contentPageStyles.reloadButton}
                onClick={handleReload}
                disabled={isLoading}
                disableElevation
              >
                {isLoading ? "Loading..." : "Get Another Text"}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default RandomFlavorText;