import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_ARTISTS_FOR_HOMEPAGE, GET_SIGNINGEVENTS, GET_ARTISTSBYEVENTID } from "../graphql/queries";
import ArtistGridItem from "./ArtistGridItem";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { SelectChangeEvent } from '@mui/material/Select';
import { homepageStyles } from "../../styles/homepage-styles";
import { useNavigate } from "react-router-dom";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Fab from "@mui/material/Fab";
import Fade from "@mui/material/Fade";

interface Artist {
  name: string;
  filename: string;
  location?: string;
  doesSigning?: boolean;
  markssignatureservice?: string;
  mountainmage?: string;
}

// Component to fetch artists for a single event
const EventArtistsFetcher = ({ eventId, onArtistsFetched }: { eventId: string; onArtistsFetched: (eventId: string, artists: string[]) => void }) => {
  const { data } = useQuery(GET_ARTISTSBYEVENTID, {
    variables: { eventId }
  });

  React.useEffect(() => {
    if (data?.mapArtistToEventByEventId) {
      const artistNames = data.mapArtistToEventByEventId.map((a: any) => a.artistName);
      onArtistsFetched(eventId, artistNames);
    }
  }, [data, eventId, onArtistsFetched]);

  return null;
};

const Homepage = () => {
  document.title = "MtG Artist Connection";
  const { data, error, loading } = useQuery(GET_ARTISTS_FOR_HOMEPAGE);
  const { data: eventsData } = useQuery(GET_SIGNINGEVENTS);
  const [userSearch, setUserSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [mountainMageFilter, setMountainMageFilter] = useState(false);
  const [marksSigServiceFilter, setMarksSigServiceFilter] = useState(false);
  const [hasUpcomingEventFilter, setHasUpcomingEventFilter] = useState(false);
  const [artistsWithEvents, setArtistsWithEvents] = useState<Set<string>>(new Set());
  const [letterFilter, setLetterFilter] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  // Get upcoming events
  const upcomingEvents = useMemo(() => {
    if (!eventsData?.signingEvent) return [];

    const today = new Date();
    return eventsData.signingEvent.filter((event: any) => {
      const endDate = new Date(event.endDate);
      return endDate >= today;
    });
  }, [eventsData]);

  // Callback to collect artists from events
  const handleArtistsFetched = React.useCallback((eventId: string, artists: string[]) => {
    setArtistsWithEvents(prev => {
      const newSet = new Set(prev);
      artists.forEach(artist => newSet.add(artist));
      return newSet;
    });
  }, []);

  // Preload all artist images in the background so letter filtering is instant
  useEffect(() => {
    if (!data?.artists) return;

    let cancelled = false;
    const batchSize = 10;
    const artists = data.artists;
    let index = 0;

    const preloadBatch = () => {
      if (cancelled) return;
      const end = Math.min(index + batchSize, artists.length);
      for (let i = index; i < end; i++) {
        const img = new Image();
        img.src = `https://mtgartistconnection.s3.us-west-1.amazonaws.com/grid/${artists[i].filename}.jpg`;
      }
      index = end;
      if (index < artists.length) {
        requestIdleCallback ? requestIdleCallback(preloadBatch) : setTimeout(preloadBatch, 100);
      }
    };

    // Delay slightly so initial render isn't competing for bandwidth
    const timer = setTimeout(preloadBatch, 2000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [data]);

  // Show scroll-to-top button when user scrolls below the fold
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserSearch(event.target.value);
  };

  const handleLocationChange = (event: SelectChangeEvent) => {
    setLocationFilter(event.target.value);
  };

  const handleMountainMageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMountainMageFilter(event.target.checked);
  };

  const handleMarksSigServiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMarksSigServiceFilter(event.target.checked);
  };

  const handleHasUpcomingEventChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHasUpcomingEventFilter(event.target.checked);
  };

  const handleLetterFilter = (letter: string) => {
    setLetterFilter(prev => prev === letter ? "" : letter);
  };

  const handleRandomArtist = () => {
    if (data?.artists && data.artists.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.artists.length);
      const randomArtist = data.artists[randomIndex];
      navigate(`/artist/${randomArtist.name}`);
    }
  };

  const locations = useMemo(() => {
      if (!data?.artists) return { US: [], Other: [] };

    const usStates = [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
      "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
      "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
      "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
      "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
      "New Hampshire", "New Jersey", "New Mexico", "New York",
      "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
      "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
      "West Virginia", "Wisconsin", "Wyoming"
    ];

    const usLocations: string[] = [];
    const otherLocations: string[] = [];

    data.artists.forEach((artist: Artist) => {
      if (artist.location) {
        if (artist.location.endsWith(', US') && usStates.includes(artist.location.split(',')[0])) {
            usLocations.push(artist.location);
        } else {
          otherLocations.push(artist.location);
        }
      }
    });

    const uniqueUsLocations = Array.from(new Set(usLocations)).sort();
    const uniqueOtherLocations = Array.from(new Set(otherLocations)).sort();

    return {
      US: uniqueUsLocations,
      Other: uniqueOtherLocations,
    };
  }, [data]);

    const filteredData = useMemo(() => {
    let filteredArtists = data?.artists || [];

    // Location Filter
    if (locationFilter) {
        filteredArtists = filteredArtists.filter((artist: Artist) => {
            if (locationFilter === 'US') {
                return artist.location?.endsWith(', US');
            } else {
                return artist.location === locationFilter;
            }
        });
    }

    // Mountain Mage Filter
    if (mountainMageFilter) {
      filteredArtists = filteredArtists.filter(
        (artist: Artist) => artist.mountainmage && artist.mountainmage !== "" && artist.mountainmage !== "false"
      );
    }

    // Marks Signature Service Filter
    if (marksSigServiceFilter) {
      filteredArtists = filteredArtists.filter(
        (artist: Artist) => artist.markssignatureservice === "true"
      );
    }

    // Has Upcoming Event Filter
    if (hasUpcomingEventFilter) {
      filteredArtists = filteredArtists.filter(
        (artist: Artist) => artistsWithEvents.has(artist.name)
      );
    }

    // Letter Filter
    if (letterFilter) {
      // Normalize to NFD so accented characters (é, ó, etc.) decompose to base letter + combining mark
      const getBaseChar = (name: string) => name.normalize('NFD').charAt(0).toUpperCase();

      if (letterFilter === 'Other') {
        filteredArtists = filteredArtists.filter((artist: Artist) =>
          !/^[a-zA-Z0-9]/.test(artist.name.normalize('NFD'))
        );
      } else if (letterFilter === '0-9') {
        filteredArtists = filteredArtists.filter((artist: Artist) =>
          /^[0-9]/.test(artist.name)
        );
      } else {
        filteredArtists = filteredArtists.filter((artist: Artist) =>
          getBaseChar(artist.name) === letterFilter
        );
      }
    }

    // Search Filter
    if (userSearch.length >= 2) {
      const searchTerm = userSearch.toLowerCase().replace(/\s/g, "");
      filteredArtists = filteredArtists.filter((artist: Artist) => {
        const artistInfo = `${artist.name}${artist.filename}${
          artist.location || ""
        }`
          .toLowerCase()
          .replace(/\s/g, "");
        return artistInfo.includes(searchTerm);
      });
    }

    return filteredArtists;
  }, [
    userSearch,
    data,
    locationFilter,
    mountainMageFilter,
    marksSigServiceFilter,
    hasUpcomingEventFilter,
    artistsWithEvents,
    letterFilter,
  ]);

  if (loading)
    return (
      <Box sx={homepageStyles.loadingContainer}>
        <CircularProgress size={60} sx={homepageStyles.loadingSpinner} />
      </Box>
    );

  if (error)
    return (
      <Box sx={homepageStyles.container}>
        <Box sx={homepageStyles.wrapper}>
          <Typography variant="h5" sx={homepageStyles.errorMessage}>
            Error loading artists. Please try again later.
          </Typography>
        </Box>
      </Box>
    );

  if (!data?.artists)
    return (
      <Box sx={homepageStyles.container}>
        <Box sx={homepageStyles.wrapper}>
          <Typography variant="h5" sx={homepageStyles.noResults}>
            No artists found
          </Typography>
        </Box>
      </Box>
    );

  return (
    <Box sx={homepageStyles.container}>
      {/* Fetch artists for all upcoming events */}
      {upcomingEvents.map((event: any) => (
        <EventArtistsFetcher
          key={event.id}
          eventId={event.id}
          onArtistsFetched={handleArtistsFetched}
        />
      ))}

      <Box sx={homepageStyles.wrapper}>
        <Box sx={homepageStyles.headerSection}>
          <Typography variant="h1" sx={homepageStyles.headerText}>
            MTG Artist Connection
          </Typography>

          <Typography variant="h6" sx={homepageStyles.description}>
            Your go-to hub for discovering Magic: The Gathering artists
          </Typography>

          <Typography variant="body1" sx={homepageStyles.descriptionList}>
            <b>Artist Profiles</b> – Find official sites, social media pages, and portfolios for hundreds of MTG artists.
          </Typography>
          <Typography variant="body1" sx={homepageStyles.descriptionList}>
            <b>Where to Buy</b> – Easily locate artist stores for playmats, prints, tokens, and signed cards.
          </Typography>
          <Typography variant="body1" sx={homepageStyles.descriptionList}>
            <b>Upcoming Events</b> – See which conventions, signings, or streams your favorite artists will be attending.
          </Typography>

          <Box component="span" sx={homepageStyles.count}>
            {data.artists.length} artists and counting
          </Box>
        </Box>

        <Box sx={homepageStyles.filtersSection}>
          <Box sx={homepageStyles.filtersGrid}>
            <Box sx={homepageStyles.searchContainer}>
              <TextField
                sx={homepageStyles.textField}
                value={userSearch}
                placeholder="Search for an artist"
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleRandomArtist}
                startIcon={<ShuffleIcon />}
                sx={homepageStyles.randomButton}
              >
                Random Artist
              </Button>
            </Box>

            <FormControl sx={homepageStyles.locationSelect}>
              <InputLabel id="location-select-label">Filter by Location</InputLabel>
              <Select
                labelId="location-select-label"
                id="location-select"
                value={locationFilter}
                label="Filter by Location"
                onChange={handleLocationChange}
              >
                <MenuItem value="">All Locations</MenuItem>
                <MenuItem value="US">
                  <em>US States</em>
                </MenuItem>
                {locations.US.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location.split(',')[0]}
                  </MenuItem>
                ))}
                 <MenuItem value="Other" disabled>
                  <em>Other Locations</em>
                </MenuItem>
                {locations.Other.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={homepageStyles.checkboxContainer}>
              <Typography sx={homepageStyles.signingAgentLabel}>Filters</Typography>
              <FormGroup sx={homepageStyles.checkboxesContainer}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={marksSigServiceFilter}
                      onChange={handleMarksSigServiceChange}
                      name="marksSigService"
                      sx={homepageStyles.checkbox}
                    />
                  }
                  label="Marks Signature Service"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={mountainMageFilter}
                      onChange={handleMountainMageChange}
                      name="mountainMage"
                      sx={homepageStyles.checkbox}
                    />
                  }
                  label="Mountain Mage Signing Service"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasUpcomingEventFilter}
                      onChange={handleHasUpcomingEventChange}
                      name="hasUpcomingEvent"
                      sx={homepageStyles.checkbox}
                    />
                  }
                  label="Has Upcoming Event"
                />
              </FormGroup>
            </Box>
          </Box>
        </Box>

        <Box sx={homepageStyles.alphabetBar}>
          {['A','B','C','D','E','F','G','H','I','J','K','L','M',
            'N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0-9','Other'].map((letter) => (
            <Box
              key={letter}
              component="button"
              onClick={() => handleLetterFilter(letter)}
              sx={letterFilter === letter ? homepageStyles.alphabetLinkActive : homepageStyles.alphabetLink}
            >
              {letter}
            </Box>
          ))}
        </Box>

        <Box sx={homepageStyles.artistsGrid}>
          {filteredData.length > 0 ? (
            filteredData.map((artist: Artist) => (
              <ArtistGridItem artistData={artist} key={artist.name} />
            ))
          ) : (userSearch.length >= 2 ||
            locationFilter !== "" ||
            mountainMageFilter ||
            marksSigServiceFilter ||
            hasUpcomingEventFilter) && filteredData.length === 0 ? (
            <Typography sx={homepageStyles.noResults}>
              No artists found matching your search.
            </Typography>
          ) : null
        }
        </Box>
      </Box>

      <Fade in={showScrollTop}>
        <Fab
          size="medium"
          aria-label="scroll to top"
          onClick={scrollToTop}
          sx={homepageStyles.scrollToTop}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Fade>
    </Box>
  );
};

export default Homepage;
