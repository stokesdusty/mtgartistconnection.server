import { homepageStyles } from '../../styles/homepage-styles';
import { Box, Typography } from '@mui/material';

const Footer = () => {
    return <Box sx={homepageStyles.footerContainer}>
            <Typography sx={homepageStyles.footerText}>©Copyright MTGArtistConnection </Typography>
        </Box>;
};

export default Footer;