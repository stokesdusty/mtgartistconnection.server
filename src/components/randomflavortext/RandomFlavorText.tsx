import { Box } from "@mui/system";
import { calendarStyles } from "../../styles/calendar-styles";
import {
  Button,
  CircularProgress,
  Typography,
  useTheme,
  useMediaQuery,
  Alert,
} from "@mui/material";
import { homepageStyles } from "../../styles/homepage-styles";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { randomFlavorStyles } from "../../styles/random-flavor-styles";

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
  const theme = useTheme();
  const isBelowMedium = useMediaQuery(theme.breakpoints.down("md"));

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

  if (isLoading)
    return (
      <Box sx={homepageStyles.loadingContainerStyles}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={calendarStyles.container}>
      <Typography variant="h4" fontFamily={"Work Sans"} fontWeight={600}>
        Random Flavor of MtG
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {cardData && (
        <Box sx={randomFlavorStyles.innerContainer}>
          <Box
            sx={
              isBelowMedium
                ? randomFlavorStyles.containerMobile
                : randomFlavorStyles.container
            }
          >
            <Typography variant="h5" fontFamily={"Work Sans"}>
              {cardData.name}
            </Typography>
            <Box sx={randomFlavorStyles.imageContainer}>
              <img
                height={isBelowMedium ? 250 : 500}
                alt=""
                key={cardData.id}
                src={cardData.image_uris?.art_crop}
              />
            </Box>
            <Typography
              variant={isBelowMedium ? "h6" : "h5"}
              fontFamily={"Work Sans"}
            >
              {cardData.flavor_text}
            </Typography>
          </Box>
          <Button
            sx={randomFlavorStyles.button}
            variant={"contained"}
            color={"success"}
            onClick={handleReload}
          >
            Reload
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RandomFlavorText;
