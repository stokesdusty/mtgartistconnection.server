import { Box, Menu, MenuItem } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { GET_SIGNINGEVENTS, GET_ARTISTSBYEVENTID, GET_ARTIST_NAMES } from "../graphql/queries";
import { MEDIA_BASE_URL } from "../../config/media";
import { useQuery } from "@apollo/client";
import { ArrowLeft, ArrowUpRight, CaretDown, Calendar, DownloadSimple } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useParams } from "react-router-dom";
import { downloadICalFile, generateGoogleCalendarUrl, generateOutlookCalendarUrl } from "../../utils/calendarExport";
import { daysUntil, eventStatusLabel, formatDateRangeWithYear } from "../../utils/eventDates";
import { eventDetailStyles as styles } from "../../styles/event-detail-styles";
import MonoLabel from "../shared/MonoLabel";
import Slab from "../shared/Slab";
import { SkeletonBar } from "../shared/Skeletons";
import { LiveDot } from "../shared/GlowPill";

const backLink = (
  <Box sx={styles.backRow}>
    <Box component={RouterLink} to="/calendar" sx={styles.backLink}>
      <ArrowLeft size={14} aria-hidden />
      Signing calendar
    </Box>
  </Box>
);

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [calendarMenuAnchor, setCalendarMenuAnchor] = useState<null | HTMLElement>(null);

  const { data: eventsData, error: eventError, loading: eventLoading } = useQuery(GET_SIGNINGEVENTS);

  const { data: artistData, error: artistError, loading: artistLoading } = useQuery(GET_ARTISTSBYEVENTID, {
    variables: { eventId },
    skip: !eventId,
    fetchPolicy: 'cache-and-network',
  });

  const { data: allArtistsData } = useQuery(GET_ARTIST_NAMES);

  const event = useMemo(() => {
    if (!eventsData?.signingEvent || !eventId) return null;
    return eventsData.signingEvent.find((e: any) => e.id === eventId);
  }, [eventsData, eventId]);

  // Map artist names to their full data (including filename for images), A–Z
  const artistsWithImages = useMemo(() => {
    if (!artistData?.mapArtistToEventByEventId || !allArtistsData?.artistNames) return [];

    return artistData.mapArtistToEventByEventId
      .map((eventArtist: any) => {
        const fullArtist = allArtistsData.artistNames.find(
          (a: any) => a.name === eventArtist.artistName
        );
        return {
          name: eventArtist.artistName as string,
          filename: (fullArtist?.filename || null) as string | null,
        };
      })
      .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
  }, [artistData, allArtistsData]);

  usePageTitle(event?.name ?? "Event");

  const handleCalendarMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setCalendarMenuAnchor(e.currentTarget);
  };

  const handleCalendarMenuClose = () => {
    setCalendarMenuAnchor(null);
  };

  const handleDownloadICal = () => {
    if (event) {
      downloadICalFile({
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        city: event.city,
        url: event.url,
      });
    }
    handleCalendarMenuClose();
  };

  const handleAddToGoogle = () => {
    if (event) {
      const googleUrl = generateGoogleCalendarUrl({
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        city: event.city,
        url: event.url,
      });
      window.open(googleUrl, '_blank');
    }
    handleCalendarMenuClose();
  };

  const handleAddToOutlook = () => {
    if (event) {
      const outlookUrl = generateOutlookCalendarUrl({
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        city: event.city,
        url: event.url,
      });
      window.open(outlookUrl, '_blank');
    }
    handleCalendarMenuClose();
  };

  if (eventLoading) {
    return (
      <Box sx={styles.page} aria-busy="true">
        {backLink}
        <Box sx={styles.hero}>
          <Box>
            <SkeletonBar width={110} height={14} sx={{ mb: 2 }} />
            <SkeletonBar width="min(520px, 70%)" height={64} radius="8px" />
          </Box>
          <Box sx={[styles.panel, { height: 216 }]} />
        </Box>
        <Box sx={styles.artistsSection}>
          <Box sx={styles.grid}>
            {Array.from({ length: 8 }, (_, i) => (
              <Slab key={i} aspectRatio="5 / 6" mobileAspectRatio="4 / 5" />
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  if (eventError || !event) {
    return (
      <Box sx={styles.page}>
        {backLink}
        <Box component="p" sx={styles.statusMessage}>
          {eventError ? `Error loading event: ${eventError.message}` : 'Event not found'}
        </Box>
      </Box>
    );
  }

  const status = eventStatusLabel(event.startDate, event.endDate);
  const isPast = daysUntil(event.endDate) < 0;
  const confirmedCount = artistData?.mapArtistToEventByEventId?.length;

  return (
    <Box sx={styles.page}>
      {backLink}

      <Box sx={styles.hero}>
        <Box>
          <MonoLabel tone={isPast ? 'faint' : 'accent'} size={12} tracking="wide" sx={styles.eyebrow}>
            {!isPast && <LiveDot />}
            {status}
          </MonoLabel>
          <Box component="h1" sx={styles.title}>{event.name}</Box>
          {event.url && (
            <Box
              component="a"
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={styles.siteLink}
            >
              Visit event site
              <ArrowUpRight size={13} aria-hidden />
            </Box>
          )}
        </Box>

        <Box sx={styles.panel}>
          <Box component="dl" sx={{ m: 0 }}>
            <Box sx={styles.panelRow}>
              <Box component="dt" sx={styles.panelLabel}>Dates</Box>
              <Box component="dd" sx={styles.panelValue}>
                {formatDateRangeWithYear(event.startDate, event.endDate)}
              </Box>
            </Box>
            <Box sx={styles.panelRow}>
              <Box component="dt" sx={styles.panelLabel}>City</Box>
              <Box component="dd" sx={styles.panelValue}>{event.city}</Box>
            </Box>
            <Box sx={styles.panelRow}>
              <Box component="dt" sx={styles.panelLabel}>Artists</Box>
              <Box component="dd" sx={styles.panelValue}>
                {confirmedCount === undefined ? '—' : `${confirmedCount} confirmed`}
              </Box>
            </Box>
          </Box>
          <Box sx={styles.panelAction}>
            <Box
              component="button"
              type="button"
              onClick={handleCalendarMenuOpen}
              aria-haspopup="menu"
              aria-expanded={Boolean(calendarMenuAnchor)}
              aria-controls={calendarMenuAnchor ? 'add-to-calendar-menu' : undefined}
              sx={styles.calendarButton}
            >
              Add to calendar
              <CaretDown size={12} weight="fill" aria-hidden />
            </Box>
          </Box>
        </Box>
      </Box>

      <Menu
        id="add-to-calendar-menu"
        anchorEl={calendarMenuAnchor}
        open={Boolean(calendarMenuAnchor)}
        onClose={handleCalendarMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: styles.menuPaper }}
      >
        <MenuItem onClick={handleAddToGoogle} sx={styles.menuItem}>
          <Calendar size={18} weight="duotone" aria-hidden />
          Google Calendar
        </MenuItem>
        <MenuItem onClick={handleAddToOutlook} sx={styles.menuItem}>
          <Calendar size={18} weight="duotone" aria-hidden />
          Outlook Calendar
        </MenuItem>
        <MenuItem onClick={handleDownloadICal} sx={styles.menuItem}>
          <DownloadSimple size={18} aria-hidden />
          Apple/Other (.ics)
        </MenuItem>
      </Menu>

      <Box component="section" aria-labelledby="artists-attending" sx={styles.artistsSection}>
        <Box sx={styles.sectionHeader}>
          <Box component="h2" id="artists-attending" sx={styles.sectionTitle}>Artists attending</Box>
          {artistsWithImages.length > 1 && (
            <MonoLabel size={11} tracking="tight" sx={styles.sortHint}>A–Z</MonoLabel>
          )}
        </Box>

        {artistLoading && artistsWithImages.length === 0 ? (
          <Box sx={styles.grid} aria-busy="true">
            {Array.from({ length: 4 }, (_, i) => (
              <Slab key={i} aspectRatio="5 / 6" mobileAspectRatio="4 / 5" />
            ))}
          </Box>
        ) : artistError ? (
          <Box component="p" sx={styles.errorMessage}>Error loading artists</Box>
        ) : (
          <Box sx={styles.grid}>
            {artistsWithImages.length > 0 ? (
              artistsWithImages.map((artist: { name: string; filename: string | null }) => (
                <Box
                  key={artist.name}
                  component={RouterLink}
                  to={`/allcards/${encodeURIComponent(artist.name)}`}
                  sx={styles.artistLink}
                >
                  <Slab
                    src={artist.filename ? `${MEDIA_BASE_URL}/grid/${artist.filename}.jpg` : undefined}
                    alt={artist.name}
                    aspectRatio="5 / 6"
                    mobileAspectRatio="4 / 5"
                    title={artist.name}
                    interactive
                    imgProps={{
                      srcSet: `${MEDIA_BASE_URL}/grid/${artist.filename}.jpg 300w`,
                      sizes: '(max-width: 720px) calc(50vw - 24px), (max-width: 1100px) calc(33vw - 40px), calc(25vw - 40px)',
                      width: 300,
                      height: 300,
                    }}
                  />
                </Box>
              ))
            ) : (
              <Box component="p" sx={styles.emptyMessage}>
                No artists confirmed yet
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EventDetail;
