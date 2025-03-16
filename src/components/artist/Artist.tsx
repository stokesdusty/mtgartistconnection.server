import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_ARTIST_BY_NAME } from "../graphql/queries";
import {
  Box,
  Link,
  Typography,
  CircularProgress,
  Container,
  Paper,
} from "@mui/material";
import { TbWorldWww } from "react-icons/tb";
import {
  FaArtstation,
  FaFacebookF,
  FaInstagram,
  FaPatreon,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";
import { Timeline } from "react-twitter-widgets";
import { useEffect } from "react";
import { capitalizeFirstLetter } from "../../utils";

interface ArtistSocialLink {
  label: string;
  url: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}

const Artist = () => {
  const { name } = useParams<{ name: string }>();

  useEffect(() => {
    if (name) document.title = `MtG Artist Connection - ${name}`;
  }, [name]);

  const { data, error, loading } = useQuery(
    GET_ARTIST_BY_NAME,
    {
      variables: { name: name || "" },
      skip: !name,
    }
  );

  const getTwitterHandle = (twitterUrl: string): string | null => {
    const match = twitterUrl.match(
      /^https?:\/\/(www\.)?(x|twitter).com\/@?(?<handle>\w+)/
    );
    return match?.groups?.handle ? `@${match.groups.handle}` : null;
  };

  // Modernized styles to match homepage
  const styles = {
    container: {
      backgroundColor: "#507A60",
      minHeight: "100vh",
      padding: { xs: 2, md: 4 },
    },
    contentWrapper: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: { xs: 2, md: 4 },
      backgroundColor: "#fff",
      borderRadius: 2,
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    },
    bannerContainer: {
      width: "100%",
      height: { xs: "150px", md: "200px" },
      overflow: "hidden",
      marginBottom: 4,
      borderRadius: 2,
      "& img": {
        width: "100%",
        height: "100%",
        objectFit: "cover",
      },
    },
    artistName: {
      color: "#507A60",
      fontWeight: 700,
      fontSize: { xs: "2rem", md: "2.5rem" },
      marginBottom: 2,
    },
    viewCardsLink: {
      color: "#507A60",
      textDecoration: "none",
      fontWeight: 600,
      display: "inline-block",
      marginBottom: 3,
      transition: "color 0.2s ease",
      "&:hover": {
        color: "#3c5c48",
      },
    },
    artistPage: {
      width: "100%",
    },
    infoSection: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      gap: 4,
      alignItems: { xs: "center", md: "flex-start" },
    },
    artistInfo: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: { xs: "100%", md: "400px" },
    },
    sectionHeader: {
      color: "#507A60",
      fontWeight: 600,
      fontSize: "1.5rem",
      marginBottom: 2,
      paddingBottom: 1,
      borderBottom: "2px solid #507A60",
    },
    infoRow: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      marginBottom: 2,
      width: "100%",
      "& h5": {
        color: "#507A60",
        fontWeight: 600,
        fontSize: "1rem",
      },
    },
    socialMedia: {
      display: "flex",
      flexWrap: "wrap",
      gap: 1,
      marginTop: 1,
    },
    socialIcon: {
      transition: "transform 0.2s ease",
      "&:hover": {
        transform: "scale(1.1)",
      },
    },
    signatureSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: { xs: "center", md: "flex-start" },
      gap: 2,
      "& img": {
        maxWidth: "300px",
        border: "1px solid #eee",
        borderRadius: 1,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
    },
    twitterSection: {
      marginTop: { xs: 4, md: 0 },
      width: { xs: "100%", md: "400px" },
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50vh",
    },
    errorMessage: {
      color: "#d32f2f",
      textAlign: "center",
      padding: 4,
      backgroundColor: "rgba(211, 47, 47, 0.1)",
      borderRadius: 2,
    },
    serviceLink: {
      color: "#507A60",
      textDecoration: "none",
      fontWeight: 500,
      padding: "8px 16px",
      backgroundColor: "rgba(80, 122, 96, 0.1)",
      borderRadius: 1,
      display: "inline-block",
      transition: "background-color 0.2s ease",
      "&:hover": {
        backgroundColor: "rgba(80, 122, 96, 0.2)",
      },
    },
  };

  // Early return for loading or error states
  if (!name) return <Typography sx={{ textAlign: "center", p: 4 }}>No artist provided</Typography>;
  if (loading)
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress sx={{ color: "#507A60" }} />
      </Box>
    );
  if (error)
    return (
      <Box sx={styles.container}>
        <Box sx={styles.contentWrapper}>
          <Typography sx={styles.errorMessage}>
            Error loading artist: {error.message}
          </Typography>
        </Box>
      </Box>
    );

  // Ensure data exists before proceeding
  if (!data?.artistByName) {
    return (
      <Box sx={styles.container}>
        <Box sx={styles.contentWrapper}>
          <Typography sx={{ textAlign: "center", p: 4 }}>
            No artist found with the name "{name}"
          </Typography>
        </Box>
      </Box>
    );
  }

  const { artistByName } = data;
  const twitterHandle = artistByName.twitter
    ? getTwitterHandle(artistByName.twitter)?.replace("@", "")
    : null;

  const socialMediaLinks: ArtistSocialLink[] = [
    {
      label: "Facebook",
      url: artistByName.facebook,
      icon: FaFacebookF,
      color: "#4267B2",
    },
    {
      label: "Instagram",
      url: artistByName.instagram,
      icon: FaInstagram,
      color: "#C13584",
    },
    {
      label: "Twitter",
      url: artistByName.twitter,
      icon: FaTwitter,
      color: "#1DA1F2",
    },
    {
      label: "Patreon",
      url: artistByName.patreon,
      icon: FaPatreon,
      color: "#f96854",
    },
    {
      label: "YouTube",
      url: artistByName.youtube,
      icon: FaYoutube,
      color: "#FF0000",
    },
    {
      label: "Artstation",
      url: artistByName.artstation,
      icon: FaArtstation,
      color: "#13AFF0",
    },
    {
      label: "Bluesky",
      url: artistByName.bluesky,
      icon: FaBluesky,
      color: "#1285FE",
    },
  ];

  const signatureImage =
    artistByName.haveSignature === "true"
      ? `https://mtgartistconnection.s3.us-west-1.amazonaws.com/signatures/${artistByName.filename}.jpg`
      : `https://mtgartistconnection.s3.us-west-1.amazonaws.com/emptycardframe.jpg`;

  return (
    <Box sx={styles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={styles.contentWrapper}>
          <Box sx={styles.bannerContainer}>
            <img
              src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${artistByName.filename}.jpeg`}
              alt={`${artistByName.name} banner`}
            />
          </Box>
          
          <Typography variant="h2" sx={styles.artistName}>
            {artistByName.name}
          </Typography>
          
          <Link 
            href={`/allcards/${artistByName.name}`}
            underline="none"
            sx={styles.viewCardsLink}
          >
            <Typography variant="h5">{`View all ${artistByName.name} cards >`}</Typography>
          </Link>
          
          <Box sx={styles.artistPage}>
            <Box sx={styles.infoSection}>
              <Box sx={styles.artistInfo}>
                <Typography sx={styles.sectionHeader} variant="h4">
                  Artist Info
                </Typography>
                
                <Box sx={styles.infoRow}>
                  <Typography variant="h5">
                    Social Media Links:
                  </Typography>
                  <Box sx={styles.socialMedia}>
                    {socialMediaLinks.map(
                      (link, index) =>
                        link.url && (
                          <Link
                            key={index}
                            href={link.url}
                            target="_blank"
                            sx={styles.socialIcon}
                          >
                            <link.icon
                              size={30}
                              color={link.color}
                            />
                          </Link>
                        )
                    )}
                  </Box>
                </Box>
                
                <Box sx={styles.infoRow}>
                  <Typography variant="h5">Artist Website:</Typography>
                  <Typography>
                    {artistByName.url ? (
                      <Link href={artistByName.url} target="_blank" sx={styles.socialIcon}>
                        <TbWorldWww size={30} color={"#507A60"} />
                      </Link>
                    ) : (
                      "None"
                    )}
                  </Typography>
                </Box>
                
                <Box sx={styles.infoRow}>
                  <Typography variant="h5">Artist Email:</Typography>
                  <Typography>
                    {artistByName.email ? (
                      <Link
                        href={`mailto:${artistByName.email}`}
                        underline="hover"
                        sx={{ color: "#507A60" }}
                      >
                        {artistByName.email}
                      </Link>
                    ) : (
                      "Unknown"
                    )}
                  </Typography>
                </Box>
                
                <Box sx={styles.infoRow}>
                  <Typography variant="h5">Location:</Typography>
                  <Typography>
                    {artistByName.location || "Unknown"}
                  </Typography>
                </Box>
                
                <Box sx={styles.infoRow}>
                  <Typography variant="h5">Offer Signing?:</Typography>
                  <Typography>
                    {capitalizeFirstLetter(artistByName.signing) ||
                      "Unknown"}
                  </Typography>
                </Box>
                
                <Box sx={styles.infoRow}>
                  <Typography variant="h5">
                    Artist Proofs on website?:
                  </Typography>
                  <Typography>
                    {capitalizeFirstLetter(artistByName.artistProofs) ||
                      "Unknown"}
                  </Typography>
                </Box>
                
                {artistByName.signingComment && (
                  <Box sx={styles.infoRow}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        bgcolor: "rgba(80, 122, 96, 0.05)", 
                        borderLeft: "3px solid #507A60",
                        borderRadius: "4px"
                      }}
                    >
                      <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                        {artistByName.signingComment}
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                {artistByName.markssignatureservice &&
                  artistByName.markssignatureservice !== "false" && (
                    <Box sx={styles.infoRow}>
                      <Link
                        sx={styles.serviceLink}
                        target="_blank"
                        href="https://www.facebook.com/groups/545759985597960/?multi_permalinks=1257167887790496&ref=share"
                      >
                        Services offered via Marks Signature Service
                      </Link>
                    </Box>
                  )}
                  
                {artistByName.mountainmage &&
                  artistByName.mountainmage !== "false" && (
                    <Box sx={styles.infoRow}>
                      <Link
                        sx={styles.serviceLink}
                        target="_blank"
                        href={artistByName.mountainmage}
                      >
                        Services offered via MountainMage Service
                      </Link>
                    </Box>
                  )}
              </Box>
              
              <Box sx={styles.signatureSection}>
                <Typography sx={styles.sectionHeader} variant="h4">
                  Example Signature
                </Typography>
                <img src={signatureImage} alt={`${artistByName.name} signature example`} />
              </Box>
              
              {twitterHandle && (
                <Box sx={styles.twitterSection}>
                  <Typography sx={styles.sectionHeader} variant="h4">
                    Latest Updates
                  </Typography>
                  <Timeline
                    dataSource={{ sourceType: "profile", screenName: twitterHandle }}
                    options={{ width: "100%", height: "600" }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Artist;