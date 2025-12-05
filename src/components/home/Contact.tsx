import {
    Box,
    Container,
    Typography,
    Paper,
    Link,
  } from "@mui/material";
  import EmailIcon from '@mui/icons-material/Email';
  import { FaBluesky } from "react-icons/fa6";
  import { contentPageStyles } from "../../styles/content-page-styles";
  
  const ContactPage = () => {
    document.title = "MtG Artist Connection - Contact Us";

    return (
      <Box sx={contentPageStyles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={contentPageStyles.wrapper}>
            <Typography variant="h1" sx={contentPageStyles.pageTitle}>
              Contact Us
            </Typography>

            <Box sx={{ marginBottom: 4 }}>
              <Typography sx={contentPageStyles.paragraph}>
                Thank you for visiting MTG Artist Connection! We're dedicated to helping fans connect
                with the amazing artists behind Magic: The Gathering.
              </Typography>

              <Typography sx={contentPageStyles.paragraph}>
                We welcome submissions about artist information, upcoming signing events, or any other
                relevant content that would benefit the MTG art community. We're also open to feedback
                and suggestions on how we can improve the site.
              </Typography>

              <Typography sx={contentPageStyles.paragraph}>
                If you notice any inaccuracies or outdated information on our site, please let us know
                so we can keep our database as current and helpful as possible.
              </Typography>
            </Box>

            <Box sx={contentPageStyles.contactInfo}>
              <Typography sx={contentPageStyles.contactTitle}>
                Get In Touch
              </Typography>

              <Typography sx={contentPageStyles.paragraph}>
                For any questions, content submissions, or concerns, please reach out to us:
              </Typography>

              <Box sx={contentPageStyles.contactMethod}>
                <EmailIcon sx={contentPageStyles.contactIcon} />
                <Link
                  href="mailto:mtgartistconnection@gmail.com"
                  sx={contentPageStyles.contactLink}
                >
                  mtgartistconnection@gmail.com
                </Link>
              </Box>

              <Box sx={contentPageStyles.contactMethod}>
                <FaBluesky color="#2d4a36" size={24} />
                <Link
                  href="https://bsky.app/profile/mtgartistconnect.bsky.social"
                  target="_blank"
                  sx={contentPageStyles.contactLink}
                >
                  @mtgartistconnect.bsky.social
                </Link>
              </Box>

              <Typography variant="body2" sx={contentPageStyles.responseTime}>
                We aim to respond to all inquiries within 2 business days.
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  };
  
  export default ContactPage;