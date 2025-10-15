import { useMemo } from "react";
import { 
  Box, 
  Container, 
  LinearProgress, 
  Paper, 
  Typography 
} from "@mui/material";
import { GET_SIGNINGEVENTS } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import SigningEvent from "./SigningEvent";

const Calendar = () => {
  document.title = "MtG Artist Connection - Events Calendar";

  const { data, error, loading } = useQuery(GET_SIGNINGEVENTS);

  const filteredAndSortedEvents = useMemo(() => {
    if (!data?.signingEvent) {
      return [];
    }

    const today = new Date();
    const filtered = data.signingEvent.filter((eventData: any) => {
      const endDate = new Date(eventData.endDate);
      return endDate >= today;
    });

    return filtered.sort(
      (a: any, b: any) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [data]);

  const styles = {
    container: {
      background: "linear-gradient(135deg, #507A60 0%, #3c5c48 50%, #2d4a36 100%)",
      minHeight: "100vh",
      padding: { xs: 3, md: 6 },
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)",
        pointerEvents: "none",
      },
    },
    wrapper: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: { xs: 2, md: 3 },
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(30px) saturate(1.2)",
      borderRadius: 4,
      boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 16px 40px rgba(80, 122, 96, 0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      position: "relative",
      zIndex: 1,
    },
    headerText: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 800,
      fontSize: { xs: "2.2rem", md: "3.2rem" },
      marginBottom: 3,
      textAlign: "center",
      letterSpacing: "-0.02em",
      lineHeight: 1,
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "-8px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100px",
        height: "3px",
        background: "linear-gradient(90deg, transparent, #507A60, transparent)",
        borderRadius: "2px",
      },
    },
    eventsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      marginTop: 2,
    },
    loadingContainer: {
      padding: 4,
      display: "flex",
      justifyContent: "center",
      "& .MuiLinearProgress-root": {
        width: "100%",
        maxWidth: 600,
        height: 8,
        borderRadius: 4,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        "& .MuiLinearProgress-bar": {
          background: "linear-gradient(90deg, #507A60, #6b9d73)",
        },
      },
    },
    errorMessage: {
      color: "#d32f2f",
      textAlign: "center",
      padding: 4,
      background: "linear-gradient(135deg, rgba(211, 47, 47, 0.08) 0%, rgba(211, 47, 47, 0.12) 100%)",
      borderRadius: 3,
      border: "1px solid rgba(211, 47, 47, 0.2)",
      backdropFilter: "blur(10px)",
      fontSize: "1.1rem",
      fontWeight: 500,
      margin: 2,
    },
    noEventsMessage: {
      textAlign: "center",
      padding: 4,
      color: "#2d3748",
      fontSize: "1.1rem",
      fontWeight: 500,
      background: "rgba(255, 255, 255, 0.8)",
      borderRadius: 3,
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      margin: 2,
    },
  };

  if (loading)
    return (
      <Box sx={styles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={styles.wrapper}>
            <Box sx={styles.loadingContainer}>
              <LinearProgress />
            </Box>
          </Paper>
        </Container>
      </Box>
    );
    
  if (error) 
    return (
      <Box sx={styles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={styles.wrapper}>
            <Typography sx={styles.errorMessage}>
              Error loading calendar: {error.message}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );

  return (
    <Box sx={styles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={styles.wrapper}>
          <Typography variant="h2" sx={styles.headerText}>
            Events Calendar
          </Typography>
          
          <Box sx={styles.eventsContainer}>
            {filteredAndSortedEvents.length > 0 ? (
              filteredAndSortedEvents.map((eventData: any) => (
                <SigningEvent props={eventData} key={eventData.id} />
              ))
            ) : (
              <Typography sx={styles.noEventsMessage}>
                No upcoming events scheduled at this time. Check back soon!
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Calendar;