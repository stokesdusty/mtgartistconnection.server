import {
  Box,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Chip,
  ListSubheader,
} from "@mui/material";
import { ArtistGridSkeleton } from "../shared/Skeletons";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { useQuery } from "@apollo/client";
import { GET_ARTISTS_FOR_HOMEPAGE, GET_SIGNINGEVENTS, GET_ARTISTS_BY_EVENT_IDS } from "../graphql/queries";
import ArtistGridItem from "./ArtistGridItem";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { SelectChangeEvent } from '@mui/material/Select';
import { homepageStyles } from "../../styles/homepage-styles";
import { colors } from "../../styles/design-tokens";
import { useNavigate, useSearchParams } from "react-router-dom";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Fab from "@mui/material/Fab";
import Fade from "@mui/material/Fade";

interface Artist {
  name: string;
  alternate_names?: string;
  filename: string;
  location?: string;
  doesSigning?: boolean;
  markssignatureservice?: string;
  mountainmage?: string;
  artistProofs?: string;
}

const INTRO_SEEN_KEY = 'mtgac-intro-seen';

const Homepage = () => {
  usePageTitle();
  const { data, error, loading } = useQuery(GET_ARTISTS_FOR_HOMEPAGE);
  const { data: eventsData } = useQuery(GET_SIGNINGEVENTS);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showIntro] = useState(() => {
    const seen = localStorage.getItem(INTRO_SEEN_KEY) === 'true';
    if (!seen) {
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
    }
    return !seen;
  });
  const navigate = useNavigate();

  // Read filter state from URL params
  const userSearch = searchParams.get('search') || '';
  const locationFilter = searchParams.get('location') || '';
  const mountainMageFilter = searchParams.get('mountainMage') === 'true';
  const marksSigServiceFilter = searchParams.get('marksSig') === 'true';
  const hasUpcomingEventFilter = searchParams.get('hasEvent') === 'true';
  const sellsApsFilter = searchParams.get('sellsAps') === 'true';
  const letterFilter = searchParams.get('letter') || '';

  // Helper to update URL params
  const updateSearchParams = (key: string, value: string | boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    setSearchParams(newParams, { replace: true });
  };

  // Get upcoming event IDs
  const upcomingEventIds = useMemo(() => {
    if (!eventsData?.signingEvent) return [];

    const today = new Date();
    return eventsData.signingEvent
      .filter((event: any) => new Date(event.endDate) >= today)
      .map((event: any) => event.id);
  }, [eventsData]);

  // Single batched query to fetch all artists for upcoming events
  const { data: eventArtistsData } = useQuery(GET_ARTISTS_BY_EVENT_IDS, {
    variables: { eventIds: upcomingEventIds },
    skip: upcomingEventIds.length === 0,
  });

  // Build set of artists with upcoming events from batched query result
  const artistsWithEvents = useMemo(() => {
    if (!eventArtistsData?.artistsByEventIds) return new Set<string>();
    return new Set(eventArtistsData.artistsByEventIds.map((a: any) => a.artistName));
  }, [eventArtistsData]);

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
    const newParams = new URLSearchParams(searchParams);
    if (event.target.value) {
      newParams.set('search', event.target.value);
    } else {
      newParams.delete('search');
    }
    // Clear letter filter when searching
    if (letterFilter) {
      newParams.delete('letter');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleLocationChange = (event: SelectChangeEvent) => {
    updateSearchParams('location', event.target.value);
  };

  const handleMountainMageChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSearchParams('mountainMage', event.target.checked);
  };

  const handleMarksSigServiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSearchParams('marksSig', event.target.checked);
  };

  const handleHasUpcomingEventChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSearchParams('hasEvent', event.target.checked);
  };

  const handleSellsApsChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSearchParams('sellsAps', event.target.checked);
  };

  const handleLetterFilter = (letter: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (letterFilter === letter) {
      newParams.delete('letter');
    } else {
      newParams.set('letter', letter);
    }
    // Clear search when filtering by letter
    newParams.delete('search');
    setSearchParams(newParams, { replace: true });
  };

  const handleRandomArtist = () => {
    if (data?.artists && data.artists.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.artists.length);
      const randomArtist = data.artists[randomIndex];
      navigate(`/artist/${randomArtist.name}`);
    }
  };

  // Check if any filter is active
  const hasActiveFilters = userSearch.length >= 2 || locationFilter || mountainMageFilter ||
    marksSigServiceFilter || hasUpcomingEventFilter || sellsApsFilter || letterFilter;

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Build array of active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onDelete: () => void }[] = [];

    if (userSearch.length >= 2) {
      chips.push({
        key: 'search',
        label: `Search: "${userSearch}"`,
        onDelete: () => updateSearchParams('search', ''),
      });
    }
    if (locationFilter) {
      const locationLabel = locationFilter === 'US' ? 'Anywhere in the US' : locationFilter.split(',')[0];
      chips.push({
        key: 'location',
        label: `Location: ${locationLabel}`,
        onDelete: () => updateSearchParams('location', ''),
      });
    }
    if (letterFilter) {
      chips.push({
        key: 'letter',
        label: `Letter: ${letterFilter}`,
        onDelete: () => updateSearchParams('letter', ''),
      });
    }
    if (marksSigServiceFilter) {
      chips.push({
        key: 'marksSig',
        label: 'Marks Signature Service',
        onDelete: () => updateSearchParams('marksSig', false),
      });
    }
    if (mountainMageFilter) {
      chips.push({
        key: 'mountainMage',
        label: 'Mountain Mage',
        onDelete: () => updateSearchParams('mountainMage', false),
      });
    }
    if (hasUpcomingEventFilter) {
      chips.push({
        key: 'hasEvent',
        label: 'Has Upcoming Event',
        onDelete: () => updateSearchParams('hasEvent', false),
      });
    }
    if (sellsApsFilter) {
      chips.push({
        key: 'sellsAps',
        label: 'Sells APs',
        onDelete: () => updateSearchParams('sellsAps', false),
      });
    }

    return chips;
  }, [userSearch, locationFilter, letterFilter, marksSigServiceFilter, mountainMageFilter, hasUpcomingEventFilter, sellsApsFilter]);

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

    // Sells APs on Website Filter
    if (sellsApsFilter) {
      filteredArtists = filteredArtists.filter(
        (artist: Artist) => artist.artistProofs === "yes" || artist.artistProofs === "true"
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
        const artistInfo = `${artist.name}${artist.alternate_names || ""}${artist.filename}${
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
    sellsApsFilter,
    artistsWithEvents,
    letterFilter,
  ]);

  if (loading)
    return (
      <Box sx={homepageStyles.container}>
        <Box sx={homepageStyles.wrapper}>
          <Box sx={homepageStyles.headerSection}>
            <Box component="span" sx={homepageStyles.count}>
              Loading artists...
            </Box>
          </Box>
          <Box sx={homepageStyles.artistsGrid}>
            <ArtistGridSkeleton count={10} />
          </Box>
        </Box>
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
      <Box sx={homepageStyles.wrapper}>
        <Box sx={homepageStyles.headerSection}>
          {showIntro && (
            <>
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
            </>
          )}

          <Box component="span" sx={homepageStyles.count}>
            Proudly indexing {data.artists.length} artists and counting
          </Box>
        </Box>

        <Box sx={{ ...homepageStyles.filtersSection, py: 1.5 }}>
          <Box sx={{ ...homepageStyles.filtersGrid, gap: 2 }}>
            <Box sx={homepageStyles.searchContainer}>
              <TextField
                size="small"
                sx={{ ...homepageStyles.textField, '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
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
                size="small"
                variant="contained"
                onClick={handleRandomArtist}
                startIcon={<ShuffleIcon />}
                sx={{ ...homepageStyles.randomButton, fontSize: '0.8125rem' }}
              >
                Random Artist
              </Button>
            </Box>

            <FormControl size="small" sx={{ ...homepageStyles.locationSelect, '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
              <InputLabel id="location-select-label">Filter by Location</InputLabel>
              <Select
                labelId="location-select-label"
                id="location-select"
                value={locationFilter}
                label="Filter by Location"
                onChange={handleLocationChange}
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value="">All Locations</MenuItem>
                {locations.US.length > 0 && [
                  <ListSubheader key="us-header" sx={homepageStyles.listSubheader}>
                    US States
                  </ListSubheader>,
                  <MenuItem key="us-all" value="US" sx={{ pl: 3 }}>
                    Anywhere in the US
                  </MenuItem>,
                  ...locations.US.map((location) => (
                    <MenuItem key={location} value={location} sx={{ pl: 3 }}>
                      {location.split(',')[0]}
                    </MenuItem>
                  ))
                ]}
                {locations.Other.length > 0 && [
                  <ListSubheader key="other-header" sx={homepageStyles.listSubheader}>
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

            <Box sx={homepageStyles.checkboxContainer}>
              <Typography sx={{ ...homepageStyles.signingAgentLabel, fontSize: '0.875rem', mb: 0.5 }}>Filters</Typography>
              <FormGroup sx={{ ...homepageStyles.checkboxesContainer, gap: 0 }}>
                <FormControlLabel
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' }, my: -0.25 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={marksSigServiceFilter}
                      onChange={handleMarksSigServiceChange}
                      name="marksSigService"
                      sx={{ ...homepageStyles.checkbox, p: 0.5 }}
                    />
                  }
                  label="Marks Signature Service"
                />
                <FormControlLabel
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' }, my: -0.25 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={mountainMageFilter}
                      onChange={handleMountainMageChange}
                      name="mountainMage"
                      sx={{ ...homepageStyles.checkbox, p: 0.5 }}
                    />
                  }
                  label="Mountain Mage Signing Service"
                />
                <FormControlLabel
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' }, my: -0.25 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={hasUpcomingEventFilter}
                      onChange={handleHasUpcomingEventChange}
                      name="hasUpcomingEvent"
                      sx={{ ...homepageStyles.checkbox, p: 0.5 }}
                    />
                  }
                  label="Has Upcoming Event"
                />
                <FormControlLabel
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' }, my: -0.25 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={sellsApsFilter}
                      onChange={handleSellsApsChange}
                      name="sellsAps"
                      sx={{ ...homepageStyles.checkbox, p: 0.5 }}
                    />
                  }
                  label="Sells APs on Website"
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

        {/* Filter Summary Strip */}
        <Box sx={{ ...homepageStyles.filterStrip as object, backgroundColor: hasActiveFilters ? colors.neutral[100] : 'transparent' }}>
          <Typography sx={homepageStyles.filterStripCount}>
            {hasActiveFilters
              ? `Showing ${filteredData.length} of ${data.artists.length} artists`
              : `${data.artists.length} artists`
            }
          </Typography>

          {activeFilterChips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              size="small"
              onDelete={chip.onDelete}
              sx={chip.key === 'hasEvent' ? homepageStyles.filterChipAmber : homepageStyles.filterChip}
            />
          ))}

          {hasActiveFilters && activeFilterChips.length > 1 && (
            <Button
              size="small"
              startIcon={<ClearAllIcon />}
              onClick={handleClearAllFilters}
              sx={homepageStyles.clearAllButton}
            >
              Clear all
            </Button>
          )}
        </Box>

        <Box sx={homepageStyles.artistsGrid}>
          {filteredData.length > 0 ? (
            filteredData.map((artist: Artist, index: number) => (
              <ArtistGridItem artistData={artist} key={artist.name} eager={index < 8} hasEvent={artistsWithEvents.has(artist.name)} />
            ))
          ) : (userSearch.length >= 2 ||
            locationFilter !== "" ||
            mountainMageFilter ||
            marksSigServiceFilter ||
            hasUpcomingEventFilter ||
            sellsApsFilter) && filteredData.length === 0 ? (
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
