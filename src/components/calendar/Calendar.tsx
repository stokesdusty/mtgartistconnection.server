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
import { contentPageStyles } from "../../styles/content-page-styles";

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

  if (loading)
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

  if (error)
    return (
      <Box sx={contentPageStyles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={contentPageStyles.wrapper}>
            <Typography sx={contentPageStyles.errorMessage}>
              Error loading calendar: {error.message}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );

  return (
    <Box sx={contentPageStyles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={contentPageStyles.wrapper}>
          <Typography variant="h1" sx={contentPageStyles.pageTitle}>
            Events Calendar
          </Typography>

          <Box sx={contentPageStyles.eventsContainer}>
            {filteredAndSortedEvents.length > 0 ? (
              filteredAndSortedEvents.map((eventData: any) => (
                <SigningEvent props={eventData} key={eventData.id} />
              ))
            ) : (
              <Typography sx={contentPageStyles.noEventsMessage}>
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