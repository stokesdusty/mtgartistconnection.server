import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { GET_ARTIST_BY_NAME, GET_SIGNINGEVENTS, GET_ARTISTS_BY_EVENT_IDS, GET_CURRENT_USER, GET_USER_CARD_COLLECTION } from "../graphql/queries";
import { FOLLOW_ARTIST, UNFOLLOW_ARTIST, UPDATE_EMAIL_PREFERENCES } from "../graphql/mutations";
import {
  Box,
  Link,
  Typography,
  Container,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import { ArtistPageSkeleton } from "../shared/Skeletons";
import { usePageTitle } from "../../hooks/usePageTitle";
import { colors, themeColors, spacing } from "../../styles/design-tokens";
import { Question, CalendarBlank, MapPin, BellRinging, UserPlus, PencilSimple, Cards, GlobeSimple, FacebookLogo, InstagramLogo, TwitterLogo, PatreonLogo, YoutubeLogo } from "@phosphor-icons/react";
import { FaArtstation } from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";
import React, { useEffect, useMemo, useState } from "react";
import { capitalizeFirstLetter } from "../../utils";
import { artistStyles } from "../../styles/artist-styles";

import { alpha } from '@mui/material/styles';
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ArtistNewsSection from './ArtistNewsSection';
import ExternalLinkCard from './ExternalLinkCard';

interface ArtistSocialLink {
  label: string;
  url: string;
  icon: React.ComponentType<{ size?: number | string; color?: string }>;
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
          <CalendarBlank size={16} weight="duotone" color={colors.primary.main} />
          <Typography variant="body2">
            {startDateFormatted}{startDateFormatted !== endDateFormatted && ` - ${endDateFormatted}`}
          </Typography>
        </Box>
        <Box sx={artistStyles.eventDetail}>
          <MapPin size={16} weight="duotone" color={colors.primary.main} />
          <Typography variant="body2">{event.city}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const UpcomingEventsSection = ({ artistEvents }: { artistEvents: any[] }) => {
  if (artistEvents.length === 0) return null;
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
  const [signedCount, setSignedCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [artistProofCount, setArtistProofCount] = useState(0);

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

  const [fetchUserCardCollection] = useLazyQuery(GET_USER_CARD_COLLECTION, {
    onCompleted: (collectionData) => {
      if (collectionData?.userCardCollection) {
        const items = collectionData.userCardCollection;
        setSignedCount(items.filter((i: any) => i.signedNonfoil || i.signedFoil).length);
        setWishlistCount(items.filter((i: any) => i.wishlistSigned).length);
        setArtistProofCount(items.filter((i: any) => i.artistProof || i.artistProofFoil).length);
      }
    },
  });

  useEffect(() => {
    setSignedCount(0);
    setWishlistCount(0);
    setArtistProofCount(0);
  }, [name]);

  useEffect(() => {
    if (!isLoggedIn || !data?.artistByName?.name) return;

    const artistName = data.artistByName.name;
    const encodedName = encodeURIComponent("!" + artistName);
    const baseUrl = `https://api.scryfall.com/cards/search?as=grid&unique=prints&order=name&q=%28game%3Apaper%29+%28artist%3A"${encodedName}"%29`;

    const fetchAllIds = async (url: string, ids: string[] = []): Promise<string[]> => {
      try {
        const response = await axios.get(url);
        const newIds = [...ids, ...response.data.data.map((c: any) => c.id).filter(Boolean)];
        if (response.data.has_more && response.data.next_page) {
          return fetchAllIds(response.data.next_page, newIds);
        }
        return newIds;
      } catch {
        return ids;
      }
    };

    fetchAllIds(baseUrl).then(ids => {
      if (ids.length > 0) {
        fetchUserCardCollection({ variables: { scryfallIds: ids } });
      }
    });
  }, [isLoggedIn, data?.artistByName?.name, fetchUserCardCollection]);

  // Check if user is following this artist
  useEffect(() => {
    if (userData?.me?.followedArtists && name) {
      setIsFollowing(userData.me.followedArtists.includes(name));
    }
  }, [userData, name]);

  const upcomingEvents = useMemo(() => {
    if (!eventsData?.signingEvent) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventsData.signingEvent.filter((event: any) => {
      const endDate = new Date(event.endDate);
      return endDate >= today;
    }).sort((a: any, b: any) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [eventsData]);

  const eventIds = useMemo(() => upcomingEvents.map((e: any) => e.id), [upcomingEvents]);

  const { data: eventArtistsData } = useQuery(GET_ARTISTS_BY_EVENT_IDS, {
    variables: { eventIds },
    skip: eventIds.length === 0,
  });

  const artistEvents = useMemo(() => {
    if (!eventArtistsData?.artistsByEventIds || !data?.artistByName?.name) return [];
    const attending = new Set(
      eventArtistsData.artistsByEventIds
        .filter((a: any) => a.artistName === data.artistByName.name)
        .map((a: any) => a.eventId)
    );
    return upcomingEvents.filter((e: any) => attending.has(e.id));
  }, [eventArtistsData, data?.artistByName?.name, upcomingEvents]);

  const nextSigningEvent = useMemo(() => {
    if (artistEvents.length === 0) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return artistEvents.find((e: any) => {
      const start = new Date(e.startDate);
      return start >= today && start <= cutoff;
    }) ?? null;
  }, [artistEvents]);

  const daysUntilEvent = useMemo(() => {
    if (!nextSigningEvent) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(nextSigningEvent.startDate);
    start.setHours(0, 0, 0, 0);
    return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [nextSigningEvent]);

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
      icon: GlobeSimple,
      color: themeColors.primary.main,
    },
    {
      label: "Facebook",
      url: artistByName.facebook,
      icon: FacebookLogo,
      color: themeColors.primary.main,
    },
    {
      label: "Instagram",
      url: artistByName.instagram,
      icon: InstagramLogo,
      color: themeColors.primary.main,
    },
    {
      label: "Twitter",
      url: artistByName.twitter,
      icon: TwitterLogo,
      color: themeColors.primary.main,
    },
    {
      label: "Patreon",
      url: artistByName.patreon,
      icon: PatreonLogo,
      color: themeColors.primary.main,
    },
    {
      label: "YouTube",
      url: artistByName.youtube,
      icon: YoutubeLogo,
      color: themeColors.primary.main,
    },
    {
      label: "Artstation",
      url: artistByName.artstation,
      icon: FaArtstation,
      color: themeColors.primary.main,
    },
    {
      label: "Bluesky",
      url: artistByName.bluesky,
      icon: FaBluesky,
      color: themeColors.primary.main,
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

  const ebayHref = `https://www.ebay.com/sch/i.html?_nkw=${artistByName.name.split(" ").join("+")}+signed+cards+mtg&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=${artistByName.name.split(" ").join("+")}+signed+cards&_osacat=0&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339140903&customid=&toolid=10001&mkevt=1&utm_source=mtgartistconnection&utm_medium=referral&utm_campaign=ebay_artist_search`;

  const signingPillLabel = daysUntilEvent === 0
    ? `Signing at ${nextSigningEvent?.name} — today!`
    : `Signing at ${nextSigningEvent?.name} in ${daysUntilEvent} day${daysUntilEvent === 1 ? '' : 's'}`;

  return (
    <Box sx={artistStyles.container}>
      {/* Full-bleed hero banner */}
      <Box sx={artistStyles.heroBanner}>
        <img
          src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${artistByName.filename}.jpeg`}
          alt={`${artistByName.name} banner`}
        />
        <Box sx={artistStyles.bannerGradient} />
        <Box sx={artistStyles.bannerNameOverlay}>
          <Container maxWidth="lg" disableGutters>
            <Box sx={{ px: { xs: spacing.lg, md: spacing.xxl }, pb: { xs: spacing.lg, md: spacing.xl } }}>
              <Typography sx={artistStyles.bannerHeroName}>
                {artistByName.name}
              </Typography>
              {artistByName.alternate_names && (
                <Typography sx={artistStyles.bannerAltName}>
                  {artistByName.alternate_names}
                </Typography>
              )}
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Sticky action rail */}
      <Box sx={artistStyles.stickyRail}>
        <Container maxWidth="lg">
          <Box sx={artistStyles.stickyRailInner}>
            <Typography sx={artistStyles.stickyName}>
              {artistByName.name}
            </Typography>

            {/* Spacer pushes pill + follow to the right */}
            <Box sx={{ flex: 1 }} />

            {nextSigningEvent && (
              <Chip
                label={signingPillLabel}
                size="small"
                sx={artistStyles.signingPill}
                onClick={() => navigate(`/calendar/${nextSigningEvent.id}`)}
              />
            )}

            {userData?.me?.role === 'admin' && (
              <Button
                variant="outlined"
                size="medium"
                startIcon={<PencilSimple size={18} />}
                onClick={() => navigate(`/editartist/${artistByName.id}`)}
                sx={{ ...artistStyles.editButton, display: { xs: 'none', md: 'flex' } }}
              >
                Edit Artist
              </Button>
            )}

            <Button
              variant={isFollowing ? 'contained' : 'outlined'}
              size="medium"
              onClick={handleFollowToggle}
              startIcon={isFollowing ? <BellRinging size={18} weight="duotone" /> : <UserPlus size={18} />}
              sx={isFollowing ? artistStyles.followButtonActive : artistStyles.followButtonInactive}
            >
              {!isLoggedIn ? 'Sign in to follow' : isFollowing ? 'Following' : 'Follow'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main content card */}
      <Container maxWidth="lg" sx={{ pt: spacing.sm }}>
        <Box sx={artistStyles.contentWrapper}>
          <Box sx={artistStyles.buttonContainer}>
            <ExternalLinkCard
              href={`/allcards/${artistByName.name}`}
              label={`View all ${artistByName.name} cards`}
              logo={<Cards size={20} weight="duotone" />}
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
                    (window as any).gtag("event", "oma_link_click", { event_category: "artist_page", event_label: artistByName.name, artist_name: artistByName.name });
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
                    (window as any).gtag("event", "inprnt_link_click", { event_category: "artist_page", event_label: artistByName.name, artist_name: artistByName.name });
                  }
                }}
              />
            )}
            <ExternalLinkCard
              href={ebayHref}
              label={`Search for signed ${artistByName.name} cards`}
              logo={<img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" alt="eBay" style={{ height: 18 }} />}
              external
              onClick={() => {
                if ((window as any).gtag) {
                  (window as any).gtag("event", "ebay_link_click", { event_category: "artist_page", event_label: artistByName.name, artist_name: artistByName.name });
                }
              }}
            />
          </Box>

          <Box sx={artistStyles.infoSection}>
              <Box sx={artistStyles.artistInfo}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' }}>
                  <Typography sx={artistStyles.sectionHeader} variant="h4">
                    Artist Info
                  </Typography>
                  {isLoggedIn && (signedCount > 0 || wishlistCount > 0 || artistProofCount > 0) && (
                    <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                      Your collection: {[
                        signedCount > 0 && `${signedCount} signed`,
                        wishlistCount > 0 && `${wishlistCount} wishlisted`,
                        artistProofCount > 0 && `${artistProofCount} artist proof`,
                      ].filter(Boolean).join(', ')}
                    </Typography>
                  )}
                </Box>

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
                      <Question
                        size={16}
                        style={{ cursor: 'help', verticalAlign: 'middle', marginBottom: '5px' }}
                      />
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {(!artistByName.signing || artistByName.signing === "false" || artistByName.signing === "unknown" || artistByName.signing === "no") ? (
                      <Chip
                        label="Not confirmed"
                        size="small"
                        sx={{
                          backgroundColor: alpha(colors.neutral[600], 0.12),
                          color: themeColors.text.secondary,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                        }}
                      />
                    ) : (
                      <Chip
                        label={capitalizeFirstLetter(artistByName.signing)}
                        size="small"
                        sx={{
                          backgroundColor: '#eafaf1',
                          color: colors.accent.greenDark,
                          border: `1px solid ${colors.accent.green}`,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          'html[data-dark] &': {
                            backgroundColor: 'rgba(39, 174, 96, 0.15)',
                            color: '#6fcf97',
                            borderColor: 'rgba(39, 174, 96, 0.5)',
                          },
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

                <UpcomingEventsSection artistEvents={artistEvents} />
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