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
        new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    );
  }, [data]);

  // Modernized styles to match homepage
  const styles = {
    container: {
      backgroundColor: "#507A60",
      minHeight: "100vh",
      padding: { xs: 2, md: 4 },
    },
    wrapper: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: { xs: 2, md: 4 },
      backgroundColor: "#fff",
      borderRadius: 2,
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    },
    headerText: {
      color: "#507A60",
      fontWeight: 700,
      fontSize: { xs: "2rem", md: "3rem" },
      marginBottom: 3,
      textAlign: { xs: "center", md: "left" },
    },
    eventsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
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
        backgroundColor: "rgba(80, 122, 96, 0.1)",
        "& .MuiLinearProgress-bar": {
          backgroundColor: "#507A60",
        },
      },
    },
    errorMessage: {
      color: "#d32f2f",
      textAlign: "center",
      padding: 4,
      backgroundColor: "rgba(211, 47, 47, 0.1)",
      borderRadius: 2,
      margin: 2,
    },
    noEventsMessage: {
      textAlign: "center",
      padding: 4,
      color: "#666",
      backgroundColor: "rgba(80, 122, 96, 0.05)",
      borderRadius: 2,
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