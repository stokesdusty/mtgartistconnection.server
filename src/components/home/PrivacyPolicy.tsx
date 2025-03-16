import { Box, Container, Typography, Breadcrumbs, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const PrivacyPolicy = () => {
  document.title = "Privacy Policy | MtG Artist Connection";

  const styles = {
    container: {
      backgroundColor: "#507A60",
      minHeight: "100vh",
      padding: { xs: 2, md: 4 },
      paddingTop: { xs: 4, md: 6 },
      paddingBottom: { xs: 8, md: 10 },
    },
    wrapper: {
      maxWidth: 900,
      margin: "0 auto",
      padding: { xs: 2, md: 4 },
      backgroundColor: "#fff",
      borderRadius: 2,
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    },
    header: {
      color: "#507A60",
      fontWeight: 700,
      fontSize: { xs: "1.75rem", md: "2.5rem" },
      marginBottom: 4,
      textAlign: "center",
      paddingTop: 2,
    },
    lastUpdated: {
      fontSize: "0.9rem",
      color: "#666",
      marginBottom: 4,
      textAlign: "center",
    },
    sectionTitle: {
      color: "#507A60",
      fontWeight: 600,
      fontSize: { xs: "1.25rem", md: "1.5rem" },
      marginTop: 4,
      marginBottom: 2,
    },
    paragraph: {
      color: "#444",
      fontSize: "1rem",
      lineHeight: 1.6,
      marginBottom: 2,
    },
    list: {
      paddingLeft: 4,
      marginBottom: 3,
      "& li": {
        marginBottom: 1,
        color: "#444",
        fontSize: "1rem",
        lineHeight: 1.6,
      },
    },
    breadcrumbs: {
      marginBottom: 4,
      "& a": {
        color: "#507A60",
        textDecoration: "none",
        "&:hover": {
          textDecoration: "underline",
        },
      },
    },
  };

  return (
    <Box sx={styles.container}>
      <Container>
        <Box sx={styles.wrapper}>
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            sx={styles.breadcrumbs}
          >
            <Link component={RouterLink} to="/">
              Home
            </Link>
            <Typography color="text.primary">Privacy Policy</Typography>
          </Breadcrumbs>

          <Typography variant="h1" sx={styles.header}>
            Privacy Policy
          </Typography>
          
          <Typography sx={styles.lastUpdated}>
            Last Updated: March 15, 2025
          </Typography>

          <Typography sx={styles.paragraph}>
            At MtG Artist Connection, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            Information We Collect
          </Typography>
          <Typography sx={styles.paragraph}>
            We may collect several types of information from and about users of our website, including:
          </Typography>
          <ul style={styles.list}>
            <li>Personal information such as name and email address when voluntarily provided</li>
            <li>Usage information about your activity on our website</li>
            <li>Device information including your IP address, browser type, and operating system</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <Typography variant="h2" sx={styles.sectionTitle}>
            How We Use Your Information
          </Typography>
          <Typography sx={styles.paragraph}>
            We use the information we collect about you for various purposes, including:
          </Typography>
          <ul style={styles.list}>
            <li>Providing and maintaining our website</li>
            <li>Improving our website and user experience</li>
            <li>Communicating with you about updates or changes to our services</li>
            <li>Analyzing usage patterns and trends</li>
            <li>Complying with legal obligations</li>
          </ul>

          <Typography variant="h2" sx={styles.sectionTitle}>
            Disclosure of Your Information
          </Typography>
          <Typography sx={styles.paragraph}>
            We may disclose your personal information in the following circumstances:
          </Typography>
          <ul style={styles.list}>
            <li>To our service providers and partners who help us operate our website</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>In connection with a business transfer or acquisition</li>
          </ul>

          <Typography variant="h2" sx={styles.sectionTitle}>
            Data Security
          </Typography>
          <Typography sx={styles.paragraph}>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            Your Privacy Rights
          </Typography>
          <Typography sx={styles.paragraph}>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </Typography>
          <ul style={styles.list}>
            <li>The right to access your personal data</li>
            <li>The right to correct inaccurate information</li>
            <li>The right to request deletion of your data</li>
            <li>The right to object to or restrict processing of your data</li>
            <li>The right to data portability</li>
          </ul>
          <Typography sx={styles.paragraph}>
            To exercise these rights, please contact us using the information provided below.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            Third-Party Links
          </Typography>
          <Typography sx={styles.paragraph}>
            Our website may contain links to third-party websites that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites. We encourage you to review the privacy policy of every site you visit.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            Children's Privacy
          </Typography>
          <Typography sx={styles.paragraph}>
            Our website is not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            Changes to Our Privacy Policy
          </Typography>
          <Typography sx={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top. You are advised to review this Privacy Policy periodically for any changes.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            Contact Us
          </Typography>
          <Typography sx={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Typography>
          <Typography sx={styles.paragraph}>
            Email: mtgartistconnection@gmail.com
          </Typography>
          <Typography sx={styles.paragraph}>
            MtG Artist Connection<br />
            Federal Way, WA 98023
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;