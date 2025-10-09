import {
    Box,
    Container,
    Typography,
    Paper,
    Link,
  } from "@mui/material";
  import EmailIcon from '@mui/icons-material/Email';
  import { FaBluesky } from "react-icons/fa6";
  
  const ContactPage = () => {
    document.title = "MtG Artist Connection - Contact Us";
  
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
        fontSize: { xs: "2rem", md: "2.8rem" },
        marginBottom: 1.5,
        textAlign: "center",
        letterSpacing: "-0.02em",
        lineHeight: 1,
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-6px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60px",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #507A60, transparent)",
          borderRadius: "1px",
        },
      },
      content: {
        marginBottom: 4,
      },
      paragraph: {
        fontSize: "1.1rem",
        color: "#2d3748",
        lineHeight: 1.6,
        marginBottom: 2,
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        fontWeight: 400,
        letterSpacing: "0.01em",
      },
      contactInfo: {
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px) saturate(1.1)",
        borderRadius: 3,
        padding: 4,
        marginTop: 4,
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 16px 32px rgba(0,0,0,0.08), 0 8px 16px rgba(80, 122, 96, 0.06)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.12), 0 10px 20px rgba(80, 122, 96, 0.08)",
        },
      },
      contactTitle: {
        background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontWeight: 700,
        marginBottom: 2.5,
        fontSize: "1.4rem",
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        letterSpacing: "-0.01em",
      },
      emailContainer: {
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        marginTop: 2.5,
        padding: "12px 16px",
        background: "rgba(255, 255, 255, 0.6)",
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.4)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          background: "rgba(255, 255, 255, 0.9)",
          transform: "translateY(-1px)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        },
      },
      emailIcon: {
        color: "#507A60",
        fontSize: "1.4rem",
      },
      emailLink: {
        color: "#507A60",
        fontWeight: 600,
        textDecoration: "none",
        fontSize: "1.05rem",
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        letterSpacing: "0.01em",
        transition: "all 0.2s ease",
        "&:hover": {
          color: "#3c5c48",
          textDecoration: "none",
          transform: "translateX(2px)",
        },
      },
      responseTime: {
        marginTop: 3,
        color: "#6b7280",
        fontSize: "0.95rem",
        fontStyle: "italic",
        textAlign: "center",
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        background: "rgba(255, 255, 255, 0.7)",
        padding: "8px 16px",
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.4)",
      },
    };
  
    return (
      <Box sx={styles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={styles.wrapper}>
            <Typography variant="h2" sx={styles.headerText}>
              Contact Us
            </Typography>
            
            <Box sx={styles.content}>
              <Typography sx={styles.paragraph}>
                Thank you for visiting MTG Artist Connection! We're dedicated to helping fans connect 
                with the amazing artists behind Magic: The Gathering.
              </Typography>
              
              <Typography sx={styles.paragraph}>
                We welcome submissions about artist information, upcoming signing events, or any other 
                relevant content that would benefit the MTG art community. We're also open to feedback 
                and suggestions on how we can improve the site.
              </Typography>
              
              <Typography sx={styles.paragraph}>
                If you notice any inaccuracies or outdated information on our site, please let us know 
                so we can keep our database as current and helpful as possible.
              </Typography>
            </Box>
            
            <Box sx={styles.contactInfo}>
              <Typography sx={styles.contactTitle}>
                Get In Touch
              </Typography>
              
              <Typography sx={styles.paragraph}>
                For any questions, content submissions, or concerns, please reach out to us:
              </Typography>
              
              <Box sx={styles.emailContainer}>
                <EmailIcon sx={styles.emailIcon} />
                <Link 
                  href="mailto:mtgartistconnection@gmail.com"
                  sx={styles.emailLink}
                >
                  mtgartistconnection@gmail.com
                </Link>
              </Box>

              <Box sx={styles.emailContainer}>
                <FaBluesky color={styles.emailIcon.color} size={24} />
                <Link
                  href="https://bsky.app/profile/mtgartistconnect.bsky.social"
                  target="_blank"
                  sx={styles.emailLink}
                >
                  @mtgartistconnect.bsky.social
                </Link>
              </Box>
              
              <Typography variant="body2" sx={styles.responseTime}>
                We aim to respond to all inquiries within 2 business days.
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  };
  
  export default ContactPage;