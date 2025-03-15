import { Box, Typography } from "@mui/material";
import { homepageStyles } from "../../styles/homepage-styles";

const currentYear = new Date().getFullYear();
const copyrightText = `©Copyright ${currentYear} MTGArtistConnection`;

const Footer = () => {
  return (
    <Box sx={homepageStyles.footerContainer}>
      <Typography sx={homepageStyles.footerText}>{copyrightText}</Typography>
    </Box>
  );
};

export default Footer;
