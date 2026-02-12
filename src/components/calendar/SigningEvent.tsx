import {
    Box,
    Typography,
    Link,
    Paper,
    LinearProgress,
    Chip,
    Collapse,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Snackbar,
  } from "@mui/material";
  import { GET_ARTISTSBYEVENTID } from "../graphql/queries";
  import { useQuery } from "@apollo/client";
  import { CalendarToday, LocationOn, PeopleAlt, ExpandMore, Event, GetApp, Share } from '@mui/icons-material';
  import { useState } from "react";
  import { contentPageStyles } from "../../styles/content-page-styles";
  import { downloadICalFile, generateGoogleCalendarUrl, generateOutlookCalendarUrl } from "../../utils/calendarExport";
  
  interface SigningEventComponentProps {
    props: any;
  }

  const SigningEvent = ({ props }: SigningEventComponentProps) => {
    const [artistsExpanded, setArtistsExpanded] = useState(true);
    const [calendarMenuAnchor, setCalendarMenuAnchor] = useState<null | HTMLElement>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const startDateFormatted = new Date(props.startDate).toLocaleDateString();
    const endDateFormatted = new Date(props.endDate).toLocaleDateString();
    const eventId = props.id;

    const handleShareClick = () => {
      const url = `${window.location.origin}/calendar/${eventId}`;
      navigator.clipboard.writeText(url).then(() => {
        setSnackbarOpen(true);
      });
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={() => setSnackbarOpen(false)}
          message="Link copied to clipboard"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />

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
            sx={contentPageStyles.artistsHeader}
            onClick={() => setArtistsExpanded(!artistsExpanded)}
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
                ...contentPageStyles.expandIcon,
                transform: artistsExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </Box>

          <Collapse in={artistsExpanded} timeout="auto" unmountOnExit>
            <Box sx={contentPageStyles.artistsGrid}>
              {artistData?.mapArtistToEventByEventId && artistData.mapArtistToEventByEventId.length > 0 ? (
                artistData.mapArtistToEventByEventId.map((artist: any) => {
                  const artistLink = "/allcards/" + artist.artistName;
                  return (
                    <Chip
                      key={artist.artistName}
                      label={artist.artistName}
                      component={Link}
                      href={artistLink}
                      clickable
                      sx={contentPageStyles.artistChip}
                    />
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                  No artists confirmed yet
                </Typography>
              )}
            </Box>
          </Collapse>
        </Box>
      </Paper>
    );
  };

  export default SigningEvent;