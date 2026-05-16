import { useEffect, useMemo, useState } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  Box,
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Fab,
  Button,
  ListSubheader,
  Chip
} from "@mui/material";
import { EventCardSkeleton } from "../shared/Skeletons";
import { ArrowUp } from "@phosphor-icons/react";
import { GET_SIGNINGEVENTS, GET_ARTISTS_BY_EVENT_IDS } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import SigningEvent from "./SigningEvent";
import { contentPageStyles } from "../../styles/content-page-styles";
import { calendarStyles } from "../../styles/calendar-styles";

// Map of state codes to full state names
const stateCodeToName: { [key: string]: string } = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire',
  'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina',
  'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania',
  'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee',
  'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington',
  'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

type DateRangeFilter = 'all' | 'this-week' | 'this-month' | 'next-3-months';

const Calendar = () => {
  usePageTitle("Events Calendar");

  const { data, error, loading } = useQuery(GET_SIGNINGEVENTS);
  const [locationFilter, setLocationFilter] = useState("");
  const [artistFilter, setArtistFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('all');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get upcoming event IDs for batched query
  const upcomingEventIds = useMemo(() => {
    if (!data?.signingEvent) return [];
    const today = new Date();
    return data.signingEvent
      .filter((event: any) => new Date(event.endDate) >= today)
      .map((event: any) => event.id);
  }, [data]);

  // Single batched query to fetch all artists for upcoming events
  const { data: eventArtistsData } = useQuery(GET_ARTISTS_BY_EVENT_IDS, {
    variables: { eventIds: upcomingEventIds },
    skip: upcomingEventIds.length === 0,
  });

  // Build map of eventId -> artist names from batched query result
  const eventArtistsMap = useMemo(() => {
    if (!eventArtistsData?.artistsByEventIds) return {};
    const map: { [eventId: string]: string[] } = {};
    eventArtistsData.artistsByEventIds.forEach((a: any) => {
      if (!map[a.eventId]) {
        map[a.eventId] = [];
      }
      map[a.eventId].push(a.artistName);
    });
    return map;
  }, [eventArtistsData]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLocationChange = (event: SelectChangeEvent) => {
    setLocationFilter(event.target.value);
  };

  const handleArtistChange = (event: SelectChangeEvent) => {
    setArtistFilter(event.target.value);
  };

  const handleClearFilters = () => {
    setLocationFilter("");
    setArtistFilter("");
    setDateRangeFilter('all');
  };

  const handleDateRangeChange = (range: DateRangeFilter) => {
    setDateRangeFilter(range);
  };

  // Calculate date range boundaries
  const getDateRangeBounds = (range: DateRangeFilter): { start: Date; end: Date | null } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
      case 'this-week': {
        const endOfWeek = new Date(today);
        const daysUntilSunday = 7 - today.getDay();
        endOfWeek.setDate(today.getDate() + daysUntilSunday);
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: today, end: endOfWeek };
      }
      case 'this-month': {
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return { start: today, end: endOfMonth };
      }
      case 'next-3-months': {
        const threeMonthsOut = new Date(today);
        threeMonthsOut.setMonth(today.getMonth() + 3);
        threeMonthsOut.setHours(23, 59, 59, 999);
        return { start: today, end: threeMonthsOut };
      }
      case 'all':
      default:
        return { start: today, end: null };
    }
  };

  // Get unique artists from all upcoming events
  const uniqueArtists = useMemo(() => {
    const allArtists = new Set<string>();
    Object.values(eventArtistsMap).forEach((artists) => {
      artists.forEach((artist) => allArtists.add(artist));
    });
    return Array.from(allArtists).sort();
  }, [eventArtistsMap]);

  const locations = useMemo(() => {
    if (!data?.signingEvent) return { US: [], Other: [] };

    const today = new Date();
    const upcomingEvents = data.signingEvent.filter((event: any) => {
      const endDate = new Date(event.endDate);
      return endDate >= today;
    });

    const usLocations = new Set<string>();
    const otherLocations = new Set<string>();

    upcomingEvents.forEach((event: any) => {
      if (event.city) {
        // Check if it's a US location (format: "City, StateCode")
        const parts = event.city.split(',').map((s: string) => s.trim());

        if (parts.length === 2) {
          const stateCode = parts[1].toUpperCase();

          // Check if this is a US state code
          if (stateCodeToName[stateCode]) {
            usLocations.add(stateCodeToName[stateCode]); // Add full state name
          } else {
            otherLocations.add(event.city); // International location
          }
        } else {
          otherLocations.add(event.city);
        }
      }
    });

    return {
      US: Array.from(usLocations).sort(),
      Other: Array.from(otherLocations).sort()
    };
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

    // Apply date range filter
    if (dateRangeFilter !== 'all') {
      const { start, end } = getDateRangeBounds(dateRangeFilter);
      filtered = filtered.filter((eventData: any) => {
        const startDate = new Date(eventData.startDate);
        // Event starts within the range OR event is ongoing (started before, ends after)
        const endDate = new Date(eventData.endDate);
        return (startDate >= start && (!end || startDate <= end)) ||
               (startDate <= start && endDate >= start);
      });
    }

    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter((eventData: any) => {
        if (!eventData.city) return false;

        const parts = eventData.city.split(',').map((s: string) => s.trim());

        if (parts.length === 2) {
          const stateCode = parts[1].toUpperCase();

          // Check if this is a US state
          if (stateCodeToName[stateCode]) {
            // "US" means any US state
            if (locationFilter === 'US') {
              return true;
            }
            return stateCodeToName[stateCode] === locationFilter;
          }
        }

        // International location - match by full city string
        return eventData.city === locationFilter;
      });
    }

    // Apply artist filter
    if (artistFilter) {
      filtered = filtered.filter((eventData: any) => {
        const eventArtists = eventArtistsMap[eventData.id] || [];
        return eventArtists.includes(artistFilter);
      });
    }

    return filtered.sort(
      (a: any, b: any) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [data, locationFilter, artistFilter, dateRangeFilter, eventArtistsMap]);

  if (loading)
    return (
      <Box sx={contentPageStyles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={contentPageStyles.wrapper}>
            <Typography variant="h1" sx={contentPageStyles.pageTitle}>
              Events Calendar
            </Typography>
            <Box sx={contentPageStyles.eventsContainer}>
              <EventCardSkeleton count={5} />
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

          {/* Date range filter row */}
          <Box
            sx={{
              marginBottom: 2,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.5, sm: 1 },
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            {/* Chip group */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-start' },
              }}
            >
              {[
                { value: 'this-week' as DateRangeFilter, label: 'This week' },
                { value: 'this-month' as DateRangeFilter, label: 'This month' },
                { value: 'next-3-months' as DateRangeFilter, label: 'Next 3 months' },
                { value: 'all' as DateRangeFilter, label: 'All upcoming' },
              ].map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  onClick={() => handleDateRangeChange(option.value)}
                  variant={dateRangeFilter === option.value ? 'filled' : 'outlined'}
                  sx={dateRangeFilter === option.value ? calendarStyles.dateChipActive : calendarStyles.dateChipInactive}
                />
              ))}
            </Box>

            {/* Event count badge */}
            <Box
              component="span"
              sx={calendarStyles.eventCountBadge}
            >
              {filteredAndSortedEvents.length === upcomingEventIds.length
                ? `${upcomingEventIds.length} events`
                : `Showing ${filteredAndSortedEvents.length} of ${upcomingEventIds.length}`}
            </Box>
          </Box>

          <Box sx={{ marginBottom: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel id="location-select-label">Filter by Location</InputLabel>
              <Select
                labelId="location-select-label"
                id="location-select"
                value={locationFilter}
                label="Filter by Location"
                onChange={handleLocationChange}
                sx={calendarStyles.filterSelect}
              >
                <MenuItem value="">
                  <em>All Locations</em>
                </MenuItem>
                {locations.US.length > 0 && [
                  <ListSubheader key="us-header" sx={calendarStyles.listSubheader}>
                    US States
                  </ListSubheader>,
                  <MenuItem key="us-all" value="US" sx={{ pl: 3 }}>
                    Anywhere in the US
                  </MenuItem>,
                  ...locations.US.map((location) => (
                    <MenuItem key={location} value={location} sx={{ pl: 3 }}>
                      {location}
                    </MenuItem>
                  ))
                ]}
                {locations.Other.length > 0 && [
                  <ListSubheader key="other-header" sx={calendarStyles.listSubheader}>
                    Other Locations
                  </ListSubheader>,
                  ...locations.Other.map((location) => (
                    <MenuItem key={location} value={location} sx={{ pl: 3 }}>
                      {location}
                    </MenuItem>
                  ))
                ]}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel id="artist-select-label">Filter by Artist</InputLabel>
              <Select
                labelId="artist-select-label"
                id="artist-select"
                value={artistFilter}
                label="Filter by Artist"
                onChange={handleArtistChange}
                sx={calendarStyles.filterSelect}
              >
                <MenuItem value="">
                  <em>All Artists</em>
                </MenuItem>
                {uniqueArtists.map((artist) => (
                  <MenuItem key={artist} value={artist}>
                    {artist}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(locationFilter || artistFilter || dateRangeFilter !== 'all') && (
              <Button
                onClick={handleClearFilters}
                variant="outlined"
                sx={calendarStyles.clearFiltersButton}
              >
                Clear Filters
              </Button>
            )}
          </Box>

          <Box sx={contentPageStyles.eventsContainer}>
            {filteredAndSortedEvents.length > 0 ? (
              filteredAndSortedEvents.map((eventData: any) => (
                <SigningEvent key={eventData.id} props={eventData} />
              ))
            ) : (
              <Typography sx={contentPageStyles.noEventsMessage}>
                {locationFilter || artistFilter || dateRangeFilter !== 'all'
                  ? `No upcoming events${dateRangeFilter !== 'all' ? ` ${dateRangeFilter.replace('-', ' ')}` : ''}${artistFilter ? ` with ${artistFilter}` : ''}${locationFilter ? ` in ${locationFilter}` : ''}. Try different filters or clear them.`
                  : 'No upcoming events scheduled at this time. Check back soon!'}
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>

      {showScrollTop && (
        <Fab
          color="primary"
          onClick={scrollToTop}
          size="medium"
          sx={calendarStyles.scrollToTopFab}
        >
          <ArrowUp size={24} />
        </Fab>
      )}
    </Box>
  );
};

export default Calendar;