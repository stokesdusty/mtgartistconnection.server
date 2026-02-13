import { useEffect, useMemo, useState } from "react";
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
  SelectChangeEvent,
  Fab,
  Button
} from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";
import { GET_SIGNINGEVENTS, GET_ARTISTSBYEVENTID } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import SigningEvent from "./SigningEvent";
import { contentPageStyles } from "../../styles/content-page-styles";
import { useApolloClient } from "@apollo/client";

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

const Calendar = () => {
  document.title = "MtG Artist Connection - Events Calendar";

  const client = useApolloClient();
  const { data, error, loading } = useQuery(GET_SIGNINGEVENTS);
  const [locationFilter, setLocationFilter] = useState("");
  const [artistFilter, setArtistFilter] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [eventArtistsMap, setEventArtistsMap] = useState<{ [eventId: string]: string[] }>({});

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch artists for all upcoming events
  useEffect(() => {
    const fetchArtistsForEvents = async () => {
      if (!data?.signingEvent) return;

      const today = new Date();
      const upcomingEvents = data.signingEvent.filter((event: any) => {
        const endDate = new Date(event.endDate);
        return endDate >= today;
      });

      const artistsMap: { [eventId: string]: string[] } = {};

      await Promise.all(
        upcomingEvents.map(async (event: any) => {
          try {
            const result = await client.query({
              query: GET_ARTISTSBYEVENTID,
              variables: { eventId: event.id },
            });
            if (result.data?.mapArtistToEventByEventId) {
              artistsMap[event.id] = result.data.mapArtistToEventByEventId.map(
                (a: any) => a.artistName
              );
            }
          } catch (err) {
            // Silently handle errors for individual event artist fetches
          }
        })
      );

      setEventArtistsMap(artistsMap);
    };

    fetchArtistsForEvents();
  }, [data, client]);

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

    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter((eventData: any) => {
        if (!eventData.city) return false;

        const parts = eventData.city.split(',').map((s: string) => s.trim());

        if (parts.length === 2) {
          const stateCode = parts[1].toUpperCase();

          // Check if this is a US state and matches the filter
          if (stateCodeToName[stateCode]) {
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
  }, [data, locationFilter, artistFilter, eventArtistsMap]);

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

          <Box sx={{ marginBottom: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                {locations.US.length > 0 && (
                  <MenuItem disabled value="us-header">
                    <em>US States</em>
                  </MenuItem>
                )}
                {locations.US.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
                {locations.Other.length > 0 && (
                  <MenuItem disabled value="other-header">
                    <em>Other Locations</em>
                  </MenuItem>
                )}
                {locations.Other.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
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
                  <em>All Artists</em>
                </MenuItem>
                {uniqueArtists.map((artist) => (
                  <MenuItem key={artist} value={artist}>
                    {artist}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(locationFilter || artistFilter) && (
              <Button
                onClick={handleClearFilters}
                variant="outlined"
                sx={{
                  borderColor: '#2d4a36',
                  color: '#2d4a36',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: '#1e3425',
                    backgroundColor: 'rgba(45, 74, 54, 0.04)',
                  },
                }}
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
                {locationFilter || artistFilter
                  ? `No upcoming events${artistFilter ? ` with ${artistFilter}` : ''}${locationFilter ? ` in ${locationFilter}` : ''}. Try different filters or clear them.`
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
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: '#2d4a36',
            '&:hover': { bgcolor: '#1e3425' },
            zIndex: 999,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}
    </Box>
  );
};

export default Calendar;