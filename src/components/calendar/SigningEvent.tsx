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
  
  const SigningEvent = (SigningEventProps: any) => {
    const [artistsExpanded, setArtistsExpanded] = useState(false);
    const startDateFormatted = new Date(SigningEventProps.props.startDate).toLocaleDateString();
    const endDateFormatted = new Date(SigningEventProps.props.endDate).toLocaleDateString();
    const eventId = SigningEventProps.props.id;
    
    const { data: artistData, error, loading } = useQuery(GET_ARTISTSBYEVENTID, {
      variables: {
        eventId
      }
    });
  
    const styles = {
      eventCard: {
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px) saturate(1.1)",
        borderRadius: 3,
        padding: { xs: 2, md: 2.5 },
        boxShadow: "0 8px 24px rgba(0,0,0,0.06), 0 4px 12px rgba(80, 122, 96, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.08), 0 6px 16px rgba(80, 122, 96, 0.12)",
        },
      },
      headerContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 1,
        alignItems: "center",
        marginBottom: 1.5,
        textAlign: "center",
      },
      eventTitle: {
        background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontWeight: 700,
        fontSize: { xs: "1.3rem", md: "1.5rem" },
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        letterSpacing: "-0.01em",
      },
      infoRow: {
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
        justifyContent: "center",
      },
      infoItem: {
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        color: "#4a5568",
        fontWeight: 500,
        fontSize: "0.9rem",
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        "& .MuiSvgIcon-root": {
          color: "#507A60",
          fontSize: "1.1rem",
        },
      },
      artistsContainer: {
        marginTop: 1.5,
        background: "rgba(255, 255, 255, 0.5)",
        borderRadius: 2,
        padding: 1.5,
        border: "1px solid rgba(80, 122, 96, 0.15)",
      },
      artistsHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        cursor: "pointer",
        padding: "6px 8px",
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          background: "rgba(80, 122, 96, 0.08)",
        },
        "& .MuiSvgIcon-root": {
          color: "#507A60",
          fontSize: "1.1rem",
        },
        "& .MuiTypography-root": {
          background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: 600,
          fontSize: "0.95rem",
          fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        },
      },
      artistsHeaderLeft: {
        display: "flex",
        alignItems: "center",
        gap: 0.75,
      },
      expandIcon: {
        color: "#507A60",
        transition: "transform 0.3s ease",
        "&.expanded": {
          transform: "rotate(180deg)",
        },
      },
      artistsGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        marginTop: 1.5,
        justifyContent: "flex-start",
      },
      artistLink: {
        background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
        color: "white",
        textDecoration: "none",
        padding: "6px 14px",
        borderRadius: 2,
        fontSize: "0.85rem",
        fontWeight: 600,
        display: "inline-block",
        boxShadow: "0 2px 6px rgba(80, 122, 96, 0.15)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        transition: "all 0.2s ease",
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 4px 10px rgba(80, 122, 96, 0.2)",
          background: "linear-gradient(135deg, #5a8b6a 0%, #75a97d 100%)",
        },
      },
      loadingContainer: {
        padding: 3,
        "& .MuiLinearProgress-root": {
          borderRadius: 4,
          height: 6,
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          "& .MuiLinearProgress-bar": {
            background: "linear-gradient(90deg, #507A60, #6b9d73)",
            borderRadius: 4,
          },
        },
      },
      errorMessage: {
        color: "#d32f2f",
        textAlign: "center",
        padding: 3,
        background: "linear-gradient(135deg, rgba(211, 47, 47, 0.08) 0%, rgba(211, 47, 47, 0.12) 100%)",
        borderRadius: 3,
        border: "1px solid rgba(211, 47, 47, 0.2)",
        backdropFilter: "blur(10px)",
        fontSize: "1rem",
        fontWeight: 500,
      },
    };
    
    if (loading) 
      return (
        <Paper sx={styles.eventCard}>
          <Box sx={styles.loadingContainer}>
            <LinearProgress />
          </Box>
        </Paper>
      );
      
    if (error) 
      return (
        <Paper sx={styles.eventCard}>
          <Typography sx={styles.errorMessage}>
            Error loading artists: {error.message}
          </Typography>
        </Paper>
      );
  
    return (
      <Paper sx={styles.eventCard} elevation={0} key={SigningEventProps.props.name}>
        <Box sx={styles.headerContainer}>
          <Typography variant="h5" sx={styles.eventTitle}>
            {SigningEventProps.props.name}
          </Typography>

          <Box sx={styles.infoRow}>
            <Box sx={styles.infoItem}>
              <CalendarToday fontSize="small" />
              <Typography>
                {startDateFormatted}{startDateFormatted !== endDateFormatted && ` - ${endDateFormatted}`}
              </Typography>
            </Box>

            <Box sx={styles.infoItem}>
              <LocationOn fontSize="small" />
              <Typography>{SigningEventProps.props.city}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={styles.artistsContainer}>
          <Box
            sx={styles.artistsHeader}
            onClick={() => setArtistsExpanded(!artistsExpanded)}
          >
            <Box sx={styles.artistsHeaderLeft}>
              <PeopleAlt fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                Artists
                {artistData?.mapArtistToEventByEventId &&
                  ` (${artistData.mapArtistToEventByEventId.length})`}
              </Typography>
            </Box>
            <ExpandMore
              sx={{
                ...styles.expandIcon,
                transform: artistsExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </Box>

          <Collapse in={artistsExpanded} timeout="auto" unmountOnExit>
            <Box sx={styles.artistsGrid}>
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
                      sx={styles.artistLink}
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