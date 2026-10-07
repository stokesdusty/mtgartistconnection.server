import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import { GET_ARTIST_BY_NAME, GET_SIGNINGEVENTS, GET_ARTISTS_BY_EVENT_IDS, GET_CURRENT_USER, GET_USER_CARD_COLLECTION } from "../graphql/queries";
import { FOLLOW_ARTIST, UNFOLLOW_ARTIST, UPDATE_EMAIL_PREFERENCES, LOG_LINK_CLICK } from "../graphql/mutations";
import {
  Box,
  Button,
  Tooltip,
} from "@mui/material";
import { ArtistPageSkeleton } from "../shared/Skeletons";
import { MEDIA_BASE_URL } from "../../config/media";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Question, BellRinging, PencilSimple, GlobeSimple, FacebookLogo, InstagramLogo, TwitterLogo, PatreonLogo, YoutubeLogo } from "@phosphor-icons/react";
import { FaArtstation } from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { capitalizeFirstLetter } from "../../utils";
import { formatDateRange } from "../../utils/eventDates";
import { artistStyles } from "../../styles/artist-styles";
import { vault } from "../../styles/design-tokens";
import PageMeta from "../shared/PageMeta";
import MonoLabel from "../shared/MonoLabel";
import GlowPill from "../shared/GlowPill";
import Slab from "../shared/Slab";

import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ExternalLinkCard from './ExternalLinkCard';

interface ArtistSocialLink {
  label: string;
  url: string;
  icon: React.ComponentType<{ size?: number | string; color?: string }>;
}

const InfoRow = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <Box sx={artistStyles.infoRow}>
    <Box component="dt" sx={artistStyles.infoLabel}>{label}</Box>
    <Box component="dd" sx={artistStyles.infoValue}>{children}</Box>
  </Box>
);

