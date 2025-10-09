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
    headerText: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 800,
      fontSize: { xs: "2.2rem", md: "3.2rem" },
      marginBottom: 3,
      textAlign: "center",
      letterSpacing: "-0.02em",
      lineHeight: 1,
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "-8px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100px",
        height: "3px",
        background: "linear-gradient(90deg, transparent, #507A60, transparent)",
        borderRadius: "2px",
      },
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
      padding: { xs: 2, md: 4 },
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(20px) saturate(1.1)",
      borderRadius: 4,
      boxShadow: "0 16px 48px rgba(0,0,0,0.06), 0 8px 24px rgba(80, 122, 96, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.08), 0 12px 32px rgba(80, 122, 96, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
      },
    },
    cardName: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 700,
      fontSize: { xs: "1.6rem", md: "2.2rem" },
      textAlign: "center",
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      letterSpacing: "-0.01em",
      marginBottom: 1,
    },
    imageContainer: {
      position: "relative",
      width: "100%",
      maxWidth: { xs: "100%", md: 600 },
      borderRadius: 3,
      overflow: "hidden",
      boxShadow: "0 12px 32px rgba(0,0,0,0.1), 0 6px 16px rgba(80, 122, 96, 0.08)",
      marginBottom: 2,
      border: "1px solid rgba(255, 255, 255, 0.3)",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-4px) scale(1.02)",
        boxShadow: "0 20px 48px rgba(0,0,0,0.15), 0 10px 24px rgba(80, 122, 96, 0.12)",
      },
      "& img": {
        width: "100%",
        height: "auto",
        objectFit: "cover",
        display: "block",
        transition: "transform 0.3s ease",
      },
      "&:hover img": {
        transform: "scale(1.05)",
      },
    },
    flavorText: {
      fontStyle: "italic",
      fontSize: { xs: "1.1rem", md: "1.3rem" },
      color: "#2d3748",
      textAlign: "center",
      lineHeight: 1.7,
      padding: 3,
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      borderRadius: 3,
      border: "1px solid rgba(255, 255, 255, 0.5)",
      borderLeft: "4px solid #507A60",
      maxWidth: "90%",
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 400,
      boxShadow: "0 8px 20px rgba(0,0,0,0.04), 0 4px 8px rgba(80, 122, 96, 0.06)",
      transition: "all 0.3s ease",
      "&:hover": {
        background: "rgba(255, 255, 255, 1)",
        transform: "translateY(-1px)",
        boxShadow: "0 12px 28px rgba(0,0,0,0.06), 0 6px 12px rgba(80, 122, 96, 0.08)",
      },
    },
    button: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      color: "white",
      paddingX: 6,
      paddingY: 2,
      fontWeight: 600,
      borderRadius: 8,
      fontSize: "1.1rem",
      letterSpacing: "0.3px",
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      boxShadow: "0 8px 20px rgba(80, 122, 96, 0.25), 0 4px 12px rgba(80, 122, 96, 0.15)",
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
        background: "linear-gradient(135deg, #3c5c48 0%, #507A60 100%)",
        transform: "translateY(-2px) scale(1.02)",
        boxShadow: "0 12px 32px rgba(80, 122, 96, 0.35), 0 6px 16px rgba(80, 122, 96, 0.25)",
        "&::before": {
          left: "100%",
        },
      },
      "&:disabled": {
        background: "linear-gradient(135deg, rgba(80, 122, 96, 0.5) 0%, rgba(107, 157, 115, 0.5) 100%)",
        transform: "none",
        "&::before": {
          display: "none",
        },
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
        color: "white",
        position: "relative",
        zIndex: 1,
      },
    },
    errorAlert: {
      marginBottom: 3,
      width: "100%",
      maxWidth: 800,
      background: "linear-gradient(135deg, rgba(211, 47, 47, 0.08) 0%, rgba(211, 47, 47, 0.12) 100%)",
      backdropFilter: "blur(10px)",
      borderRadius: 3,
      border: "1px solid rgba(211, 47, 47, 0.2)",
      boxShadow: "0 8px 20px rgba(211, 47, 47, 0.08), 0 4px 8px rgba(211, 47, 47, 0.06)",
      "& .MuiAlert-message": {
        fontSize: "1.1rem",
        fontWeight: 500,
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      },
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

  if (isLoading && !cardData)
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
                
                <Typography variant="body1" sx={styles.flavorText}>
                  {cardData.flavor_text}
                </Typography>
              </Paper>
              
              <Button
                variant="contained"
                startIcon={
                  isLoading ? <CircularProgress size={24} color="inherit" /> : <AutorenewIcon />
                }
                sx={styles.button}
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