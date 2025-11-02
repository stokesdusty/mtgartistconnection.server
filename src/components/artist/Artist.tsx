import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_ARTIST_BY_NAME } from "../graphql/queries";
import {
  Box,
  Link,
  Typography,
  CircularProgress,
  Container,
  Paper,
} from "@mui/material";
import { TbWorldWww } from "react-icons/tb";
import {
  FaArtstation,
  FaFacebookF,
  FaInstagram,
  FaPatreon,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";
import { useEffect } from "react";
import { capitalizeFirstLetter } from "../../utils";

interface ArtistSocialLink {
  label: string;
  url: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}

const Artist = () => {
  const { name } = useParams<{ name: string }>();

  useEffect(() => {
    if (name) document.title = `MtG Artist Connection - ${name}`;
  }, [name]);

  const { data, error, loading } = useQuery(
    GET_ARTIST_BY_NAME,
    {
      variables: { name: name || "" },
      skip: !name,
    }
  );

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
    contentWrapper: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: { xs: 2, md: 3 },
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(30px) saturate(1.2)",
      borderRadius: 6,
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
      boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
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
    artistName: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 900,
      fontSize: { xs: "2rem", md: "2.8rem" },
      marginBottom: 1.5,
      textAlign: "center",
      letterSpacing: "-0.03em",
      lineHeight: 0.9,
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      padding: "0px 0px 12px 0px",
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "-10px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "120px",
        height: "2px",
        background: "linear-gradient(90deg, transparent, #507A60, transparent)",
        borderRadius: "1px",
      },
    },
    viewCardsLink: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      color: "white",
      textDecoration: "none",
      fontWeight: 600,
      display: "inline-block",
      padding: "16px 32px",
      borderRadius: 3,
      textAlign: "center",
      fontSize: "1.1rem",
      letterSpacing: "0.5px",
      boxShadow: "0 12px 32px rgba(80, 122, 96, 0.25), 0 4px 12px rgba(80, 122, 96, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
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
        transform: "translateY(-3px) scale(1.02)",
        boxShadow: "0 20px 48px rgba(80, 122, 96, 0.35), 0 8px 20px rgba(80, 122, 96, 0.2)",
        "&::before": {
          left: "100%",
        },
      },
    },
    omaLink: {
      background: "#fff",
      color: "#000",
      textDecoration: "none",
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      padding: "20px 24px",
      borderRadius: 3,
      textAlign: "center",
      fontSize: "1rem",
      letterSpacing: "0.5px",
      boxShadow: "0 12px 32px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-3px) scale(1.02)",
        boxShadow: "0 20px 48px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)",
      },
      "& .oma-logo": {
        marginLeft: 1,
        height: "24px",
        width: "92px",
        verticalAlign: "middle",
      },
      "& .oma-text": {
        fontWeight: 600,
        color: "black",
      },
    },
    artistPage: {
      width: "100%",
    },
    infoSection: {
      display: "grid",
      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
      gap: 2.5,
      alignItems: "start",
      marginTop: 1,
    },
    artistInfo: {
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(20px) saturate(1.1)",
      borderRadius: 4,
      padding: "6px",
      boxShadow: "0 16px 48px rgba(0,0,0,0.06), 0 8px 24px rgba(80, 122, 96, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      display: "flex",
      flexDirection: "column",
      gap: { xs: 1.5, md: 3 },
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.08), 0 12px 32px rgba(80, 122, 96, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
      },
    },
    sectionHeader: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 800,
      fontSize: { xs: "1.5rem", md: "2rem" },
      marginBottom: { xs: 2, md: 4 },
      paddingBottom: { xs: 1.5, md: 3 },
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      letterSpacing: "-0.02em",
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "80px",
        height: "3px",
        background: "linear-gradient(90deg, #507A60, #6b9d73, transparent)",
        borderRadius: "2px",
      },
    },
    infoRow: {
      background: "rgba(255, 255, 255, 0.7)",
      borderRadius: 3,
      padding: { xs: "4px 16px", md: "6px 24px" },
      border: "1px solid rgba(255, 255, 255, 0.5)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "3px",
        height: "100%",
        background: "linear-gradient(180deg, #507A60, #6b9d73)",
        opacity: 0,
        transition: "opacity 0.3s ease",
      },
      "&:hover": {
        background: "rgba(255, 255, 255, 0.9)",
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1), 0 4px 12px rgba(80, 122, 96, 0.08)",
        "&::before": {
          opacity: 1,
        },
      },
      "& h5": {
        color: "#2d3748",
        fontWeight: 700,
        fontSize: { xs: "1rem", md: "1.1rem" },
        marginBottom: { xs: 0.75, md: 1.5 },
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        letterSpacing: "-0.01em",
      },
    },
    socialMedia: {
      display: "flex",
      flexWrap: "wrap",
      gap: { xs: 1.5, md: 3 },
      marginTop: { xs: 1.5, md: 3 },
      justifyContent: "flex-start",
    },
    socialIcon: {
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: "50%",
      padding: 0.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: { xs: "32px", md: "40px" },
      height: { xs: "32px", md: "40px" },
      boxShadow: "0 4px 12px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.06)",
      border: "1px solid rgba(255, 255, 255, 0.6)",
      backdropFilter: "blur(10px)",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      "& svg": {
        width: { xs: "16px", md: "20px" },
        height: { xs: "16px", md: "20px" },
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)",
        transform: "rotate(45deg)",
        transition: "transform 0.6s ease",
        opacity: 0,
      },
      "&:hover": {
        transform: "translateY(-2px) scale(1.1) rotate(3deg)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 4px 12px rgba(80, 122, 96, 0.1)",
        "&::before": {
          opacity: 1,
          transform: "rotate(45deg) translate(50%, 50%)",
        },
      },
    },
    signatureSection: {
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(20px) saturate(1.1)",
      borderRadius: 3,
      padding: 2.5,
      boxShadow: "0 12px 32px rgba(0,0,0,0.06), 0 6px 16px rgba(80, 122, 96, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2.5,
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.08), 0 12px 32px rgba(80, 122, 96, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
      },
      "& img": {
        maxWidth: "100%",
        width: "90%",
        borderRadius: 3,
        boxShadow: "0 16px 40px rgba(0,0,0,0.12), 0 8px 20px rgba(80, 122, 96, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "scale(1.05) rotate(1deg)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.15), 0 12px 30px rgba(80, 122, 96, 0.12)",
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
    serviceLink: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      color: "white",
      textDecoration: "none",
      fontWeight: 700,
      padding: "16px 28px",
      borderRadius: 3,
      display: "inline-block",
      fontSize: "1rem",
      letterSpacing: "0.5px",
      boxShadow: "0 12px 32px rgba(80, 122, 96, 0.25), 0 4px 12px rgba(80, 122, 96, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
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
        transform: "translateY(-3px) scale(1.02)",
        boxShadow: "0 20px 48px rgba(80, 122, 96, 0.35), 0 8px 20px rgba(80, 122, 96, 0.2)",
        "&::before": {
          left: "100%",
        },
      },
    },
  };

  if (!name) return <Typography sx={{ textAlign: "center", p: 4 }}>No artist provided</Typography>;
  if (loading)
    return (
      <Box sx={styles.container}>
        <Box sx={styles.loadingContainer}>
          <CircularProgress sx={{ color: "#507A60" }} />
        </Box>
      </Box> 
    );
  if (error)
    return (
      <Box sx={styles.container}>
        <Box sx={styles.contentWrapper}>
          <Typography sx={styles.errorMessage}>
            Error loading artist: {error.message}
          </Typography>
        </Box>
      </Box>
    );

  if (!data?.artistByName) {
    return (
      <Box sx={styles.container}>
        <Box sx={styles.contentWrapper}>
          <Typography sx={{ textAlign: "center", p: 4 }}>
            No artist found with the name "{name}"
          </Typography>
        </Box>
      </Box>
    );
  }

  const { artistByName } = data;

  const socialMediaLinks: ArtistSocialLink[] = [
    {
      label: "Facebook",
      url: artistByName.facebook,
      icon: FaFacebookF,
      color: "#4267B2",
    },
    {
      label: "Instagram",
      url: artistByName.instagram,
      icon: FaInstagram,
      color: "#C13584",
    },
    {
      label: "Twitter",
      url: artistByName.twitter,
      icon: FaTwitter,
      color: "#1DA1F2",
    },
    {
      label: "Patreon",
      url: artistByName.patreon,
      icon: FaPatreon,
      color: "#f96854",
    },
    {
      label: "YouTube",
      url: artistByName.youtube,
      icon: FaYoutube,
      color: "#FF0000",
    },
    {
      label: "Artstation",
      url: artistByName.artstation,
      icon: FaArtstation,
      color: "#13AFF0",
    },
    {
      label: "Bluesky",
      url: artistByName.bluesky,
      icon: FaBluesky,
      color: "#1285FE",
    },
  ];

  const signatureImage =
    artistByName.haveSignature === "true"
      ? `https://mtgartistconnection.s3.us-west-1.amazonaws.com/signatures/${artistByName.filename}.jpg`
      : `https://mtgartistconnection.s3.us-west-1.amazonaws.com/emptycardframe.jpg`;

  return (
    <Box sx={styles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={styles.contentWrapper}>
          <Box sx={styles.bannerContainer}>
            <img
              src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${artistByName.filename}.jpeg`}
              alt={`${artistByName.name} banner`}
            />
          </Box>
          
          <Typography variant="h2" sx={styles.artistName}>
            {artistByName.name}
          </Typography>
          
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: {
              xs: 'center',
              md: artistByName.omalink ? 'space-between' : 'flex-start'
            },
            gap: { xs: 2, md: 3 },
            mb: 5,
            mt: 3
          }} >
            <Link 
              href={`/allcards/${artistByName.name}`}
              underline="none"
              sx={styles.viewCardsLink}
            >
              <Typography variant="h5">{`View all ${artistByName.name} cards >`}</Typography>
            </Link>
            {artistByName.omalink && (
              <Link
                href={artistByName.omalink}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{
                  ...styles.omaLink,
                  padding: "20px 24px", // Increased vertical padding to match height
                  fontSize: styles.viewCardsLink.fontSize,
                }}
              >
                <Typography component="span" sx={styles.omaLink['& .oma-text']}>Buy this artist's prints & playmats at</Typography>
                <img src="https://mtgartistconnection.s3.us-west-1.amazonaws.com/OMALogo.png" alt="Original Magic Art logo" className="oma-logo" />
              </Link>
            )}
          </Box>

          <Box sx={styles.artistPage}>
            <Box sx={styles.infoSection}>
              <Box sx={styles.artistInfo}>
                <Typography sx={styles.sectionHeader} variant="h4">
                  Artist Info
                </Typography>
                
                <Box sx={styles.infoRow}>
                  <Typography variant="h5">
                    Social Media Links:
                  </Typography>
                  <Box sx={styles.socialMedia}>
                    {socialMediaLinks.map(
                      (link, index) =>
                        link.url && (
                          <Link
                            key={index}
                            href={link.url}
                            target="_blank"
                            sx={styles.socialIcon}
                          >
                            <link.icon
                              size={20}
                              color={link.color}
                            />
                          </Link>
                        )
                    )}
                  </Box>
                </Box>
                
                <Box sx={styles.infoRow}>
                  <Typography variant="h5">Artist Website:</Typography>
                  <Typography>
                    {artistByName.url ? (
                      <Link href={artistByName.url} target="_blank" sx={styles.socialIcon}>
                        <TbWorldWww size={20} color={"#507A60"} />
                      </Link>
                    ) : (
                      "None"
                    )}
                  </Typography>
                </Box>
                
                <Box sx={styles.infoRow}>
                  <Typography variant="h5">Artist Email:</Typography>
                  <Typography>
                    {artistByName.email ? (
                      <Link
                        href={`mailto:${artistByName.email}`}
                        underline="hover"
                        sx={{ color: "#507A60" }}
                      >
                        {artistByName.email}
                      </Link>
                    ) : (
                      "Unknown"
                    )}
                  </Typography>
                </Box>
                
                <Box sx={styles.infoRow}>
                  <Typography variant="h5">Location:</Typography>
                  <Typography>
                    {artistByName.location || "Unknown"}
                  </Typography>
                </Box>
                
                <Box sx={styles.infoRow}>
                  <Typography variant="h5">Currently Signing?:</Typography>
                  <Typography>
                    {capitalizeFirstLetter(artistByName.signing) ||
                      "Unknown"}
                  </Typography>
                </Box>
                
                <Box sx={styles.infoRow}>
                  <Typography variant="h5">
                    Artist Proofs on website?:
                  </Typography>
                  <Typography>
                    {capitalizeFirstLetter(artistByName.artistProofs) ||
                      "Unknown"}
                  </Typography>
                </Box>
                
                {artistByName.signingComment && (
                  <Box sx={styles.infoRow}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        background: "linear-gradient(135deg, rgba(80, 122, 96, 0.08) 0%, rgba(107, 157, 115, 0.12) 100%)", 
                        borderLeft: "4px solid",
                        borderImage: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%) 1",
                        borderRadius: 3,
                        backdropFilter: "blur(15px) saturate(1.1)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
                      }}
                    >
                      <Typography variant="body1" sx={{ 
                        fontStyle: "italic",
                        color: "#2d3748",
                        fontSize: "1.1rem",
                        lineHeight: 1.6,
                      }}>
                        "{artistByName.signingComment}"
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                {artistByName.markssignatureservice &&
                  artistByName.markssignatureservice !== "false" && (
                    <Box sx={styles.infoRow}>
                      <Link
                        sx={styles.serviceLink}
                        target="_blank"
                        href="https://www.facebook.com/groups/545759985597960/?multi_permalinks=1257167887790496&ref=share"
                      >
                        Services offered via Marks Signature Service
                      </Link>
                    </Box>
                  )}
                  
                {artistByName.mountainmage &&
                  artistByName.mountainmage !== "false" && (
                    <Box sx={styles.infoRow}>
                      <Link
                        sx={styles.serviceLink}
                        target="_blank"
                        href={artistByName.mountainmage}
                      >
                        Services offered via MountainMage Service
                      </Link>
                    </Box>
                  )}
              </Box>
              
              <Box sx={styles.signatureSection}>
                <Typography sx={styles.sectionHeader} variant="h4">
                  Example Signature
                </Typography>
                <img src={signatureImage} alt={`${artistByName.name} signature example`} />
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Artist;