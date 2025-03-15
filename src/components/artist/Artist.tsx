import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_ARTIST_BY_NAME } from "../graphql/queries";
import {
  Box,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { artistStyles } from "../../styles/artist-styles";
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

  const theme = useTheme();
  const isBelowMedium = useMediaQuery(theme.breakpoints.down("md"));

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

  // Early return for loading or error states
  if (!name) return <p>No Artist provided</p>;
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Typography color="error">
          Error loading artist: {error.message}
        </Typography>
      </Box>
    );

  // Ensure data exists before proceeding
  if (!data?.artistByName) {
    return <Typography>No artist found</Typography>;
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

    const mediumAlignment = isBelowMedium ? "center" : "left";

  return (
    <Box sx={artistStyles.container}>
      <Box sx={artistStyles.bannerContainer}>
        <img
          src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${artistByName.filename}.jpeg`}
          alt=""
        />
      </Box>
      <Typography variant="h2" fontWeight={600}>
        {artistByName.name}
      </Typography>
      <Box sx={artistStyles.infoRow}>
        <Link
          sx={artistStyles.link}
          href={`/allcards/${artistByName.name}`}
        >
          <Typography color={"#159947"} variant="h5">{`View all ${artistByName.name} cards >`}</Typography>
        </Link>
      </Box>
      <Box sx={artistStyles.artistPage}>
        <Box sx={{ margin: "10px", display: "ruby" }}>
          <Box
            sx={{
              ...artistStyles.infoSection,
              flexDirection: isBelowMedium ? "column" : "row",
              alignItems: isBelowMedium ? "center" : "left",
            }}
          >
            <Box
              sx={{
                ...artistStyles.artistInfo,
                alignItems: mediumAlignment,
                minWidth: isBelowMedium ? "" : "400px",
              }}
            >
              <Typography sx={artistStyles.sectionHeader} variant="h4">
                Artist Info
              </Typography>
              <Box sx={artistStyles.infoRow}>
                <Typography sx={{ textAlign: mediumAlignment }} variant="h5">
                  Social Media Links:
                </Typography>
                <Box sx={{ ...artistStyles.socialMedia, alignItems: "center" }}>
                  {socialMediaLinks.map(
                    (link, index) =>
                      link.url && (
                        <Link
                          key={index}
                          href={link.url}
                          target="_blank"
                          sx={{ mr: 1 }}
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
              <Box sx={{ ...artistStyles.infoRow, alignItems: mediumAlignment }}>
                <Typography variant="h5">Artist Website:</Typography>
                <Typography>
                  {artistByName.url ? (
                    <Link href={artistByName.url} target="_blank">
                      <TbWorldWww size={30} color={"black"} />
                    </Link>
                  ) : (
                    "None"
                  )}
                </Typography>
              </Box>
              <Box sx={{ ...artistStyles.infoRow, alignItems: mediumAlignment }}>
                <Typography variant="h5">Artist Email:</Typography>
                <Typography>
                  {artistByName.email ? (
                    <Link
                      sx={artistStyles.link}
                      href={`mailto:${artistByName.email}`}
                    >
                      {artistByName.email}
                    </Link>
                  ) : (
                    "Unknown"
                  )}
                </Typography>
              </Box>
              <Box sx={{ ...artistStyles.infoRow, alignItems: mediumAlignment }}>
                <Typography variant="h5">Location:</Typography>
                <Typography>
                  {artistByName.location || "Unknown"}
                </Typography>
              </Box>
              <Box sx={{ ...artistStyles.infoRow, alignItems: mediumAlignment }}>
                <Typography variant="h5">Offer Signing?:</Typography>
                <Typography>
                  {capitalizeFirstLetter(artistByName.signing) ||
                    "Unknown"}
                </Typography>
              </Box>
              <Box
                sx={{
                  ...artistStyles.infoRow,
                  textAlign: mediumAlignment,
                  alignItems: mediumAlignment,
                }}
              >
                <Typography variant="h5">
                  Artist Proofs on website?:
                </Typography>
                <Typography>
                  {capitalizeFirstLetter(artistByName.artistProofs) ||
                    "Unknown"}
                </Typography>
              </Box>
              {artistByName.signingComment && (
                <Box
                  sx={{
                    ...artistStyles.infoRow,
                    textAlign: mediumAlignment,
                    alignItems: mediumAlignment,
                  }}
                >
                  <Typography variant="h6">
                    {artistByName.signingComment}
                  </Typography>
                </Box>
              )}
              {artistByName.markssignatureservice &&
                artistByName.markssignatureservice !== "false" && (
                  <Box sx={artistStyles.infoRow}>
                    <Link
                      sx={artistStyles.link}
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
                      sx={artistStyles.link}
                      target="_blank"
                      href={artistByName.mountainmage}
                    >
                      Services offered via MountainMage Service
                    </Link>
                  </Box>
                )}
            </Box>
            <Box
              sx={{
                ...artistStyles.signatureSection,
                paddingLeft: isBelowMedium ? "50px" : "",
                justifyContent: mediumAlignment,
                paddingTop: isBelowMedium ? "16px" : "0px",
              }}
            >
              <Typography sx={{textAlign: mediumAlignment}} variant="h4">Example Signature</Typography>
              <img src={signatureImage} alt="" />
            </Box>
            {twitterHandle && (
              <Box
                sx={{
                  paddingBottom: "25px",
                  paddingLeft: isBelowMedium ? "50px" : "",
                  justifyContent: mediumAlignment,
                }}
              >
                <Timeline
                  dataSource={{ sourceType: "profile", screenName: twitterHandle }}
                  options={{ width: "400", height: "600" }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Artist;
