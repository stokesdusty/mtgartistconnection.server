import { useCallback, useEffect, useMemo, useState } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { ArrowsCounterClockwise } from "@phosphor-icons/react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@apollo/client";
import axios from "axios";
import { ART_CROP_RATIO, randomFlavorStyles as styles } from "../../styles/random-flavor-styles";
import { GET_ARTIST_FILTER_FLAGS } from "../graphql/queries";
import PageMeta from "../shared/PageMeta";
import ArtistLink from "../shared/ArtistLink";
import MonoLabel from "../shared/MonoLabel";
import Slab from "../shared/Slab";
import { SkeletonBar } from "../shared/Skeletons";

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

  const matchedArtistName = useMemo(() => {
    if (!cardData?.artist || !directoryData?.artistFilterFlags) return null;
    const trimmed = cardData.artist.toLowerCase().trim();
    return (
      directoryData.artistFilterFlags.find(
        (a: { name: string }) => a.name.toLowerCase().trim() === trimmed
      )?.name ?? null
    );
  }, [cardData?.artist, directoryData?.artistFilterFlags]);

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
      <Box sx={styles.page}>
        <Box
          role="status"
          aria-busy="true"
          aria-label="Loading flavor text"
          sx={styles.inner}
        >
          <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
            Random flavor text
          </MonoLabel>
          <Slab aspectRatio={ART_CROP_RATIO} size="lg" sx={styles.art} />
          <Box sx={[styles.figure, { display: "grid", justifyItems: "center", gap: "12px" }]} aria-hidden>
            <SkeletonBar width="90%" height={22} />
            <SkeletonBar width="70%" height={22} />
            <SkeletonBar width={160} height={16} sx={{ mt: "20px" }} />
          </Box>
        </Box>
      </Box>
    );

  return (
    <Box sx={styles.page}>
      <Box sx={styles.inner}>
        <PageMeta
          title="Random Flavor Text"
          description="Read random Magic: The Gathering flavor text with beautiful card art from your favorite MTG artists."
          path="/randomflavortext"
        />
        <MonoLabel component="h1" tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
          Random flavor text
        </MonoLabel>

        {error && (
          <Box role="alert" sx={styles.errorPanel}>
            {error}
          </Box>
        )}

        {cardData && (
          <>
            <Slab
              key={cardData.id}
              src={cardData.image_uris?.art_crop}
              alt={`${cardData.name} artwork`}
              imgProps={{ loading: "eager" }}
              aspectRatio={ART_CROP_RATIO}
              size="lg"
              sx={styles.art}
            >
              {isLoading && (
                <Box sx={styles.artLoadingOverlay}>
                  <CircularProgress size={32} color="inherit" />
                </Box>
              )}
            </Slab>

            <Box component="figure" sx={styles.figure}>
              <Box component="blockquote" sx={styles.quote}>
                {cardData.flavor_text}
              </Box>
              <Box component="figcaption" sx={styles.caption}>
                <Box component="h2" sx={styles.cardName}>
                  {cardData.name}
                </Box>
                <Box component="span" sx={styles.byline}>
                  Art by <ArtistLink name={cardData.artist} />
                </Box>
                {matchedArtistName && (
                  <Box
                    component={RouterLink}
                    to={`/allcards/${matchedArtistName}`}
                    sx={styles.allCardsLink}
                  >
                    <MonoLabel tone="inherit" tracking="tight">
                      See all their cards →
                    </MonoLabel>
                  </Box>
                )}
              </Box>
            </Box>

            <Button
              startIcon={
                isLoading ? <CircularProgress size={18} color="inherit" /> : <ArrowsCounterClockwise size={18} weight="bold" />
              }
              sx={styles.reloadButton}
              onClick={handleReload}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Get another text"}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default RandomFlavorText;
