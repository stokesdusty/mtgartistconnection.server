import { Box, Container, Typography, Breadcrumbs, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const TermsOfService = () => {
  document.title = "Terms of Service | MtG Artist Connection";

  const styles = {
    container: {
      backgroundColor: "#f8f9fa",
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
            <Typography color="text.primary">Terms of Service</Typography>
          </Breadcrumbs>

          <Typography variant="h1" sx={styles.header}>
            Terms of Service
          </Typography>
          
          <Typography sx={styles.lastUpdated}>
            Last Updated: March 15, 2025
          </Typography>

          <Typography sx={styles.paragraph}>
            Welcome to MtG Artist Connection. Please read these Terms of Service ("Terms") carefully as they contain important information about your legal rights, remedies, and obligations. By accessing or using MtG Artist Connection, you agree to comply with and be bound by these Terms.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            1. Acceptance of Terms
          </Typography>
          <Typography sx={styles.paragraph}>
            By accessing or using our website, you agree to these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use our website.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            2. Changes to Terms
          </Typography>
          <Typography sx={styles.paragraph}>
            We reserve the right to modify these Terms at any time. We will provide notice of any material changes by updating the "Last Updated" date at the top of these Terms. Your continued use of the website following such changes constitutes your acceptance of the modified Terms.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            3. Accessing the Website
          </Typography>
          <Typography sx={styles.paragraph}>
            We reserve the right to withdraw or modify the website, and any service or material we provide on the website, in our sole discretion without notice. We will not be liable if, for any reason, all or any part of the website is unavailable at any time or for any period.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            4. Intellectual Property Rights
          </Typography>
          <Typography sx={styles.paragraph}>
            The website and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof), are owned by MtG Artist Connection, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </Typography>
          <Typography sx={styles.paragraph}>
            Magic: The Gathering and its respective properties are owned by Wizards of the Coast. MtG Artist Connection is not affiliated with, endorsed, sponsored, or approved by Wizards of the Coast. This website is for informational purposes only.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            5. Prohibited Uses
          </Typography>
          <Typography sx={styles.paragraph}>
            You may use the website only for lawful purposes and in accordance with these Terms. You agree not to use the website:
          </Typography>
          <ul style={styles.list}>
            <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation</li>
            <li>To impersonate or attempt to impersonate MtG Artist Connection, an employee, another user, or any other person or entity</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the website, or which may harm MtG Artist Connection or users of the website</li>
          </ul>

          <Typography variant="h2" sx={styles.sectionTitle}>
            6. User Contributions
          </Typography>
          <Typography sx={styles.paragraph}>
            Our website may contain message boards, forums, bulletin boards, and other interactive features that allow users to post, submit, publish, display, or transmit content or materials. Any user contribution you post will be considered non-confidential and non-proprietary. By providing any user contribution, you grant us and our affiliates a non-exclusive, royalty-free, perpetual, irrevocable right to use, reproduce, modify, adapt, publish, translate, distribute, and display such content.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            7. Content Standards
          </Typography>
          <Typography sx={styles.paragraph}>
            User contributions must comply with all applicable laws and regulations. Without limiting the foregoing, user contributions must not:
          </Typography>
          <ul style={styles.list}>
            <li>Contain any defamatory, obscene, indecent, abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable material</li>
            <li>Infringe any patent, trademark, trade secret, copyright, or other intellectual property rights of any party</li>
            <li>Impersonate any person, or misrepresent your identity or affiliation with any person or organization</li>
            <li>Contain any material that could constitute or encourage conduct that would be considered a criminal offense, give rise to civil liability, or otherwise violate any law</li>
          </ul>

          <Typography variant="h2" sx={styles.sectionTitle}>
            8. Copyright Infringement
          </Typography>
          <Typography sx={styles.paragraph}>
            If you believe that any content on our website violates your copyright, please notify us in accordance with our Copyright Policy. It is our policy to terminate the accounts of repeat infringers.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            9. Limitation of Liability
          </Typography>
          <Typography sx={styles.paragraph}>
            To the fullest extent provided by law, in no event will MtG Artist Connection, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the website, including any direct, indirect, special, incidental, consequential, or punitive damages.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            10. Indemnification
          </Typography>
          <Typography sx={styles.paragraph}>
            You agree to defend, indemnify, and hold harmless MtG Artist Connection, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the website.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            11. Governing Law and Jurisdiction
          </Typography>
          <Typography sx={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any principles of conflicts of law. Any legal action or proceeding relating to your access to, or use of, the website or these Terms shall be instituted in a state or federal court in California.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            12. Waiver and Severability
          </Typography>
          <Typography sx={styles.paragraph}>
            No waiver by MtG Artist Connection of any term or condition set out in these Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of MtG Artist Connection to assert a right or provision under these Terms shall not constitute a waiver of such right or provision.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            13. Entire Agreement
          </Typography>
          <Typography sx={styles.paragraph}>
            These Terms and our Privacy Policy constitute the sole and entire agreement between you and MtG Artist Connection regarding the website and supersede all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, regarding the website.
          </Typography>

          <Typography variant="h2" sx={styles.sectionTitle}>
            14. Contact Information
          </Typography>
          <Typography sx={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
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

export default TermsOfService;