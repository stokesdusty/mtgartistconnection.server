import { Box, Typography, Container } from "@mui/material";
import { contentPageStyles } from "../../styles/content-page-styles";

const AffiliateDisclosure = () => {
  return (
    <Box sx={contentPageStyles.container}>
      <Container maxWidth="md">
        <Box sx={contentPageStyles.content}>
          <Typography variant="h3" sx={contentPageStyles.title}>
            Affiliate Disclosure
          </Typography>

          <Typography sx={contentPageStyles.body}>
            MTG Artist Connection participates in affiliate programs with various partners.
            This page explains our affiliate relationships and how they work.
          </Typography>

          <Typography variant="h5" sx={contentPageStyles.sectionTitle}>
            What Are Affiliate Links?
          </Typography>

          <Typography sx={contentPageStyles.body}>
            Affiliate links are special URLs that help us track when someone visits a partner
            site from MTG Artist Connection. If you make a purchase after clicking one of these
            links, we may earn a small commission at no additional cost to you. Your purchase
            price remains exactly the same whether you use our link or visit the site directly.
          </Typography>

          <Typography variant="h5" sx={contentPageStyles.sectionTitle}>
            Our Affiliate Partners
          </Typography>

          <Typography sx={contentPageStyles.body}>
            We have affiliate relationships with the following partners:
          </Typography>

          <Box component="ul" sx={{
            marginLeft: 3,
            marginTop: 2,
            marginBottom: 3,
            '& li': {
              marginBottom: 2,
              lineHeight: 1.6,
            }
          }}>
            <li>
              <strong>eBay:</strong> Links to eBay from artist pages and throughout the site
              use our eBay Partner Network affiliate code. This helps us earn a small commission
              when you purchase items after clicking through.
            </li>
            <li>
              <strong>Original Magic Art (OMA):</strong> Links to Original Magic Art use our
              affiliate code to help support the site when you purchase original MTG artwork.
            </li>
            <li>
              <strong>Manapool:</strong> Card price links use
              our Manapool affiliate code. We earn a small commission when you purchase cards
              through these links.
            </li>
          </Box>

          <Typography variant="h5" sx={contentPageStyles.sectionTitle}>
            How This Supports MTG Artist Connection
          </Typography>

          <Typography sx={contentPageStyles.body}>
            Affiliate commissions help cover the costs of running MTG Artist Connection,
            including hosting, domain registration, and ongoing development. These earnings
            allow us to keep the site free ad-light, and regularly updated with new features
            and artist information.
          </Typography>

          <Typography variant="h5" sx={contentPageStyles.sectionTitle}>
            Your Privacy and Choice
          </Typography>

          <Typography sx={contentPageStyles.body}>
            Using affiliate links is completely optional. You're free to search for products
            or artists directly on these partner sites if you prefer. The presence of affiliate
            links does not affect our recommendations or the information we provide about artists.
          </Typography>

          <Typography sx={contentPageStyles.body}>
            We are transparent about our affiliate relationships and will always disclose when
            links are affiliate links. Your trust is important to us.
          </Typography>

          <Typography variant="h5" sx={contentPageStyles.sectionTitle}>
            Questions?
          </Typography>

          <Typography sx={contentPageStyles.body}>
            If you have any questions about our affiliate relationships or how we use affiliate
            links, please don't hesitate to <a href="/contact" style={{ color: '#2d4a36' }}>contact us</a>.
          </Typography>

          <Typography sx={{
            fontSize: '0.875rem',
            color: '#757575',
            fontStyle: 'italic',
            marginTop: 4,
            paddingTop: 3,
            borderTop: '1px solid #eeeeee',
          }}>
            Last updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AffiliateDisclosure;
