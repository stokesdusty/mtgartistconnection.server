import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_ARTIST_BY_NAME, GET_SIGNINGEVENTS, GET_ARTISTSBYEVENTID } from "../graphql/queries";
import {
  Box,
  Link,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Chip,
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
import React, { useEffect, useMemo } from "react";
import { capitalizeFirstLetter } from "../../utils";
import { artistStyles } from "../../styles/artist-styles";
import { CalendarToday, LocationOn } from '@mui/icons-material';

interface ArtistSocialLink {
  label: string;
  url: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}

const ArtistEventCard = ({ event }: { event: any }) => {
  const startDateFormatted = new Date(event.startDate).toLocaleDateString();
  const endDateFormatted = new Date(event.endDate).toLocaleDateString();

  return (
    <Box sx={artistStyles.eventCard}>
      <Typography variant="h6" sx={artistStyles.eventName}>
        {event.name}
      </Typography>
      <Box sx={artistStyles.eventDetails}>
        <Box sx={artistStyles.eventDetail}>
          <CalendarToday fontSize="small" sx={{ color: '#2d4a36' }} />
          <Typography variant="body2">
            {startDateFormatted}{startDateFormatted !== endDateFormatted && ` - ${endDateFormatted}`}
          </Typography>
        </Box>
        <Box sx={artistStyles.eventDetail}>
          <LocationOn fontSize="small" sx={{ color: '#2d4a36' }} />
          <Typography variant="body2">{event.city}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Individual event checker component
const EventAttendanceChecker = ({ event, artistName, onAttendanceChecked }: { event: any; artistName: string; onAttendanceChecked: (isAttending: boolean) => void }) => {
  const { data, loading } = useQuery(GET_ARTISTSBYEVENTID, {
    variables: { eventId: event.id }
  });

  React.useEffect(() => {
    if (!loading && data) {
      const isAttending = data?.mapArtistToEventByEventId?.some(
        (artist: any) => artist.artistName === artistName
      );
      onAttendanceChecked(isAttending);
    }
  }, [loading, data, artistName, onAttendanceChecked]);

  return null;
};

// Helper component to check and display events for an artist
const UpcomingEventsSection = ({ artistName, upcomingEvents }: { artistName: string; upcomingEvents: any[] }) => {
  const [attendanceMap, setAttendanceMap] = React.useState<{ [key: string]: boolean }>({});
  const [checkedCount, setCheckedCount] = React.useState(0);

  const handleAttendanceChecked = React.useCallback((eventId: string, isAttending: boolean) => {
    setAttendanceMap(prev => {
      if (prev[eventId] === undefined) {
        setCheckedCount(c => c + 1);
      }
      return { ...prev, [eventId]: isAttending };
    });
  }, []);

  // Filter events where artist is attending
  const artistEvents = upcomingEvents.filter(event => attendanceMap[event.id] === true);

  // Don't show section if still checking or no events
  if (checkedCount < upcomingEvents.length || artistEvents.length === 0) {
    return (
      <>
        {upcomingEvents.map(event => (
          <EventAttendanceChecker
            key={event.id}
            event={event}
            artistName={artistName}
            onAttendanceChecked={(isAttending) => handleAttendanceChecked(event.id, isAttending)}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {upcomingEvents.map(event => (
        <EventAttendanceChecker
          key={event.id}
          event={event}
          artistName={artistName}
          onAttendanceChecked={(isAttending) => handleAttendanceChecked(event.id, isAttending)}
        />
      ))}
      <Box sx={artistStyles.infoRow}>
        <Typography variant="h5">Upcoming Events</Typography>
        <Box sx={artistStyles.eventsListContainer}>
          {artistEvents.map((event: any) => (
            <ArtistEventCard key={event.id} event={event} />
          ))}
        </Box>
      </Box>
    </>
  );
};

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

  const { data: eventsData } = useQuery(GET_SIGNINGEVENTS);

  // Filter upcoming events where this artist is attending - must be before early returns
  const upcomingEvents = useMemo(() => {
    if (!eventsData?.signingEvent) return [];

    const today = new Date();
    return eventsData.signingEvent.filter((event: any) => {
      const endDate = new Date(event.endDate);
      return endDate >= today;
    }).sort((a: any, b: any) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [eventsData]);

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
      label: "Website",
      url: artistByName.url,
      icon: TbWorldWww,
      color: "#2d4a36",
    },
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
                onClick={() => {
                  if ((window as any).gtag) {
                    (window as any).gtag("event", "oma_link_click", {
                      event_category: "artist_page",
                      event_label: artistByName.name,
                      artist_name: artistByName.name,
                    });
                  }
                }}
              >
                <Typography component="span">Buy prints & playmats at</Typography>
                <img src="https://mtgartistconnection.s3.us-west-1.amazonaws.com/OMALogo.png" alt="Original Magic Art logo" className="oma-logo" />
              </Link>
            )}
            <Link
              href={`https://www.ebay.com/sch/i.html?_nkw=${artistByName.name.split(" ").join("+")}+signed+cards+mtg&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=${artistByName.name.split(" ").join("+")}+signed+cards&_osacat=0&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339140903&customid=&toolid=10001&mkevt=1&utm_source=mtgartistconnection&utm_medium=referral&utm_campaign=ebay_artist_search`}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={artistStyles.ebayLink}
              onClick={() => {
                if ((window as any).gtag) {
                  (window as any).gtag("event", "ebay_link_click", {
                    event_category: "artist_page",
                    event_label: artistByName.name,
                    artist_name: artistByName.name,
                  });
                }
              }}
            >
              Search <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" alt="eBay" style={{ height: '20px', verticalAlign: 'middle', margin: '0 4px' }} /> for signed {artistByName.name} cards
            </Link>
          </Box>

          <Box sx={artistStyles.artistPage}>
            <Box sx={artistStyles.infoSection}>
              <Box sx={artistStyles.artistInfo}>
                <Typography sx={artistStyles.sectionHeader} variant="h4">
                  Artist Info
                </Typography>

                <Box sx={artistStyles.infoRow}>
                  <Typography variant="h5">
                    Website/Social Media Links
                  </Typography>
                  {socialMediaLinks.some(link => link.url) ? (
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
                  ) : (
                    <Typography>Unknown</Typography>
                  )}
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
                    <Typography variant="h5">Notes</Typography>
                    <Typography>
                      {artistByName.signingComment}
                    </Typography>
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

                {upcomingEvents.length > 0 && (
                  <UpcomingEventsSection
                    artistName={artistByName.name}
                    upcomingEvents={upcomingEvents}
                  />
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