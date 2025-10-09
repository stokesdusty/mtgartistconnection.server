import { Box, Typography, Container, Link } from "@mui/material";
import { FaBluesky } from "react-icons/fa6";

const currentYear = new Date().getFullYear();
const copyrightText = `© Copyright ${currentYear} MtGArtistConnection`;

const Footer = () => {
  const styles = {
    footerContainer: {
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(30px) saturate(1.2)",
      borderTop: "1px solid rgba(80, 122, 96, 0.15)",
      padding: { xs: "2rem 1rem", md: "2.5rem" },
      marginTop: "auto",
      position: "relative",
      boxShadow: "0 -8px 32px rgba(0,0,0,0.04), 0 -4px 16px rgba(80, 122, 96, 0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(80, 122, 96, 0.02) 100%)",
        pointerEvents: "none",
      },
    },
    footerContent: {
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      justifyContent: "space-between",
      alignItems: { xs: "center", sm: "center" },
      maxWidth: 1200,
      margin: "0 auto",
      position: "relative",
      zIndex: 1,
      gap: { xs: "1.5rem", sm: "2rem" },
    },
    footerText: {
      color: "#4a5568",
      fontSize: "0.95rem",
      fontWeight: 500,
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      letterSpacing: "0.025em",
      marginBottom: { xs: "0", sm: 0 },
      textAlign: { xs: "center", sm: "left" },
    },
    footerLinks: {
      display: "flex",
      gap: { xs: "1.5rem", md: "2.5rem" },
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent: { xs: "center", sm: "flex-end" },
    },
    link: {
      color: "#507A60",
      fontSize: "0.95rem",
      fontWeight: 600,
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      letterSpacing: "0.025em",
      textDecoration: "none",
      padding: "8px 12px",
      borderRadius: 2,
      background: "rgba(255, 255, 255, 0.7)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.6s ease",
      },
      "&:hover": {
        color: "white",
        background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
        transform: "translateY(-2px)",
        boxShadow: "0 8px 20px rgba(80, 122, 96, 0.2), 0 4px 12px rgba(80, 122, 96, 0.1)",
        textDecoration: "none",
        "&::before": {
          left: "100%",
        },
      },
    },
    iconLink: {
      color: "#507A60",
      padding: "10px",
      borderRadius: 2,
      background: "rgba(255, 255, 255, 0.7)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 0,
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.6s ease",
      },
      "&:hover": {
        color: "white",
        background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
        transform: "translateY(-2px) scale(1.05)",
        boxShadow: "0 8px 20px rgba(80, 122, 96, 0.25), 0 4px 12px rgba(80, 122, 96, 0.15)",
        "&::before": {
          left: "100%",
        },
      },
    },
  };

  return (
    <Box sx={styles.footerContainer}>
      <Container>
        <Box sx={styles.footerContent}>
          <Typography sx={styles.footerText}>{copyrightText}</Typography>
          <Box sx={styles.footerLinks}>
            <Link href="/privacypolicy" sx={styles.link}>Privacy Policy</Link>
            <Link href="/termsofservice" sx={styles.link}>Terms of Service</Link>
            <Link href="/contact" sx={styles.link}>Contact</Link>
            <Link href="https://bsky.app/profile/mtgartistconnect.bsky.social" target="_blank" rel="noopener noreferrer" sx={styles.iconLink}>
              <FaBluesky size={24} />
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;