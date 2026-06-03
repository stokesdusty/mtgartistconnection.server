import { useCallback, useEffect, useMemo, useState } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Container,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import { ArrowsCounterClockwise } from "@phosphor-icons/react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@apollo/client";
import axios from "axios";
import { contentPageStyles } from "../../styles/content-page-styles";
import { GET_ARTIST_FILTER_FLAGS } from "../graphql/queries";
import { colors, themeColors, transitions } from "../../styles/design-tokens";

interface CardData {
  id: string;
  name: string;
  flavor_text: string;
  artist: string;
  image_uris?: {
    art_crop: string;
  };
}

const RandomFlavorText = () => {
  usePageTitle("Random Flavor Text");
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { data: directoryData } = useQuery(GET_ARTIST_FILTER_FLAGS);

  const artistLookup = useMemo(() => {
    const map = new Map<string, string>();
    directoryData?.artistFilterFlags?.forEach((a: { name: string }) => {
      map.set(a.name.toLowerCase().trim(), a.name);
    });
    return map;
  }, [directoryData]);

  const matchedArtistName = useMemo(() => {
    if (!cardData?.artist) return null;
    return artistLookup.get(cardData.artist.toLowerCase().trim()) ?? null;
  }, [cardData?.artist, artistLookup]);

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

                <Typography
                  variant="subtitle1"
                  sx={contentPageStyles.artistByline}
                >
                  Art by{" "}
                  {matchedArtistName ? (
                    <MuiLink
                      component={RouterLink}
                      to={`/artist/${matchedArtistName}`}
                      sx={{
                        color: themeColors.primary.main,
                        textDecoration: "none",
                        fontStyle: "inherit",
                        transition: transitions.fast,
                        "&:hover": {
                          color: colors.primary.dark,
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {cardData.artist}
                    </MuiLink>
                  ) : (
                    <>
                      {cardData.artist}
                      {" "}
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ color: themeColors.text.hint, fontStyle: "italic" }}
                      >
                        (not yet in the directory)
                      </Typography>
                    </>
                  )}
                </Typography>

                {matchedArtistName && (
                  <MuiLink
                    component={RouterLink}
                    to={`/allcards/${matchedArtistName}`}
                    sx={{
                      fontSize: "0.8125rem",
                      color: themeColors.primary.main,
                      textDecoration: "none",
                      mt: "-0.25rem",
                      transition: transitions.fast,
                      "&:hover": {
                        color: colors.primary.dark,
                        textDecoration: "underline",
                      },
                    }}
                  >
                    See all their cards →
                  </MuiLink>
                )}

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
                  isLoading ? <CircularProgress size={24} color="inherit" /> : <ArrowsCounterClockwise size={24} />
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