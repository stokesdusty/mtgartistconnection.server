import { useQuery, useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { GET_ARTIST_BY_NAME, GET_SIGNINGEVENTS, GET_ARTISTS_BY_EVENT_IDS, GET_CURRENT_USER } from "../graphql/queries";
import { FOLLOW_ARTIST, UNFOLLOW_ARTIST, UPDATE_EMAIL_PREFERENCES } from "../graphql/mutations";
import {
  Box,
  Link,
  Typography,
  Container,
  Divider,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import { ArtistPageSkeleton } from "../shared/Skeletons";
import { usePageTitle } from "../../hooks/usePageTitle";
import { colors } from "../../styles/design-tokens";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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
import { CalendarToday, LocationOn, NotificationsActive, PersonAdd, Edit } from '@mui/icons-material';
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ArtistNewsSection from './ArtistNewsSection';
import ExternalLinkCard from './ExternalLinkCard';
import { Style, CollectionsBookmark } from '@mui/icons-material';

interface ArtistSocialLink {
  label: string;
  url: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}

const ArtistEventCard = ({ event }: { event: any }) => {
  const navigate = useNavigate();
  const startDateFormatted = new Date(event.startDate).toLocaleDateString();
  const endDateFormatted = new Date(event.endDate).toLocaleDateString();

  return (
    <Box sx={artistStyles.eventCard} onClick={() => navigate(`/calendar/${event.id}`)}>
      {event.url ? (
        <Link
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{ textDecoration: 'none' }}
          onClick={(e) => e.stopPropagation()}
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
          <CalendarToday fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography variant="body2">
            {startDateFormatted}{startDateFormatted !== endDateFormatted && ` - ${endDateFormatted}`}
          </Typography>
        </Box>
        <Box sx={artistStyles.eventDetail}>
          <LocationOn fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography variant="body2">{event.city}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Helper component to check and display events for an artist using batched query
const UpcomingEventsSection = ({ artistName, upcomingEvents }: { artistName: string; upcomingEvents: any[] }) => {
  const eventIds = useMemo(() => upcomingEvents.map(e => e.id), [upcomingEvents]);

  const { data, loading } = useQuery(GET_ARTISTS_BY_EVENT_IDS, {
    variables: { eventIds },
    skip: eventIds.length === 0,
  });

  // Build a set of event IDs this artist is attending
  const artistEventIds = useMemo(() => {
    if (!data?.artistsByEventIds) return new Set<string>();
    return new Set(
      data.artistsByEventIds
        .filter((a: any) => a.artistName === artistName)
        .map((a: any) => a.eventId)
    );
  }, [data, artistName]);

  // Filter events where artist is attending
  const artistEvents = upcomingEvents.filter(event => artistEventIds.has(event.id));

  // Don't show section if still loading or no events
  if (loading || artistEvents.length === 0) {
    return null;
  }

  return (
    <Box sx={artistStyles.infoRow}>
      <Typography variant="h5">Upcoming Events</Typography>
      <Box sx={artistStyles.eventsListContainer}>
        {artistEvents.map((event: any) => (
          <ArtistEventCard key={event.id} event={event} />
        ))}
      </Box>
    </Box>
  );
};

const Artist = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const [isFollowing, setIsFollowing] = useState(false);

  usePageTitle(name);

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
        <Container maxWidth="lg">
          <Box sx={artistStyles.contentWrapper}>
            <ArtistPageSkeleton />
          </Box>
        </Container>
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
                  newArtistNotifications: userData.me.emailPreferences.newArtistNotifications || false,
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
        <Box sx={artistStyles.contentWrapper}>
          <Box sx={artistStyles.bannerContainer}>
            <img
              src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${artistByName.filename}.jpeg`}
              alt={`${artistByName.name} banner`}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h2" sx={artistStyles.artistName}>
              {artistByName.name}
              {artistByName.alternate_names && (
                <Typography component="span" sx={artistStyles.alternateName}>
                  ({artistByName.alternate_names})
                </Typography>
              )}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {userData?.me?.role === 'admin' && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/editartist/${artistByName.id}`)}
                  sx={artistStyles.editButton}
                >
                  Edit Artist
                </Button>
              )}

              <Button
                variant={isFollowing ? 'contained' : 'outlined'}
                size="small"
                onClick={handleFollowToggle}
                startIcon={isFollowing ? <NotificationsActive /> : <PersonAdd />}
                sx={isFollowing ? artistStyles.followButtonActive : artistStyles.followButtonInactive}
              >
                {!isLoggedIn
                  ? 'Sign in to follow'
                  : isFollowing
                    ? 'Following'
                    : 'Follow'}
              </Button>
            </Box>
          </Box>

          <Box sx={artistStyles.buttonContainer}>
            <ExternalLinkCard
              href={`/allcards/${artistByName.name}`}
              label={`View all ${artistByName.name} cards`}
              logo={<CollectionsBookmark sx={{ fontSize: 20 }} />}
              variant="primary"
            />
            {artistByName.omalink && (
              <ExternalLinkCard
                href={artistByName.omalink}
                label="Buy prints & playmats"
                logo={<img src="https://mtgartistconnection.s3.us-west-1.amazonaws.com/OMALogo.png" alt="Original Magic Art" style={{ height: 20 }} />}
                external
                onClick={() => {
                  if ((window as any).gtag) {
                    (window as any).gtag("event", "oma_link_click", {
                      event_category: "artist_page",
                      event_label: artistByName.name,
                      artist_name: artistByName.name,
                    });
                  }
                }}
              />
            )}
            {artistByName.inprnt && (
              <ExternalLinkCard
                href={artistByName.inprnt}
                label="Buy prints"
                logo={<Box component="span" sx={{ fontWeight: 700, fontSize: 14, letterSpacing: '0.05em', fontFamily: 'Arial, sans-serif' }}>INPRNT</Box>}
                external
                onClick={() => {
                  if ((window as any).gtag) {
                    (window as any).gtag("event", "inprnt_link_click", {
                      event_category: "artist_page",
                      event_label: artistByName.name,
                      artist_name: artistByName.name,
                    });
                  }
                }}
              />
            )}
            <ExternalLinkCard
              href={`https://www.ebay.com/sch/i.html?_nkw=${artistByName.name.split(" ").join("+")}+signed+cards+mtg&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=${artistByName.name.split(" ").join("+")}+signed+cards&_osacat=0&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339140903&customid=&toolid=10001&mkevt=1&utm_source=mtgartistconnection&utm_medium=referral&utm_campaign=ebay_artist_search`}
              label={`Search for signed ${artistByName.name} cards`}
              logo={<img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" alt="eBay" style={{ height: 18 }} />}
              external
              onClick={() => {
                if ((window as any).gtag) {
                  (window as any).gtag("event", "ebay_link_click", {
                    event_category: "artist_page",
                    event_label: artistByName.name,
                    artist_name: artistByName.name,
                  });
                }
              }}
            />
          </Box>

          <Divider sx={artistStyles.sectionDivider} />
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
                        sx={{ color: 'primary.main' }}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="h5" sx={{ lineHeight: 1 }}>Currently Signing?</Typography>
                    <Tooltip
                      title="Signing status is being verified for all artists. Unconfirmed statuses may change as we gather more information."
                      arrow
                      placement="top"
                    >
                      <HelpOutlineIcon
                        sx={{
                          fontSize: '0.9rem',
                          color: 'text.secondary',
                          cursor: 'help',
                          verticalAlign: 'middle',
                          marginBottom: '5px',
                        }}
                      />
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {(!artistByName.signing || artistByName.signing === "false" || artistByName.signing === "unknown" || artistByName.signing === "no") ? (
                      <Chip
                        label="Not confirmed"
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(117, 117, 117, 0.12)',
                          color: 'text.secondary',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                        }}
                      />
                    ) : (
                      <Chip
                        label={capitalizeFirstLetter(artistByName.signing)}
                        size="small"
                        sx={{
                          backgroundColor: colors.accent.orangeLight,
                          color: colors.accent.orangeDark,
                          border: `1px solid ${colors.accent.orange}`,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
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
                <ArtistNewsSection artistName={artistByName.name} />
                <Typography sx={artistStyles.sectionHeader} variant="h4">
                  Example Signature
                </Typography>
                <img src={signatureImage} alt={`${artistByName.name} signature example`} />
              </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Artist;