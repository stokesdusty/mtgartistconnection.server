import { Box, Typography, Container, Paper } from "@mui/material";
import PageMeta from "../shared/PageMeta";
import { contentPageStyles } from "../../styles/content-page-styles";
import { colors, themeColors, spacing } from "../../styles/design-tokens";

const AffiliateDisclosure = () => {
  return (
    <Box sx={contentPageStyles.container}>
      <PageMeta
        title="Affiliate Disclosure"
        description="MtG Artist Connection affiliate disclosure. Learn about our partnerships and how we may earn commissions from qualifying purchases."
        path="/affiliate-disclosure"
      />
      <Container maxWidth="md">
        <Paper elevation={0} sx={contentPageStyles.wrapper}>
          <Typography variant="h1" sx={contentPageStyles.pageTitle}>
            Affiliate Disclosure
          </Typography>

          <Typography sx={contentPageStyles.paragraph}>
            MTG Artist Connection participates in affiliate programs with various partners.
            This page explains our affiliate relationships and how they work.
          </Typography>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            What Are Affiliate Links?
          </Typography>

          <Typography sx={contentPageStyles.paragraph}>
            Affiliate links are special URLs that help us track when someone visits a partner
            site from MTG Artist Connection. If you make a purchase after clicking one of these
            links, we may earn a small commission at no additional cost to you. Your purchase
            price remains exactly the same whether you use our link or visit the site directly.
          </Typography>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            Our Affiliate Partners
          </Typography>

          <Typography sx={contentPageStyles.paragraph}>
            We have affiliate relationships with the following partners:
          </Typography>

          <Box component="ul" sx={{
            paddingLeft: spacing.xxl,
            marginBottom: spacing.lg,
            '& li': {
              marginBottom: spacing.sm,
              color: themeColors.text.secondary,
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
            <li>
              <strong>Card Kingdom:</strong> Card price links use
              our Card Kingdom affiliate code. We earn a small commission when you purchase cards
              through these links.
            </li>
            <li>
              <strong>TCGPlayer:</strong> Card price links use
              our TCGPlayer affiliate code. We earn a small commission when you purchase cards
              through these links.
            </li>
          </Box>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            How This Supports MTG Artist Connection
          </Typography>

          <Typography sx={contentPageStyles.paragraph}>
            Affiliate commissions help cover the costs of running MTG Artist Connection,
            including hosting, domain registration, and ongoing development. These earnings
            allow us to keep the site free and ad-light, and regularly updated with new features
            and artist information.
          </Typography>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            Your Privacy and Choice
          </Typography>

          <Typography sx={contentPageStyles.paragraph}>
            Using affiliate links is completely optional. You're free to search for products
            or artists directly on these partner sites if you prefer. The presence of affiliate
            links does not affect our recommendations or the information we provide about artists.
          </Typography>

          <Typography sx={contentPageStyles.paragraph}>
            We are transparent about our affiliate relationships and will always disclose when
            links are affiliate links. Your trust is important to us.
          </Typography>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            Questions?
          </Typography>

          <Typography sx={contentPageStyles.paragraph}>
            If you have any questions about our affiliate relationships or how we use affiliate
            links, please don't hesitate to <a href="/contact" style={{ color: colors.primary.main }}>contact us</a>.
          </Typography>

          <Typography sx={{
            fontSize: '0.875rem',
            color: themeColors.text.secondary,
            fontStyle: 'italic',
            marginTop: spacing.xl,
            paddingTop: spacing.lg,
            borderTop: `1px solid ${themeColors.neutral[200]}`,
          }}>
            Last updated: May 24, 2026
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default AffiliateDisclosure;
