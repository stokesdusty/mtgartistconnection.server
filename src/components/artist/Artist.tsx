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
import { useEffect } from "react";
import { capitalizeFirstLetter } from "../../utils";
import { artistStyles } from "../../styles/artist-styles";

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

  if (!name) return <Typography sx={{ textAlign: "center", p: 4 }}>No artist provided</Typography>;
  if (loading)
    return (
      <Box sx={artistStyles.container}>
        <Box sx={artistStyles.loadingContainer}>
          <CircularProgress sx={artistStyles.loadingSpinner} />
        </Box>
      </Box>
    );
  if (error)
    return (
      <Box sx={artistStyles.container}>
        <Box sx={artistStyles.contentWrapper}>
          <Typography sx={artistStyles.errorMessage}>
            Error loading artist: {error.message}
          </Typography>
        </Box>
      </Box>
    );

  if (!data?.artistByName) {
    return (
      <Box sx={artistStyles.container}>
        <Box sx={artistStyles.contentWrapper}>
          <Typography sx={artistStyles.errorMessage}>
            No artist found with the name "{name}"
          </Typography>
        </Box>
      </Box>
    );
  }

  const { artistByName } = data;

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
    <Box sx={artistStyles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={artistStyles.contentWrapper}>
          <Box sx={artistStyles.bannerContainer}>
            <img
              src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${artistByName.filename}.jpeg`}
              alt={`${artistByName.name} banner`}
            />
          </Box>

          <Typography variant="h2" sx={artistStyles.artistName}>
            {artistByName.name}
          </Typography>

          <Box sx={artistStyles.buttonContainer}>
            <Link
              href={`/allcards/${artistByName.name}`}
              underline="none"
              sx={artistStyles.viewCardsLink}
            >
              View all {artistByName.name} cards →
            </Link>
            {artistByName.omalink && (
              <Link
                href={artistByName.omalink}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={artistStyles.omaLink}
              >
                <Typography component="span">Buy prints & playmats at</Typography>
                <img src="https://mtgartistconnection.s3.us-west-1.amazonaws.com/OMALogo.png" alt="Original Magic Art logo" className="oma-logo" />
              </Link>
            )}
          </Box>

          <Box sx={artistStyles.artistPage}>
            <Box sx={artistStyles.infoSection}>
              <Box sx={artistStyles.artistInfo}>
                <Typography sx={artistStyles.sectionHeader} variant="h4">
                  Artist Info
                </Typography>

                <Box sx={artistStyles.infoRow}>
                  <Typography variant="h5">
                    Social Media Links
                  </Typography>
                  <Box sx={artistStyles.socialMedia}>
                    {socialMediaLinks.map(
                      (link, index) =>
                        link.url && (
                          <Link
                            key={index}
                            href={link.url}
                            target="_blank"
                            sx={artistStyles.socialIcon}
                          >
                            <link.icon
                              size={20}
                              color={link.color}
                            />
                          </Link>
                        )
                    )}
                  </Box>
                </Box>

                <Box sx={artistStyles.infoRow}>
                  <Typography variant="h5">Artist Website</Typography>
                  <Typography>
                    {artistByName.url ? (
                      <Link href={artistByName.url} target="_blank" sx={artistStyles.socialIcon}>
                        <TbWorldWww size={20} color={"#2d4a36"} />
                      </Link>
                    ) : (
                      "None"
                    )}
                  </Typography>
                </Box>

                <Box sx={artistStyles.infoRow}>
                  <Typography variant="h5">Artist Email</Typography>
                  <Typography>
                    {artistByName.email ? (
                      <Link
                        href={`mailto:${artistByName.email}`}
                        underline="hover"
                        sx={{ color: "#2d4a36" }}
                      >
                        {artistByName.email}
                      </Link>
                    ) : (
                      "Unknown"
                    )}
                  </Typography>
                </Box>

                <Box sx={artistStyles.infoRow}>
                  <Typography variant="h5">Location</Typography>
                  <Typography>
                    {artistByName.location || "Unknown"}
                  </Typography>
                </Box>

                <Box sx={artistStyles.infoRow}>
                  <Typography variant="h5">Currently Signing?</Typography>
                  <Typography>
                    {capitalizeFirstLetter(artistByName.signing) ||
                      "Unknown"}
                  </Typography>
                </Box>

                <Box sx={artistStyles.infoRow}>
                  <Typography variant="h5">
                    Artist Proofs on website?
                  </Typography>
                  <Typography>
                    {capitalizeFirstLetter(artistByName.artistProofs) ||
                      "Unknown"}
                  </Typography>
                </Box>

                {artistByName.signingComment && (
                  <Box sx={artistStyles.infoRow}>
                    <Paper
                      elevation={0}
                      sx={artistStyles.signingCommentBox}
                    >
                      <Typography variant="body1">
                        "{artistByName.signingComment}"
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {artistByName.markssignatureservice &&
                  artistByName.markssignatureservice !== "false" && (
                    <Box sx={artistStyles.infoRow}>
                      <Link
                        sx={artistStyles.serviceLink}
                        target="_blank"
                        href="https://www.facebook.com/groups/545759985597960/?multi_permalinks=1257167887790496&ref=share"
                      >
                        Services offered via Marks Signature Service
                      </Link>
                    </Box>
                  )}

                {artistByName.mountainmage &&
                  artistByName.mountainmage !== "false" && (
                    <Box sx={artistStyles.infoRow}>
                      <Link
                        sx={artistStyles.serviceLink}
                        target="_blank"
                        href={artistByName.mountainmage}
                      >
                        Services offered via MountainMage Service
                      </Link>
                    </Box>
                  )}
              </Box>

              <Box sx={artistStyles.signatureSection}>
                <Typography sx={artistStyles.sectionHeader} variant="h4">
                  Example Signature
                </Typography>
                <img src={signatureImage} alt={`${artistByName.name} signature example`} />
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Artist;