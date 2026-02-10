import { useQuery, useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { GET_ARTIST_BY_NAME, GET_SIGNINGEVENTS, GET_ARTISTSBYEVENTID, GET_CURRENT_USER } from "../graphql/queries";
import { FOLLOW_ARTIST, UNFOLLOW_ARTIST, UPDATE_EMAIL_PREFERENCES } from "../graphql/mutations";
import {
  Box,
  Link,
  Typography,
  CircularProgress,
  Container,
  Paper,
  FormControlLabel,
  Checkbox,
  Button,
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
import React, { useEffect, useMemo, useState } from "react";
import { capitalizeFirstLetter } from "../../utils";
import { artistStyles } from "../../styles/artist-styles";
import { CalendarToday, LocationOn, Notifications, NotificationsNone, Edit } from '@mui/icons-material';
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

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
      {event.url ? (
        <Link
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{ textDecoration: 'none' }}
        >
          <Typography variant="h6" sx={artistStyles.eventName}>
            {event.name}
          </Typography>
        </Link>
      ) : (
        <Typography variant="h6" sx={artistStyles.eventName}>
          {event.name}
        </Typography>
      )}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data, artistName]);

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

  // Create stable callbacks for each event
  const eventCallbacks = React.useMemo(() => {
    return upcomingEvents.reduce((acc, event) => {
      acc[event.id] = (isAttending: boolean) => handleAttendanceChecked(event.id, isAttending);
      return acc;
    }, {} as { [key: string]: (isAttending: boolean) => void });
  }, [upcomingEvents, handleAttendanceChecked]);

  // Don't show section if still checking or no events
  if (checkedCount < upcomingEvents.length || artistEvents.length === 0) {
    return (
      <>
        {upcomingEvents.map(event => (
          <EventAttendanceChecker
            key={event.id}
            event={event}
            artistName={artistName}
            onAttendanceChecked={eventCallbacks[event.id]}
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
          onAttendanceChecked={eventCallbacks[event.id]}
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
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const [isFollowing, setIsFollowing] = useState(false);

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

  const { data: userData } = useQuery(GET_CURRENT_USER, {
    skip: !isLoggedIn,
  });

  const [followArtist] = useMutation(FOLLOW_ARTIST);
  const [unfollowArtist] = useMutation(UNFOLLOW_ARTIST);
  const [updateEmailPreferences] = useMutation(UPDATE_EMAIL_PREFERENCES);

  // Check if user is following this artist
  useEffect(() => {
    if (userData?.me?.followedArtists && name) {
      setIsFollowing(userData.me.followedArtists.includes(name));
    }
  }, [userData, name]);

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

  const handleFollowToggle = async () => {
    if (!name) return;

    // If not logged in, redirect to auth page
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    try {
      if (isFollowing) {
        const { data } = await unfollowArtist({ variables: { artistName: name } });
        if (data?.unfollowArtist?.success) {
          setIsFollowing(false);
        }
      } else {
        const { data } = await followArtist({ variables: { artistName: name } });
        if (data?.followArtist?.success) {
          setIsFollowing(true);

          // If user has artist updates turned off, enable it when they follow an artist
          if (userData?.me?.emailPreferences?.artistUpdates === false) {
            try {
              await updateEmailPreferences({
                variables: {
                  siteUpdates: userData.me.emailPreferences.siteUpdates || false,
                  artistUpdates: true, // Enable artist updates
                  localSigningEvents: userData.me.emailPreferences.localSigningEvents || false,
                },
              });
            } catch (prefError) {
              console.error("Error updating email preferences:", prefError);
              // Don't block the follow action if preference update fails
            }
          }
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

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

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h2" sx={artistStyles.artistName}>
              {artistByName.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {userData?.me?.role === 'admin' && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/editartist/${artistByName.id}`)}
                  sx={{
                    color: '#2d4a36',
                    borderColor: '#2d4a36',
                    '&:hover': {
                      borderColor: '#1a2e20',
                      backgroundColor: 'rgba(45, 74, 54, 0.04)',
                    },
                  }}
                >
                  Edit Artist
                </Button>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isLoggedIn && isFollowing}
                    onChange={handleFollowToggle}
                    icon={<NotificationsNone />}
                    checkedIcon={<Notifications />}
                    sx={{
                      color: '#757575',
                      '&.Mui-checked': {
                        color: '#2d4a36',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{
                    fontSize: '0.875rem',
                    color: '#616161',
                    fontWeight: 500,
                  }}>
                    {!isLoggedIn
                      ? 'Sign in to follow'
                      : isFollowing
                        ? 'Following'
                        : 'Follow for updates'}
                  </Typography>
                }
                sx={{
                  m: 0,
                  '& .MuiFormControlLabel-label': {
                    userSelect: 'none',
                  },
              }}
            />
            </Box>
          </Box>

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
            {artistByName.inprnt && (
              <Link
                href={artistByName.inprnt}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={artistStyles.omaLink}
                onClick={() => {
                  if ((window as any).gtag) {
                    (window as any).gtag("event", "inprnt_link_click", {
                      event_category: "artist_page",
                      event_label: artistByName.name,
                      artist_name: artistByName.name,
                    });
                  }
                }}
              >
                <Typography component="span">Buy prints at</Typography>
                <Box component="span" sx={{
                  fontWeight: 'bold',
                  fontSize: '1.1em',
                  letterSpacing: '0.05em',
                  color: '#000',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  INPRNT
                </Box>
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