import {
  Box,
  Link,
  Typography,
  Container,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import { useEffect } from "react";

interface Service {
  name: string;
  artistCount: string;
  costPerSignature: string;
  servicesOffered: string;
  description: string;
  website?: string;
  facebookGroup: string;
}

const services: Service[] = [
  {
    name: "Mark's Signature Service",
    artistCount: "100+",
    costPerSignature: "$3-$5 Regular, $7-$10 Shadow",
    servicesOffered: "Signing, Proofs, Playmats, Original Art",
    description:
      "Probably the most well known of the signing services, Mark's Artist Signature Signing Service operates out of a Facebook group. With 6.4k members, and plenty of happy customers posting in the group daily, he is a trusted resource. Often seen with artists at MtG related events, Mark offers signing for a big list of artists, as well as artist proofs, prints, playmats, and even original artwork.",
    facebookGroup:
      "https://www.facebook.com/groups/545759985597960/?multi_permalinks=1257167887790496&ref=share",
  },
  {
    name: "MountainMage MTG Signature Service",
    artistCount: "150+",
    costPerSignature: "$2-$8 Regular, Unknown Shadow",
    servicesOffered: "Signing, Proofs, Original Art",
    description:
      "If Facebook is not your forte, MountainMage is another signature service that has its own website. Offering a very extensive list of artists, MountainMage is another of the biggest services out there. You can select the artist you want, throw a signature in the shopping cart, and pay your way into the next signing.",
    website: "https://mountainmagesigs.com/",
    facebookGroup:
      "https://www.facebook.com/groups/545759985597960/?multi_permalinks=1257167887790496&ref=share",
  },
];

const introParagraphs = [
  "For us, signed Magic: the Gathering cards put the Collectible in Collectible Card Game. But it should come as no surprise that we are biased. But hey, we like to think that most people's interest piques when they see a signed card enter the battlefield. That interest may soon turn to jealousy or even desire, but how do they go about getting their own cards signed?",
  "While many artists offer mail-in signings, or are on the MtG event circuit and sign in person, others are only taking in cards to sign from one or more of the services that manage and handle the logistics for them. There are a few such services, but the majority of artists use MountainMage or Mark's services.",
];

const howItWorksParagraphs = [
  "Generally speaking, the process for getting a card signed through a service is simple, albeit time consuming. Both of the above services post a schedule of upcoming signings, from which will be a deadline. This deadline is the date that the service needs to receive your cards to be included in the signing.",
  "Once you have picked out an artist and a date, you will need to decide if you want a regular signature, shadow signature, or perhaps some other custom job that is being offered, and then fill out a form with the pertinent information and submit that with your payment. Finally, you send your cards in and play the waiting game.",
  "Turnaround times for receiving your cards back can vary pretty greatly depending on the service and the artist, but in our personal experiences, these services are quite communicative and do a fairly good job of getting everyone's signatures in an expedient fashion.",
];

const SigningServices = () => {
  useEffect(() => {
    document.title = "MtG Artist Connection - Card Signing Services";
  }, []);
  
  const styles = {
    container: {
      background: "linear-gradient(135deg, #507A60 0%, #3c5c48 50%, #2d4a36 100%)",
      minHeight: "100vh",
      padding: { xs: 3, md: 6 },
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)",
        pointerEvents: "none",
      },
    },
    wrapper: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: { xs: 2, md: 3 },
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(30px) saturate(1.2)",
      borderRadius: 4,
      boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 16px 40px rgba(80, 122, 96, 0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      position: "relative",
      zIndex: 1,
    },
    headerText: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 800,
      fontSize: { xs: "2.2rem", md: "3.2rem" },
      marginBottom: 3,
      textAlign: "center",
      letterSpacing: "-0.02em",
      lineHeight: 1,
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "-8px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100px",
        height: "3px",
        background: "linear-gradient(90deg, transparent, #507A60, transparent)",
        borderRadius: "2px",
      },
    },
    sectionTitle: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 700,
      fontSize: { xs: "1.8rem", md: "2.4rem" },
      marginTop: 4,
      marginBottom: 3,
      textAlign: "center",
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      letterSpacing: "-0.01em",
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "-6px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "60px",
        height: "2px",
        background: "linear-gradient(90deg, transparent, #507A60, transparent)",
        borderRadius: "1px",
      },
    },
    paragraph: {
      fontSize: "1.1rem",
      color: "#2d3748",
      lineHeight: 1.7,
      marginBottom: 2.5,
      textAlign: "left",
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 400,
    },
    serviceCard: {
      marginTop: 4,
      padding: 4,
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(20px) saturate(1.1)",
      borderRadius: 4,
      boxShadow: "0 16px 48px rgba(0,0,0,0.06), 0 8px 24px rgba(80, 122, 96, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.08), 0 12px 32px rgba(80, 122, 96, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
      },
    },
    serviceName: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 800,
      fontSize: { xs: "1.6rem", md: "2.2rem" },
      marginBottom: 3,
      textAlign: "center",
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      letterSpacing: "-0.01em",
    },
    serviceStats: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      justifyContent: "space-between",
      gap: 3,
      marginBottom: 3,
      padding: 3,
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      borderRadius: 3,
      border: "1px solid rgba(255, 255, 255, 0.5)",
      transition: "all 0.3s ease",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.95)",
        transform: "translateY(-1px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      },
    },
    statItem: {
      textAlign: "center",
      flex: 1,
      padding: 2,
      borderRadius: 2,
      background: "rgba(255, 255, 255, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      transition: "all 0.2s ease",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.9)",
        transform: "translateY(-1px)",
      },
    },
    statLabel: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 700,
      fontSize: "1rem",
      marginBottom: 1,
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    },
    statValue: {
      fontSize: "1rem",
      color: "#2d3748",
      fontWeight: 500,
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    },
    serviceInfo: {
      background: "rgba(255, 255, 255, 0.7)",
      borderRadius: 3,
      padding: 3,
      border: "1px solid rgba(255, 255, 255, 0.5)",
      transition: "all 0.3s ease",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.9)",
        transform: "translateY(-1px)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
      },
    },
    link: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 600,
      textDecoration: "none",
      position: "relative",
      transition: "all 0.3s ease",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "-2px",
        left: 0,
        width: "0%",
        height: "2px",
        background: "linear-gradient(90deg, #507A60, #6b9d73)",
        transition: "width 0.3s ease",
      },
      "&:hover::after": {
        width: "100%",
      },
    },
    divider: {
      margin: "32px 0",
      height: "2px",
      background: "linear-gradient(90deg, transparent, rgba(80, 122, 96, 0.3), transparent)",
      border: "none",
    },
  };

  const ServiceStatItem = ({ label, value }: { label: string; value: string }) => {
    return (
      <Box sx={styles.statItem}>
        <Typography sx={styles.statLabel}>{label}</Typography>
        <Typography sx={styles.statValue}>{value}</Typography>
      </Box>
    );
  };

  const ServiceGroupContainer = ({ service }: { service: Service }) => {
    return (
      <Paper elevation={0} sx={styles.serviceCard}>
        <Typography variant="h3" sx={styles.serviceName}>
          {service.name}
        </Typography>
        
        <Box sx={styles.serviceStats}>
          <ServiceStatItem label="# of Artists" value={service.artistCount} />
          <ServiceStatItem
            label="Cost Per Signature"
            value={service.costPerSignature}
          />
          <ServiceStatItem
            label="Services Offered"
            value={service.servicesOffered}
          />
        </Box>
        
        <Box sx={styles.serviceInfo}>
          <Typography sx={styles.paragraph}>
            {service.description}
          </Typography>
          <Box mt={2}>
            <Typography sx={{ ...styles.paragraph, mb: 0 }}>
              You can view and join their Facebook group{" "}
              <Link
                sx={styles.link}
                href={service.facebookGroup}
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </Link>
              {service.website && (
                <>
                  {" "}
                  or visit their{" "}
                  <Link 
                    sx={styles.link} 
                    href={service.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    website
                  </Link>
                </>
              )}.
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={styles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={styles.wrapper}>
          <Typography variant="h2" sx={styles.headerText}>
            Card Signing Services
          </Typography>
          
          <Box mb={4}>
            {introParagraphs.map((paragraph, index) => (
              <Typography key={index} sx={styles.paragraph}>
                {paragraph}
              </Typography>
            ))}
          </Box>
          
          <Divider sx={styles.divider} />
          
          <Typography variant="h3" sx={styles.sectionTitle}>
            How Do These Services Work?
          </Typography>
          
          <Box mb={4}>
            {howItWorksParagraphs.map((paragraph, index) => (
              <Typography key={index} sx={styles.paragraph}>
                {paragraph}
              </Typography>
            ))}
          </Box>
          
          <Divider sx={styles.divider} />
          
          <Typography variant="h3" sx={styles.sectionTitle}>
            Available Services
          </Typography>
          
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item xs={12} key={service.name}>
                <ServiceGroupContainer service={service} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default SigningServices;