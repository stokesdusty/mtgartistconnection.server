import { useMemo, useState } from "react";
import {
  Box,
  Container,
  LinearProgress,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from "@mui/material";
import { GET_SIGNINGEVENTS } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import SigningEvent from "./SigningEvent";
import { contentPageStyles } from "../../styles/content-page-styles";

const Calendar = () => {
  document.title = "MtG Artist Connection - Events Calendar";

  const { data, error, loading } = useQuery(GET_SIGNINGEVENTS);
  const [locationFilter, setLocationFilter] = useState("");

  const handleLocationChange = (event: SelectChangeEvent) => {
    setLocationFilter(event.target.value);
  };

  const locations = useMemo(() => {
    if (!data?.signingEvent) return [];

    const locationSet = new Set<string>();
    data.signingEvent.forEach((event: any) => {
      if (event.city) {
        locationSet.add(event.city);
      }
    });

    return Array.from(locationSet).sort();
  }, [data]);

  const filteredAndSortedEvents = useMemo(() => {
    if (!data?.signingEvent) {
      return [];
    }

    const today = new Date();
    let filtered = data.signingEvent.filter((eventData: any) => {
      const endDate = new Date(eventData.endDate);
      return endDate >= today;
    });

    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter((eventData: any) => {
        return eventData.city === locationFilter;
      });
    }

    return filtered.sort(
      (a: any, b: any) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [data, locationFilter]);

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

          <Box sx={{ marginBottom: 3 }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel id="location-select-label">Filter by Location</InputLabel>
              <Select
                labelId="location-select-label"
                id="location-select"
                value={locationFilter}
                label="Filter by Location"
                onChange={handleLocationChange}
                sx={{
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#eeeeee',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2d4a36',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2d4a36',
                  },
                }}
              >
                <MenuItem value="">
                  <em>All Locations</em>
                </MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={contentPageStyles.eventsContainer}>
            {filteredAndSortedEvents.length > 0 ? (
              filteredAndSortedEvents.map((eventData: any) => (
                <SigningEvent props={eventData} key={eventData.id} />
              ))
            ) : (
              <Typography sx={contentPageStyles.noEventsMessage}>
                {locationFilter
                  ? `No upcoming events in ${locationFilter}. Try a different location or clear the filter.`
                  : 'No upcoming events scheduled at this time. Check back soon!'}
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Calendar;