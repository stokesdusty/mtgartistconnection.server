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
        backgroundColor: "#507A60",
        minHeight: "100vh",
        padding: { xs: 2, md: 4 },
      },
      wrapper: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: { xs: 3, md: 5 },
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      },
      headerText: {
        color: "#507A60",
        fontWeight: 700,
        fontSize: { xs: "2rem", md: "3rem" },
        marginBottom: 3,
        textAlign: { xs: "center", md: "left" },
      },
      content: {
        marginBottom: 4,
      },
      paragraph: {
        fontSize: "1.1rem",
        color: "#555",
        lineHeight: 1.6,
        marginBottom: 2,
      },
      contactInfo: {
        backgroundColor: "rgba(80, 122, 96, 0.1)",
        borderRadius: 2,
        padding: 3,
        marginTop: 4,
      },
      contactTitle: {
        color: "#507A60",
        fontWeight: 600,
        marginBottom: 2,
        fontSize: "1.3rem",
      },
      emailContainer: {
        display: "flex",
        alignItems: "center",
        gap: 1,
        marginTop: 2,
      },
      emailIcon: {
        color: "#507A60",
      },
      emailLink: {
        color: "#507A60",
        fontWeight: 500,
        textDecoration: "none",
        "&:hover": {
          textDecoration: "underline",
        },
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
                  href="https://bsky.app/profile/mtgartistconnection.bsky.social"
                  target="_blank"
                  sx={styles.emailLink}
                >
                  @mtgartistconnection.bsky.social
                </Link>
              </Box>
              
              <Typography variant="body2" sx={{ mt: 3, color: "#666" }}>
                We aim to respond to all inquiries within 2 business days.
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  };
  
  export default ContactPage;