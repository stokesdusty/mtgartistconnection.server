import { Box, Typography, Container, Link } from "@mui/material";
import { FaBluesky } from "react-icons/fa6";
import { footerStyles } from "../../styles/footer-styles";

const currentYear = new Date().getFullYear();
const copyrightText = `© ${currentYear} MTG Artist Connection`;

const Footer = () => {
  return (
    <Box sx={footerStyles.footerContainer}>
      <Container>
        <Box sx={footerStyles.footerContent}>
          <Typography sx={footerStyles.footerText}>{copyrightText}</Typography>
          <Box sx={footerStyles.footerLinks}>
            <Link href="/privacypolicy" sx={footerStyles.link}>Privacy Policy</Link>
            <Link href="/termsofservice" sx={footerStyles.link}>Terms of Service</Link>
            <Link href="/contact" sx={footerStyles.link}>Contact</Link>
            <Link href="https://bsky.app/profile/mtgartistconnect.bsky.social" target="_blank" rel="noopener noreferrer" sx={footerStyles.iconLink}>
              <FaBluesky size={20} />
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;