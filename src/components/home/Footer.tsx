import { Box, Typography, Container, Link } from "@mui/material";

const currentYear = new Date().getFullYear();
const copyrightText = `© Copyright ${currentYear} MtGArtistConnection`;

const Footer = () => {
  // Modern styles with #507A60 as primary color
  const styles = {
    footerContainer: {
      backgroundColor: "#f8f9fa",
      borderTop: "1px solid #e9ecef",
      padding: { xs: "1.5rem 1rem", md: "2rem" },
      marginTop: "auto",
    },
    footerContent: {
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      justifyContent: "space-between",
      alignItems: { xs: "center", sm: "flex-start" },
      maxWidth: 1200,
      margin: "0 auto",
    },
    footerText: {
      color: "#666",
      fontSize: "0.9rem",
      marginBottom: { xs: "1rem", sm: 0 },
    },
    footerLinks: {
      display: "flex",
      gap: { xs: "1rem", md: "2rem" },
    },
    link: {
      color: "#507A60",
      fontSize: "0.9rem",
      textDecoration: "none",
      transition: "color 0.2s",
      "&:hover": {
        color: "#3d5d49",
        textDecoration: "underline",
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
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;