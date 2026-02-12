import {
  Box,
  Typography,
  Link,
  Paper,
  LinearProgress,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Container,
} from "@mui/material";
import { GET_SIGNINGEVENTS, GET_ARTISTSBYEVENTID, GET_ARTISTS_FOR_HOMEPAGE } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import { CalendarToday, LocationOn, PeopleAlt, Event, GetApp, ArrowBack } from '@mui/icons-material';
import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contentPageStyles } from "../../styles/content-page-styles";
import { downloadICalFile, generateGoogleCalendarUrl, generateOutlookCalendarUrl } from "../../utils/calendarExport";

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [calendarMenuAnchor, setCalendarMenuAnchor] = useState<null | HTMLElement>(null);

  const { data: eventsData, error: eventError, loading: eventLoading } = useQuery(GET_SIGNINGEVENTS);

  const { data: artistData, error: artistError, loading: artistLoading } = useQuery(GET_ARTISTSBYEVENTID, {
    variables: { eventId },
    skip: !eventId,
  });

  const { data: allArtistsData } = useQuery(GET_ARTISTS_FOR_HOMEPAGE);

  const event = useMemo(() => {
    if (!eventsData?.signingEvent || !eventId) return null;
    return eventsData.signingEvent.find((e: any) => e.id === eventId);
  }, [eventsData, eventId]);

  // Map artist names to their full data (including filename for images)
  const artistsWithImages = useMemo(() => {
    if (!artistData?.mapArtistToEventByEventId || !allArtistsData?.artists) return [];

    return artistData.mapArtistToEventByEventId.map((eventArtist: any) => {
      const fullArtist = allArtistsData.artists.find(
        (a: any) => a.name === eventArtist.artistName
      );
      return {
        name: eventArtist.artistName,
        filename: fullArtist?.filename || null,
      };
    });
  }, [artistData, allArtistsData]);

  document.title = event ? `MtG Artist Connection - ${event.name}` : "MtG Artist Connection - Event";

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
      <Box sx={contentPageStyles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={contentPageStyles.wrapper}>
            <Box sx={contentPageStyles.loadingContainer}>
              <LinearProgress />
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (eventError || !event) {
    return (
      <Box sx={contentPageStyles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={contentPageStyles.wrapper}>
            <Typography sx={contentPageStyles.errorMessage}>
              {eventError ? `Error loading event: ${eventError.message}` : 'Event not found'}
            </Typography>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/calendar')}
              sx={{ mt: 2, color: '#2d4a36' }}
            >
              Back to Calendar
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  const startDateFormatted = new Date(event.startDate).toLocaleDateString();
  const endDateFormatted = new Date(event.endDate).toLocaleDateString();

  return (
    <Box sx={contentPageStyles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={contentPageStyles.wrapper}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/calendar')}
            sx={{
              mb: 3,
              color: '#2d4a36',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#fafafa',
              }
            }}
          >
            Back to Calendar
          </Button>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {event.url ? (
              <Link
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ textDecoration: 'none' }}
              >
                <Typography variant="h1" sx={contentPageStyles.pageTitle}>
                  {event.name}
                </Typography>
              </Link>
            ) : (
              <Typography variant="h1" sx={contentPageStyles.pageTitle}>
                {event.name}
              </Typography>
            )}

            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              alignItems: 'center',
              justifyContent: 'center',
              mt: 3,
            }}>
              <Box sx={contentPageStyles.infoItem}>
                <CalendarToday fontSize="small" />
                <Typography>
                  {startDateFormatted}{startDateFormatted !== endDateFormatted && ` - ${endDateFormatted}`}
                </Typography>
              </Box>

              <Box sx={contentPageStyles.infoItem}>
                <LocationOn fontSize="small" />
                <Typography>{event.city}</Typography>
              </Box>

              <Button
                onClick={handleCalendarMenuOpen}
                startIcon={<Event />}
                sx={{
                  color: '#2d4a36',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#fafafa',
                  }
                }}
              >
                Add to Calendar
              </Button>
            </Box>
          </Box>

          <Menu
            anchorEl={calendarMenuAnchor}
            open={Boolean(calendarMenuAnchor)}
            onClose={handleCalendarMenuClose}
            PaperProps={{
              sx: {
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }
            }}
          >
            <MenuItem onClick={handleAddToGoogle} sx={{ fontSize: '0.875rem', py: 1.5 }}>
              <ListItemIcon>
                <Event fontSize="small" sx={{ color: '#2d4a36' }} />
              </ListItemIcon>
              <ListItemText>Google Calendar</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleAddToOutlook} sx={{ fontSize: '0.875rem', py: 1.5 }}>
              <ListItemIcon>
                <Event fontSize="small" sx={{ color: '#2d4a36' }} />
              </ListItemIcon>
              <ListItemText>Outlook Calendar</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDownloadICal} sx={{ fontSize: '0.875rem', py: 1.5 }}>
              <ListItemIcon>
                <GetApp fontSize="small" sx={{ color: '#2d4a36' }} />
              </ListItemIcon>
              <ListItemText>Apple/Other (.ics)</ListItemText>
            </MenuItem>
          </Menu>

          <Box sx={contentPageStyles.artistsContainer}>
            <Box sx={{ ...contentPageStyles.artistsHeaderLeft, mb: 2 }}>
              <PeopleAlt fontSize="small" />
              <Typography variant="subtitle1" sx={contentPageStyles.artistsHeaderText}>
                Artists
                {artistsWithImages.length > 0 && ` (${artistsWithImages.length})`}
              </Typography>
            </Box>

            {artistLoading ? (
              <LinearProgress />
            ) : artistError ? (
              <Typography color="error">Error loading artists</Typography>
            ) : (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                  lg: 'repeat(5, 1fr)',
                },
                gap: 2,
              }}>
                {artistsWithImages.length > 0 ? (
                  artistsWithImages.map((artist: { name: string; filename: string | null }) => (
                    <Link
                      key={artist.name}
                      href={`/allcards/${artist.name}`}
                      sx={{
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#f5f5f5',
                          mb: 1,
                        }}
                      >
                        {artist.filename ? (
                          <img
                            src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/grid/${artist.filename}.jpg`}
                            alt={artist.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#e0e0e0',
                            }}
                          >
                            <PeopleAlt sx={{ fontSize: 40, color: '#9e9e9e' }} />
                          </Box>
                        )}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#212121',
                          textAlign: 'center',
                        }}
                      >
                        {artist.name}
                      </Typography>
                    </Link>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", gridColumn: '1 / -1' }}>
                    No artists confirmed yet
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default EventDetail;
