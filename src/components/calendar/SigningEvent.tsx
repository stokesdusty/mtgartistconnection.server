import { 
    Box, 
    Typography, 
    Link, 
    useTheme, 
    useMediaQuery, 
    Paper, 
    LinearProgress,
    Chip,
    Divider
  } from "@mui/material";
  import { GET_ARTISTSBYEVENTID } from "../graphql/queries";
  import { useQuery } from "@apollo/client";
  import { CalendarToday, LocationOn, PeopleAlt } from '@mui/icons-material';
  
  const SigningEvent = (SigningEventProps: any) => {
    const startDateFormatted = new Date(SigningEventProps.props.startDate).toLocaleDateString();
    const endDateFormatted = new Date(SigningEventProps.props.endDate).toLocaleDateString();
    const eventId = SigningEventProps.props.id;
    const theme = useTheme();
    const isBelowMedium = useMediaQuery(theme.breakpoints.down("md"));
    
    const { data: artistData, error, loading } = useQuery(GET_ARTISTSBYEVENTID, {
      variables: {
        eventId
      }
    });
  
    const styles = {
      eventCard: {
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px) saturate(1.1)",
        borderRadius: 4,
        padding: { xs: 3, md: 4 },
        boxShadow: "0 16px 48px rgba(0,0,0,0.06), 0 8px 24px rgba(80, 122, 96, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px) scale(1.02)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.08), 0 12px 32px rgba(80, 122, 96, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
        },
      },
      eventTitle: {
        background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontWeight: 800,
        fontSize: { xs: "1.6rem", md: "2.2rem" },
        marginBottom: 2.5,
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        letterSpacing: "-0.01em",
        textAlign: "center",
      },
      infoContainer: {
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 2, md: 4 },
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 3,
        padding: 2,
        background: "rgba(255, 255, 255, 0.7)",
        borderRadius: 3,
        border: "1px solid rgba(255, 255, 255, 0.5)",
      },
      infoItem: {
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        color: "#2d3748",
        fontWeight: 500,
        fontSize: "1rem",
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        padding: "8px 16px",
        background: "rgba(255, 255, 255, 0.8)",
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.6)",
        transition: "all 0.3s ease",
        "&:hover": {
          background: "rgba(255, 255, 255, 0.95)",
          transform: "translateY(-1px)",
        },
        "& .MuiSvgIcon-root": {
          color: "#507A60",
        },
      },
      artistsContainer: {
        marginTop: 3,
        background: "rgba(255, 255, 255, 0.7)",
        borderRadius: 3,
        padding: 3,
        border: "1px solid rgba(255, 255, 255, 0.5)",
      },
      artistsHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        marginBottom: 2,
        "& .MuiSvgIcon-root": {
          color: "#507A60",
        },
        "& .MuiTypography-root": {
          background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: 700,
          fontSize: "1.2rem",
          fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        },
      },
      artistsGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        marginTop: 2,
        justifyContent: "center",
      },
      artistLink: {
        background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
        color: "white",
        textDecoration: "none",
        padding: "10px 20px",
        borderRadius: 3,
        fontSize: "0.9rem",
        fontWeight: 600,
        display: "inline-block",
        boxShadow: "0 6px 16px rgba(80, 122, 96, 0.2), 0 2px 6px rgba(80, 122, 96, 0.12)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        letterSpacing: "0.3px",
        "&:hover": {
          transform: "translateY(-2px) scale(1.05)",
          boxShadow: "0 10px 24px rgba(80, 122, 96, 0.25), 0 4px 12px rgba(80, 122, 96, 0.15)",
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
        <Typography variant={isBelowMedium ? "h4" : "h3"} sx={styles.eventTitle}>
          {SigningEventProps.props.name}
        </Typography>
        
        <Box sx={styles.infoContainer}>
          <Box sx={styles.infoItem}>
            <CalendarToday fontSize="small" />
            <Typography>
              {startDateFormatted} {startDateFormatted !== endDateFormatted && `- ${endDateFormatted}`}
            </Typography>
          </Box>
          
          <Box sx={styles.infoItem}>
            <LocationOn fontSize="small" />
            <Typography>{SigningEventProps.props.city}</Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2, backgroundColor: "rgba(80, 122, 96, 0.1)" }} />
        
        <Box sx={styles.artistsContainer}>
          <Box sx={styles.artistsHeader}>
            <PeopleAlt fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600}>
              Participating Artists
            </Typography>
          </Box>
          
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
              <Typography variant="body2" color="text.secondary">
                No artists confirmed yet
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    );
  };
  
  export default SigningEvent;