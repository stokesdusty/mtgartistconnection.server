import {
    Box,
    Typography,
    Link,
    Paper,
    LinearProgress,
    Chip,
    Collapse,
  } from "@mui/material";
  import { GET_ARTISTSBYEVENTID } from "../graphql/queries";
  import { useQuery } from "@apollo/client";
  import { CalendarToday, LocationOn, PeopleAlt, ExpandMore } from '@mui/icons-material';
  import { useState } from "react";
  import { contentPageStyles } from "../../styles/content-page-styles";
  
  const SigningEvent = (SigningEventProps: any) => {
    const [artistsExpanded, setArtistsExpanded] = useState(true);
    const startDateFormatted = new Date(SigningEventProps.props.startDate).toLocaleDateString();
    const endDateFormatted = new Date(SigningEventProps.props.endDate).toLocaleDateString();
    const eventId = SigningEventProps.props.id;
    
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
      <Paper sx={contentPageStyles.eventCard} elevation={0} key={SigningEventProps.props.name}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', marginBottom: 1.5, textAlign: 'center' }}>
          <Typography variant="h3" sx={contentPageStyles.eventTitle}>
            {SigningEventProps.props.name}
          </Typography>

          <Box sx={contentPageStyles.infoRow}>
            <Box sx={contentPageStyles.infoItem}>
              <CalendarToday fontSize="small" />
              <Typography>
                {startDateFormatted}{startDateFormatted !== endDateFormatted && ` - ${endDateFormatted}`}
              </Typography>
            </Box>

            <Box sx={contentPageStyles.infoItem}>
              <LocationOn fontSize="small" />
              <Typography>{SigningEventProps.props.city}</Typography>
            </Box>
          </Box>
        </Box>

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
                  const artistLink = "/artist/" + artist.artistName;
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