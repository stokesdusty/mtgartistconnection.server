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
  
    // Modernized styles to match homepage
    const styles = {
      eventCard: {
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        padding: { xs: 2, md: 3 },
        border: "1px solid rgba(80, 122, 96, 0.1)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        },
      },
      eventTitle: {
        color: "#507A60",
        fontWeight: 700,
        fontSize: { xs: "1.5rem", md: "2rem" },
        marginBottom: 2,
      },
      infoContainer: {
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 1, md: 3 },
        alignItems: { xs: "flex-start", md: "center" },
        marginBottom: 2,
      },
      infoItem: {
        display: "flex",
        alignItems: "center",
        gap: 1,
        color: "#555",
        "& .MuiSvgIcon-root": {
          color: "#507A60",
        },
      },
      artistsContainer: {
        marginTop: 2,
      },
      artistsHeader: {
        display: "flex",
        alignItems: "center",
        gap: 1,
        marginBottom: 1,
        "& .MuiSvgIcon-root": {
          color: "#507A60",
        },
      },
      artistsGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        marginTop: 1,
      },
      artistLink: {
        color: "#fff",
        backgroundColor: "#507A60",
        textDecoration: "none",
        padding: "5px 12px",
        borderRadius: 15,
        fontSize: "0.875rem",
        transition: "background-color 0.2s",
        display: "inline-block",
        "&:hover": {
          backgroundColor: "#3c5c48",
        },
      },
      loadingContainer: {
        padding: 2,
        "& .MuiLinearProgress-root": {
          backgroundColor: "rgba(80, 122, 96, 0.1)",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#507A60",
          },
        },
      },
      errorMessage: {
        color: "#d32f2f",
        textAlign: "center",
        padding: 1,
        borderRadius: 1,
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