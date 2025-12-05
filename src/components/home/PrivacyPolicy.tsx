import { Box, Container, Typography, Breadcrumbs, Link, Paper } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { contentPageStyles } from "../../styles/content-page-styles";
import { colors, spacing } from "../../styles/design-tokens";

const PrivacyPolicy = () => {
  document.title = "Privacy Policy | MtG Artist Connection";

  return (
    <Box sx={contentPageStyles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={contentPageStyles.wrapper}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{
              marginBottom: spacing.xl,
              '& a': {
                color: colors.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              },
            }}
          >
            <Link component={RouterLink} to="/">
              Home
            </Link>
            <Typography color="text.primary">Privacy Policy</Typography>
          </Breadcrumbs>

          <Typography variant="h1" sx={contentPageStyles.pageTitle}>
            Privacy Policy
          </Typography>

          <Typography sx={{
            fontSize: '0.9rem',
            color: colors.text.secondary,
            marginBottom: spacing.xxl,
            textAlign: 'center'
          }}>
            Last Updated: March 15, 2025
          </Typography>

          <Typography sx={contentPageStyles.paragraph}>
            At MtG Artist Connection, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website.
          </Typography>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            Information We Collect
          </Typography>
          <Typography sx={contentPageStyles.paragraph}>
            We may collect several types of information from and about users of our website, including:
          </Typography>
          <Box component="ul" sx={{ paddingLeft: spacing.xxl, marginBottom: spacing.lg, '& li': { marginBottom: spacing.sm, color: colors.text.secondary, lineHeight: 1.6 } }}>
            <li>Personal information such as name and email address when voluntarily provided</li>
            <li>Usage information about your activity on our website</li>
            <li>Device information including your IP address, browser type, and operating system</li>
            <li>Cookies and similar tracking technologies</li>
          </Box>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            How We Use Your Information
          </Typography>
          <Typography sx={contentPageStyles.paragraph}>
            We use the information we collect about you for various purposes, including:
          </Typography>
          <Box component="ul" sx={{ paddingLeft: spacing.xxl, marginBottom: spacing.lg, '& li': { marginBottom: spacing.sm, color: colors.text.secondary, lineHeight: 1.6 } }}>
            <li>Providing and maintaining our website</li>
            <li>Improving our website and user experience</li>
            <li>Communicating with you about updates or changes to our services</li>
            <li>Analyzing usage patterns and trends</li>
            <li>Complying with legal obligations</li>
          </Box>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            Disclosure of Your Information
          </Typography>
          <Typography sx={contentPageStyles.paragraph}>
            We may disclose your personal information in the following circumstances:
          </Typography>
          <Box component="ul" sx={{ paddingLeft: spacing.xxl, marginBottom: spacing.lg, '& li': { marginBottom: spacing.sm, color: colors.text.secondary, lineHeight: 1.6 } }}>
            <li>To our service providers and partners who help us operate our website</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>In connection with a business transfer or acquisition</li>
          </Box>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            Data Security
          </Typography>
          <Typography sx={contentPageStyles.paragraph}>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
          </Typography>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            Your Privacy Rights
          </Typography>
          <Typography sx={contentPageStyles.paragraph}>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </Typography>
          <Box component="ul" sx={{ paddingLeft: spacing.xxl, marginBottom: spacing.lg, '& li': { marginBottom: spacing.sm, color: colors.text.secondary, lineHeight: 1.6 } }}>
            <li>The right to access your personal data</li>
            <li>The right to correct inaccurate information</li>
            <li>The right to request deletion of your data</li>
            <li>The right to object to or restrict processing of your data</li>
            <li>The right to data portability</li>
          </Box>
          <Typography sx={contentPageStyles.paragraph}>
            To exercise these rights, please contact us using the information provided below.
          </Typography>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            Third-Party Links
          </Typography>
          <Typography sx={contentPageStyles.paragraph}>
            Our website may contain links to third-party websites that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites. We encourage you to review the privacy policy of every site you visit.
          </Typography>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            Children's Privacy
          </Typography>
          <Typography sx={contentPageStyles.paragraph}>
            Our website is not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </Typography>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            Changes to Our Privacy Policy
          </Typography>
          <Typography sx={contentPageStyles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top. You are advised to review this Privacy Policy periodically for any changes.
          </Typography>

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            Contact Us
          </Typography>
          <Typography sx={contentPageStyles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Typography>
          <Typography sx={contentPageStyles.paragraph}>
            Email: mtgartistconnection@gmail.com
          </Typography>
          <Typography sx={contentPageStyles.paragraph}>
            MtG Artist Connection<br />
            Federal Way, WA 98023
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;