import {
    Box,
    Typography,
    Link,
    Paper,
    LinearProgress,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    IconButton,
  } from "@mui/material";
  import { GET_ARTISTSBYEVENTID, GET_ARTISTS_FOR_HOMEPAGE } from "../graphql/queries";
  import { useQuery } from "@apollo/client";
  import { CalendarToday, LocationOn, PeopleAlt, Event, GetApp, Share, ExpandMore } from '@mui/icons-material';
  import { useMemo, useState } from "react";
  import { contentPageStyles } from "../../styles/content-page-styles";
  import { downloadICalFile, generateGoogleCalendarUrl, generateOutlookCalendarUrl } from "../../utils/calendarExport";
  
  interface SigningEventComponentProps {
    props: any;
  }

  const COLLAPSED_EVENTS_KEY = 'mtgac_collapsed_events';

  const getCollapsedEvents = (): string[] => {
    try {
      const stored = localStorage.getItem(COLLAPSED_EVENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const setCollapsedEvents = (eventIds: string[]) => {
    try {
      localStorage.setItem(COLLAPSED_EVENTS_KEY, JSON.stringify(eventIds));
    } catch {
      // Silently fail if localStorage is unavailable
    }
  };

  const SigningEvent = ({ props }: SigningEventComponentProps) => {
    const [calendarMenuAnchor, setCalendarMenuAnchor] = useState<null | HTMLElement>(null);
    const eventId = props.id;
    const [isCollapsed, setIsCollapsed] = useState(() => getCollapsedEvents().includes(eventId));
    const startDateFormatted = new Date(props.startDate).toLocaleDateString();
    const endDateFormatted = new Date(props.endDate).toLocaleDateString();

    const toggleCollapsed = () => {
      setIsCollapsed((prev) => {
        const collapsed = getCollapsedEvents();
        if (prev) {
          // Expanding - remove from collapsed list
          setCollapsedEvents(collapsed.filter((id) => id !== eventId));
        } else {
          // Collapsing - add to collapsed list
          setCollapsedEvents([...collapsed, eventId]);
        }
        return !prev;
      });
    };

    const handleShareClick = () => {
      const url = `${window.location.origin}/calendar/${eventId}`;
      window.open(url, '_blank');
    };

    const handleCalendarMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setCalendarMenuAnchor(event.currentTarget);
    };

    const handleCalendarMenuClose = () => {
      setCalendarMenuAnchor(null);
    };

    const handleDownloadICal = () => {
      downloadICalFile({
        name: props.name,
        startDate: props.startDate,
        endDate: props.endDate,
        city: props.city,
        url: props.url,
      });
      handleCalendarMenuClose();
    };

    const handleAddToGoogle = () => {
      const googleUrl = generateGoogleCalendarUrl({
        name: props.name,
        startDate: props.startDate,
        endDate: props.endDate,
        city: props.city,
        url: props.url,
      });
      window.open(googleUrl, '_blank');
      handleCalendarMenuClose();
    };

    const handleAddToOutlook = () => {
      const outlookUrl = generateOutlookCalendarUrl({
        name: props.name,
        startDate: props.startDate,
        endDate: props.endDate,
        city: props.city,
        url: props.url,
      });
      window.open(outlookUrl, '_blank');
      handleCalendarMenuClose();
    };

    const { data: artistData, error, loading } = useQuery(GET_ARTISTSBYEVENTID, {
      variables: {
        eventId
      }
    });

    const { data: allArtistsData } = useQuery(GET_ARTISTS_FOR_HOMEPAGE);

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

    if (loading)
      return (
        <Paper sx={contentPageStyles.eventCard}>
          <Box sx={contentPageStyles.loadingContainer}>
            <LinearProgress />
          </Box>
        </Paper>
      );

    if (error)
      return (
        <Paper sx={contentPageStyles.eventCard}>
          <Typography sx={contentPageStyles.errorMessage}>
            Error loading artists: {error.message}
          </Typography>
        </Paper>
      );
  
    return (
      <Paper
        sx={contentPageStyles.eventCard}
        elevation={0}
        key={props.name}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', marginBottom: 1.5, textAlign: 'center' }}>
          {props.url ? (
            <Link
              href={props.url}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ textDecoration: 'none' }}
            >
              <Typography variant="h3" sx={contentPageStyles.eventTitle}>
                {props.name}
              </Typography>
            </Link>
          ) : (
            <Typography variant="h3" sx={contentPageStyles.eventTitle}>
              {props.name}
            </Typography>
          )}

          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Box sx={contentPageStyles.infoItem}>
              <CalendarToday fontSize="small" />
              <Typography>
                {startDateFormatted}{startDateFormatted !== endDateFormatted && ` - ${endDateFormatted}`}
              </Typography>
            </Box>

            <Box sx={contentPageStyles.infoItem}>
              <LocationOn fontSize="small" />
              <Typography>{props.city}</Typography>
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

            <IconButton
              onClick={handleShareClick}
              size="small"
              sx={{
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#fafafa',
                  color: '#2d4a36',
                }
              }}
              title="Copy link to event"
            >
              <Share fontSize="small" />
            </IconButton>
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
          <Box
            sx={{
              ...contentPageStyles.artistsHeader,
              cursor: 'pointer',
            }}
            onClick={toggleCollapsed}
          >
            <Box sx={contentPageStyles.artistsHeaderLeft}>
              <PeopleAlt fontSize="small" />
              <Typography variant="subtitle1" sx={contentPageStyles.artistsHeaderText}>
                Artists
                {artistData?.mapArtistToEventByEventId &&
                  ` (${artistData.mapArtistToEventByEventId.length})`}
              </Typography>
            </Box>
            <ExpandMore
              sx={{
                color: '#757575',
                transition: 'transform 0.2s',
                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            />
          </Box>

          {!isCollapsed && (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(3, 1fr)',
                sm: 'repeat(4, 1fr)',
                md: 'repeat(6, 1fr)',
              },
              gap: 1.5,
              mt: 1,
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
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#f5f5f5',
                        mb: 0.5,
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
                          <PeopleAlt sx={{ fontSize: 24, color: '#9e9e9e' }} />
                        </Box>
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: '#212121',
                        textAlign: 'center',
                        lineHeight: 1.2,
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
    );
  };

  export default SigningEvent;