const ArtistEventCard = ({ event }: { event: any }) => {
  const navigate = useNavigate();
  const start = new Date(event.startDate);
  const open = () => navigate(`/calendar/${event.id}`);

  return (
    <Box
      sx={artistStyles.eventCard}
      role="link"
      tabIndex={0}
      aria-label={`${event.name}, ${formatDateRange(event.startDate, event.endDate)}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter') open();
      }}
    >
      <Box sx={artistStyles.dateBlock} aria-hidden>
        <Box sx={artistStyles.dateBlockMonth}>
          {start.toLocaleDateString('en-US', { month: 'short' })}
        </Box>
        <Box sx={artistStyles.dateBlockDay}>{start.getDate()}</Box>
      </Box>
      <Box sx={artistStyles.eventText}>
        {event.url ? (
          <Box
            component="a"
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={artistStyles.eventName}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
          >
            {event.name}
          </Box>
        ) : (
          <Box component="span" sx={artistStyles.eventName}>{event.name}</Box>
        )}
        <Box component="span" sx={artistStyles.eventMeta}>
          {formatDateRange(event.startDate, event.endDate)}
          {event.city && ` · ${event.city}`}
        </Box>
      </Box>
    </Box>
  );
};

const EventsSection = ({ artistEvents, lastEvent }: { artistEvents: any[]; lastEvent: any | null }) => (
  <Box component="section" aria-labelledby="artist-events-label">
    <MonoLabel component="h2" id="artist-events-label">
      {artistEvents.length > 0 ? 'Upcoming events' : 'Events'}
    </MonoLabel>
    {artistEvents.length > 0 && (
      <Box sx={artistStyles.eventsGrid}>
        {artistEvents.map((event: any) => (
          <ArtistEventCard key={event.id} event={event} />
        ))}
      </Box>
    )}
    <Box sx={artistStyles.lastAttended}>
      Last attended:{' '}
      {lastEvent ? (
        <RouterLink to={`/calendar/${lastEvent.id}`}>
          {lastEvent.name} · {new Date(lastEvent.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </RouterLink>
      ) : (
        <Box component="span" sx={{ color: vault.fg }}>Unknown</Box>
      )}
    </Box>
  </Box>
);

const SCRYFALL_CACHE_TTL = 24 * 60 * 60 * 1000;

function getCachedScryfallIds(artistName: string): string[] | null {
  try {
    const raw = localStorage.getItem(`scryfall_ids:${artistName}`);
    if (!raw) return null;
    const { ids, ts } = JSON.parse(raw);
    if (Date.now() - ts > SCRYFALL_CACHE_TTL) return null;
    return ids;
  } catch {
    return null;
  }
}

function setCachedScryfallIds(artistName: string, ids: string[]): void {
  try {
    localStorage.setItem(`scryfall_ids:${artistName}`, JSON.stringify({ ids, ts: Date.now() }));
  } catch {
    // localStorage unavailable
  }
}

const Artist = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const [isFollowing, setIsFollowing] = useState(false);
  const [signedCount, setSignedCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [artistProofCount, setArtistProofCount] = useState(0);
  // Total printings, known once the Scryfall ids are cached; the catalog card falls back to "View all cards".
  const [cardCount, setCardCount] = useState<number | null>(null);
  const [bannerFailed, setBannerFailed] = useState(false);

  usePageTitle(name);

  const { data, error, loading } = useQuery(
    GET_ARTIST_BY_NAME,
    {
      variables: { name: name || "" },
      skip: !name,
      fetchPolicy: 'cache-and-network',
    }
  );

  const { data: eventsData } = useQuery(GET_SIGNINGEVENTS);

  const { data: userData } = useQuery(GET_CURRENT_USER, {
    skip: !isLoggedIn,
  });

  const [followArtist] = useMutation(FOLLOW_ARTIST);
  const [unfollowArtist] = useMutation(UNFOLLOW_ARTIST);
  const [updateEmailPreferences] = useMutation(UPDATE_EMAIL_PREFERENCES);
  const [logLinkClick] = useMutation(LOG_LINK_CLICK);

  const trackClick = (linkType: string) => {
    if (userData?.me?.role === 'admin') return;
    logLinkClick({ variables: { artistName: name || '', linkType } });
  };

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
    setBannerFailed(false);
  }, [name]);

  useEffect(() => {
    const artistName = data?.artistByName?.name;
    const cached = artistName ? getCachedScryfallIds(artistName) : null;
    setCardCount(cached && cached.length > 0 ? cached.length : null);
  }, [data?.artistByName?.name]);

  useEffect(() => {
    if (!isLoggedIn || !data?.artistByName?.name) return;

    const artistName = data.artistByName.name;

    const runCollectionQuery = (ids: string[]) => {
      if (ids.length > 0) {
        fetchUserCardCollection({ variables: { scryfallIds: ids } });
      }
    };

    const cached = getCachedScryfallIds(artistName);
    if (cached) {
      runCollectionQuery(cached);
      return;
    }

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

    let active = true;
    fetchAllIds(baseUrl).then(ids => {
      setCachedScryfallIds(artistName, ids);
      if (active && ids.length > 0) setCardCount(ids.length);
      runCollectionQuery(ids);
    });
    return () => {
      active = false;
    };
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

  const pastEvents = useMemo(() => {
    if (!eventsData?.signingEvent) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventsData.signingEvent.filter((event: any) => {
      const endDate = new Date(event.endDate);
      return endDate < today;
    });
  }, [eventsData]);

  const allEventIds = useMemo(
    () => (eventsData?.signingEvent ?? []).map((e: any) => e.id),
    [eventsData]
  );

  const { data: eventArtistsData } = useQuery(GET_ARTISTS_BY_EVENT_IDS, {
    variables: { eventIds: allEventIds },
    skip: allEventIds.length === 0,
  });

  const attendingEventIds = useMemo(() => {
    if (!eventArtistsData?.artistsByEventIds || !data?.artistByName?.name) return new Set<string>();
    return new Set(
      eventArtistsData.artistsByEventIds
        .filter((a: any) => a.artistName === data.artistByName.name)
        .map((a: any) => a.eventId)
    );
  }, [eventArtistsData, data?.artistByName?.name]);

  const artistEvents = useMemo(() => {
    return upcomingEvents.filter((e: any) => attendingEventIds.has(e.id));
  }, [attendingEventIds, upcomingEvents]);

  const lastEventAttended = useMemo(() => {
    const attendedPast = pastEvents.filter((e: any) => attendingEventIds.has(e.id));
    if (attendedPast.length === 0) return null;
    return attendedPast.reduce((latest: any, e: any) =>
      new Date(e.endDate) > new Date(latest.endDate) ? e : latest
    );
  }, [attendingEventIds, pastEvents]);

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

  if (!name) return <Box sx={[artistStyles.page, artistStyles.statusMessage]}>No artist provided</Box>;
  if (loading)
    return (
      <Box sx={artistStyles.page}>
        <ArtistPageSkeleton />
      </Box>
    );
  if (error)
    return (
      <Box sx={artistStyles.page}>
        <Box sx={artistStyles.statusMessage} role="alert">
          Error loading artist: {error.message}
        </Box>
      </Box>
    );

  if (!data?.artistByName) {
    return (
      <Box sx={artistStyles.page}>
        <Box sx={artistStyles.statusMessage}>
          No artist found with the name "{name}"
        </Box>
      </Box>
    );
  }

  const { artistByName } = data;

  const socialMediaLinks: ArtistSocialLink[] = [
    { label: "Website", url: artistByName.url, icon: GlobeSimple },
    { label: "Facebook", url: artistByName.facebook, icon: FacebookLogo },
    { label: "Instagram", url: artistByName.instagram, icon: InstagramLogo },
    { label: "Twitter", url: artistByName.twitter, icon: TwitterLogo },
    { label: "Patreon", url: artistByName.patreon, icon: PatreonLogo },
    { label: "YouTube", url: artistByName.youtube, icon: YoutubeLogo },
    { label: "Artstation", url: artistByName.artstation, icon: FaArtstation },
    { label: "Bluesky", url: artistByName.bluesky, icon: FaBluesky },
  ];

  const signatureImage =
    artistByName.haveSignature === "true"
      ? `${MEDIA_BASE_URL}/signatures/${artistByName.filename}.jpg`
      : `${MEDIA_BASE_URL}/emptycardframe.jpg`;

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
                // Keep the cached `me` in sync so Settings doesn't save the stale artistUpdates value
                refetchQueries: [{ query: GET_CURRENT_USER }],
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

  const isSigning = !(!artistByName.signing || artistByName.signing === "false" || artistByName.signing === "unknown" || artistByName.signing === "no");
  const hasMarks = artistByName.markssignatureservice && artistByName.markssignatureservice !== "false";
  const hasMountainMage = artistByName.mountainmage && artistByName.mountainmage !== "false";
  const visibleSocialLinks = socialMediaLinks.filter(link => link.url);

  const collectionSummary = isLoggedIn && (signedCount > 0 || wishlistCount > 0 || artistProofCount > 0)
    ? [
        signedCount > 0 && `${signedCount} signed`,
        wishlistCount > 0 && `${wishlistCount} wishlisted`,
        artistProofCount > 0 && `${artistProofCount} artist proof`,
      ].filter(Boolean).join(', ')
    : null;

  const followLabel = !isLoggedIn ? 'Sign in to follow' : isFollowing ? 'Following' : '+ Follow';

  return (
    <Box sx={artistStyles.page}>
      <PageMeta
        title={artistByName.name}
        description={`Explore ${artistByName.name}'s Magic: The Gathering card art, signing events, and contact links on MtG Artist Connection.`}
        path={`/artist/${encodeURIComponent(artistByName.name)}`}
        image={`${MEDIA_BASE_URL}/banner/${artistByName.filename}.jpeg`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          "name": artistByName.name,
          "url": `https://www.mtgartistconnection.com/artist/${encodeURIComponent(artistByName.name)}`,
          "image": `${MEDIA_BASE_URL}/banner/${artistByName.filename}.jpeg`,
          "jobTitle": "Magic: The Gathering Artist",
          "worksFor": { "@id": "https://www.mtgartistconnection.com/#organization" },
        }}
      />

      {/* Full-bleed banner; striped placeholder shows while loading or if missing */}
      <Box sx={artistStyles.banner}>
        {!bannerFailed && (
          <Box
            component="img"
            src={`${MEDIA_BASE_URL}/banner/${artistByName.filename}.jpeg`}
            alt={`${artistByName.name} banner`}
            onError={() => setBannerFailed(true)}
            sx={artistStyles.bannerImage}
          />
        )}
        <Box sx={artistStyles.bannerFade} />
        <Box sx={artistStyles.bannerOverlay}>
          <MonoLabel tone="accent" size={12} tracking="wide">
            Illustrator{artistByName.location && ` · ${artistByName.location}`}
          </MonoLabel>
          <Box component="h1" sx={artistStyles.bannerName}>
            {artistByName.name}
          </Box>
          {artistByName.alternate_names && (
            <Box sx={artistStyles.bannerAltName}>
              Also credited as {artistByName.alternate_names}
            </Box>
          )}
        </Box>
      </Box>

      {/* Sticky action rail; stacks into full-width items on mobile */}
      <Box sx={artistStyles.rail}>
        <Box component="span" sx={artistStyles.railName}>{artistByName.name}</Box>
        <Box sx={artistStyles.railSpacer} />

        {nextSigningEvent && (
          <GlowPill to={`/calendar/${nextSigningEvent.id}`} size="md" sx={artistStyles.signingPill}>
            <Box component="span" sx={artistStyles.signingPillLabel}>{signingPillLabel}</Box>
            {' '}<span aria-hidden>→</span>
          </GlowPill>
        )}

        {userData?.me?.role === 'admin' && (
          <Button
            startIcon={<PencilSimple size={16} />}
            onClick={() => navigate(`/editartist/${artistByName.id}`)}
            sx={[artistStyles.railButton, artistStyles.editButton]}
          >
            Edit artist
          </Button>
        )}

        <Button
          onClick={handleFollowToggle}
          aria-pressed={isLoggedIn ? isFollowing : undefined}
          startIcon={isLoggedIn && isFollowing ? <BellRinging size={16} weight="duotone" /> : undefined}
          sx={[artistStyles.railButton, isLoggedIn && isFollowing ? artistStyles.followingButton : artistStyles.followButton]}
        >
          {followLabel}
        </Button>
      </Box>

      {/* Link cards */}
      <Box component="nav" aria-label={`${artistByName.name} links`} sx={artistStyles.linkCards}>
        <ExternalLinkCard
          href={`/allcards/${encodeURIComponent(artistByName.name)}`}
          eyebrow="Catalog"
          title={cardCount ? `View all ${cardCount} cards` : 'View all cards'}
          mobileTitle={cardCount ? `${cardCount} cards` : 'All cards'}
          ariaLabel={`View all ${artistByName.name} cards`}
          variant="primary"
          isInternal
        />
        {artistByName.omalink && (
          <ExternalLinkCard
            href={artistByName.omalink}
            eyebrow="Original Magic Art"
            mobileEyebrow="OMA"
            title="Prints & playmats"
            mobileTitle="Playmats"
            ariaLabel="Buy prints & playmats on Original Magic Art"
            external
            onClick={() => {
              if ((window as any).gtag) {
                (window as any).gtag("event", "oma_link_click", { event_category: "artist_page", event_label: artistByName.name, artist_name: artistByName.name });
              }
              trackClick('oma');
            }}
          />
        )}
        {artistByName.inprnt && (
          <ExternalLinkCard
            href={artistByName.inprnt}
            eyebrow="INPRNT"
            title="Buy prints"
            mobileTitle="Prints"
            ariaLabel="Buy prints on INPRNT"
            external
            onClick={() => {
              if ((window as any).gtag) {
                (window as any).gtag("event", "inprnt_link_click", { event_category: "artist_page", event_label: artistByName.name, artist_name: artistByName.name });
              }
              trackClick('inprnt');
            }}
          />
        )}
        <ExternalLinkCard
          href={ebayHref}
          eyebrow="eBay"
          title="Signed cards"
          mobileTitle="Signed"
          ariaLabel={`Search eBay for signed ${artistByName.name} cards`}
          external
          onClick={() => {
            if ((window as any).gtag) {
              (window as any).gtag("event", "ebay_link_click", { event_category: "artist_page", event_label: artistByName.name, artist_name: artistByName.name });
            }
            trackClick('ebay');
          }}
        />
      </Box>

      <Box sx={artistStyles.columns}>
        <Box sx={artistStyles.mainColumn}>
          <Box component="section" aria-labelledby="artist-info-label">
            <Box sx={artistStyles.sectionHead}>
              <MonoLabel component="h2" id="artist-info-label">Artist info</MonoLabel>
              {collectionSummary && (
                <Box component="span" sx={artistStyles.collectionSummary}>
                  Your collection: {collectionSummary}
                </Box>
              )}
            </Box>

            <Box component="dl" sx={artistStyles.infoList}>
              <InfoRow label="Links">
                {visibleSocialLinks.length > 0
                  ? visibleSocialLinks.map(link => (
                      <Box
                        component="a"
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={artistStyles.tagChip}
                        onClick={() => trackClick(link.label.toLowerCase())}
                        aria-label={`Visit ${artistByName.name}'s ${link.label}`}
                      >
                        <link.icon size={14} />
                        {link.label}
                      </Box>
                    ))
                  : 'Unknown'}
              </InfoRow>

              <InfoRow label="Email">
                {artistByName.email ? (
                  <Box component="a" href={`mailto:${artistByName.email}`} sx={artistStyles.infoLink}>
                    {artistByName.email}
                  </Box>
                ) : (
                  "Unknown"
                )}
              </InfoRow>

              <InfoRow label="Location">
                {artistByName.location ? (
                  <Box
                    component={RouterLink}
                    to={`/?location=${encodeURIComponent(artistByName.location)}`}
                    sx={artistStyles.infoLink}
                  >
                    {artistByName.location}
                  </Box>
                ) : (
                  "Unknown"
                )}
              </InfoRow>

              <InfoRow
                label={
                  <>
                    Currently signing
                    <Tooltip
                      title="Signing status is being verified for all artists. Unconfirmed statuses may change as we gather more information."
                      arrow
                      placement="top"
                    >
                      <Box component="span" sx={artistStyles.helpIcon} tabIndex={0} aria-label="About signing status">
                        <Question size={15} />
                      </Box>
                    </Tooltip>
                  </>
                }
              >
                {isSigning ? (
                  <Box component="span" sx={artistStyles.okChip}>
                    {capitalizeFirstLetter(artistByName.signing)}
                  </Box>
                ) : (
                  <Box component="span" sx={artistStyles.neutralChip}>Not confirmed</Box>
                )}
              </InfoRow>

              <InfoRow label="Artist proofs on site">
                {capitalizeFirstLetter(artistByName.artistProofs) || "Unknown"}
              </InfoRow>

              {artistByName.signingComment && (
                <InfoRow label="Notes">{artistByName.signingComment}</InfoRow>
              )}

              {(hasMarks || hasMountainMage) && (
                <InfoRow label="Services">
                  {hasMarks && (
                    <Box
                      component="a"
                      sx={artistStyles.tagChip}
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://www.facebook.com/groups/545759985597960/?multi_permalinks=1257167887790496&ref=share"
                      onClick={() => trackClick('markssignatureservice')}
                    >
                      Marks Signature Service
                    </Box>
                  )}
                  {hasMountainMage && (
                    <Box
                      component="a"
                      sx={artistStyles.tagChip}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={artistByName.mountainmage}
                      onClick={() => trackClick('mountainmage')}
                    >
                      MountainMage
                    </Box>
                  )}
                </InfoRow>
              )}
            </Box>
          </Box>

          <EventsSection artistEvents={artistEvents} lastEvent={lastEventAttended} />
        </Box>

        <Box sx={artistStyles.sideColumn}>
          <Box component="section" aria-labelledby="artist-signature-label" sx={artistStyles.signature}>
            <MonoLabel component="h2" id="artist-signature-label">Example signature</MonoLabel>
            <Slab
              src={signatureImage}
              alt={`${artistByName.name} signature example`}
              aspectRatio="63 / 88"
              size="lg"
              sx={artistStyles.signatureSlab}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Artist;
