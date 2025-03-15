import { Box } from "@mui/system";
import { calendarStyles } from "../../styles/calendar-styles";
import { LinearProgress, Typography } from "@mui/material";
import { GET_SIGNINGEVENTS } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import { homepageStyles } from "../../styles/homepage-styles";
import SigningEvent from "./SigningEvent";
import { useMemo } from "react";

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

  if (loading)
    return (
      <Box sx={homepageStyles.container}>
        <LinearProgress />
      </Box>
    );
  if (error) return <p>Error loading calendar</p>;

  return (
    <Box sx={calendarStyles.container}>
      <Typography variant="h2" fontFamily={"Work Sans"} fontWeight={600}>
        Events Calendar
      </Typography>
      <Box>
        {filteredAndSortedEvents.map((eventData: any) => (
          <SigningEvent props={eventData} key={eventData.id} />
        ))}
      </Box>
    </Box>
  );
};

export default Calendar;
