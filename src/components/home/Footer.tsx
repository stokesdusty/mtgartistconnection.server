import { homepageStyles } from '../../styles/homepage-styles';
import { Box, Typography } from '@mui/material';

const Footer = () => {
    return <Box sx={homepageStyles.footerContainer}>
            <Typography sx={homepageStyles.footerText}>With love, Dusty Stokes</Typography>
        </Box>;
};

export default Footer;