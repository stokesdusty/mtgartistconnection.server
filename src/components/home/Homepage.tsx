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
import { Eraser, Funnel, MagnifyingGlass, Shuffle, ArrowUp } from "@phosphor-icons/react";
import { useQuery, NetworkStatus } from "@apollo/client";
import { GET_ARTISTS_PAGE, GET_ARTIST_FILTER_FLAGS, GET_SIGNINGEVENTS, GET_ARTISTS_BY_EVENT_IDS } from "../graphql/queries";
import ArtistGridItem from "./ArtistGridItem";
import DensityToggle, { GridDensity, getDensityPreference, saveDensityPreference } from "./DensityToggle";
import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";

import InputAdornment from "@mui/material/InputAdornment";
import { SelectChangeEvent } from '@mui/material/Select';
import EmptyState from "../shared/EmptyState";
import { homepageStyles } from "../../styles/homepage-styles";
import { themeColors } from "../../styles/design-tokens";
import { useNavigate, useSearchParams } from "react-router-dom";
import Fab from "@mui/material/Fab";
import Fade from "@mui/material/Fade";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

// Display record returned by artistsPage (filename needed to render the card image).
interface ArtistDisplay {
  name: string;
  filename: string;
}

// Filter-index record returned by artistFilterFlags.
interface ArtistFlag {
  name: string;
  flags: number;
  location?: string;
  alternate_names?: string;
}

// Merged shape passed to ArtistGridItem.
interface Artist {
  name: string;
  filename: string;
  location?: string;
  alternate_names?: string;
}

// Packed bitfield positions — must match the resolver.
const FLAG_MARKSSIG     = 1 << 0; // markssignatureservice === "true"
const FLAG_MOUNTAINMAGE = 1 << 1; // mountainmage truthy
const FLAG_ARTISTPROOFS = 1 << 2; // artistProofs === "yes"|"true"

const PAGE_SIZE = 60;

const INTRO_SEEN_KEY = 'mtgac-intro-seen';

const Homepage = () => {
  usePageTitle();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Page query — display fields only, paginated.
  const {
    data: pageData,
    error,
    loading: pageLoading,
    fetchMore,
    networkStatus,
  } = useQuery(GET_ARTISTS_PAGE, {
    variables: { offset: 0, limit: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  });

  // Filter-flags query — all artists, lightweight bitfield index.
  const { data: flagsData } = useQuery(GET_ARTIST_FILTER_FLAGS);

  const { data: eventsData } = useQuery(GET_SIGNINGEVENTS);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [density, setDensity] = useState<GridDensity>(getDensityPreference);
  const [showIntro] = useState(() => {
    const seen = localStorage.getItem(INTRO_SEEN_KEY) === 'true';
    if (!seen) {
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
    }
    return !seen;
  });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
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
  const updateSearchParams = useCallback((key: string, value: string | boolean) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === '' || value === false) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Pagination state derived from pageData.
  const loadedArtists: ArtistDisplay[] = pageData?.artistsPage?.artists ?? [];
  const totalArtists: number = pageData?.artistsPage?.total ?? 0;
  const hasMore = loadedArtists.length < totalArtists;
  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;

  // Map name → filename for joining with the flags index.
  const filenameMap = useMemo(() => {
    const m = new Map<string, string>();
    loadedArtists.forEach((a) => m.set(a.name, a.filename));
    return m;
  }, [loadedArtists]);

  // Full flags array — falls back to the loaded page data (flags=0) before flagsData arrives
  // so the UI is not blank while the second query is in-flight.
  const allFlags = useMemo<ArtistFlag[]>(() => {
    if (flagsData?.artistFilterFlags) return flagsData.artistFilterFlags;
    return loadedArtists.map((a) => ({ name: a.name, flags: 0 }));
  }, [flagsData, loadedArtists]);

  const loadMore = useCallback(() => {
    if (!hasMore || isFetchingMore) return;
    fetchMore({
      variables: { offset: loadedArtists.length, limit: PAGE_SIZE },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          artistsPage: {
            ...fetchMoreResult.artistsPage,
            artists: [...prev.artistsPage.artists, ...fetchMoreResult.artistsPage.artists],
          },
        };
      },
    });
  }, [hasMore, isFetchingMore, loadedArtists.length, fetchMore]);

  // Infinite scroll — fire loadMore when the sentinel enters the viewport.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '300px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  // Get upcoming event IDs
  const upcomingEventIds = useMemo(() => {
    if (!eventsData?.signingEvent) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
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
    if (allFlags.length > 0) {
      const randomArtist = allFlags[Math.floor(Math.random() * allFlags.length)];
      navigate(`/artist/${randomArtist.name}`);
    }
  };

  const handleDensityChange = (v: GridDensity) => {
    setDensity(v);
    saveDensityPreference(v);
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
  }, [userSearch, locationFilter, letterFilter, marksSigServiceFilter, mountainMageFilter, hasUpcomingEventFilter, sellsApsFilter, updateSearchParams]);

  const locations = useMemo(() => {
    if (!allFlags.length) return { US: [], Other: [] };

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

    allFlags.forEach((a) => {
      if (a.location) {
        if (a.location.endsWith(', US') && usStates.includes(a.location.split(',')[0])) {
          usLocations.push(a.location);
        } else {
          otherLocations.push(a.location);
        }
      }
    });

    return {
      US: Array.from(new Set(usLocations)).sort(),
      Other: Array.from(new Set(otherLocations)).sort(),
    };
  }, [allFlags]);

  // Filter the full flags index first — this runs over all artists regardless of what's loaded.
  const matchingFlags = useMemo<ArtistFlag[]>(() => {
    let filtered = allFlags;

    if (locationFilter) {
      filtered = filtered.filter((a) =>
        locationFilter === 'US' ? a.location?.endsWith(', US') : a.location === locationFilter
      );
    }
    if (mountainMageFilter) {
      filtered = filtered.filter((a) => (a.flags & FLAG_MOUNTAINMAGE) !== 0);
    }
    if (marksSigServiceFilter) {
      filtered = filtered.filter((a) => (a.flags & FLAG_MARKSSIG) !== 0);
    }
    if (hasUpcomingEventFilter) {
      filtered = filtered.filter((a) => artistsWithEvents.has(a.name));
    }
    if (sellsApsFilter) {
      filtered = filtered.filter((a) => (a.flags & FLAG_ARTISTPROOFS) !== 0);
    }
    if (letterFilter) {
      const getBase = (name: string) => name.normalize('NFD').charAt(0).toUpperCase();
      if (letterFilter === 'Other') {
        filtered = filtered.filter((a) => !/^[a-zA-Z0-9]/.test(a.name.normalize('NFD')));
      } else if (letterFilter === '0-9') {
        filtered = filtered.filter((a) => /^[0-9]/.test(a.name));
      } else {
        filtered = filtered.filter((a) => getBase(a.name) === letterFilter);
      }
    }
    if (userSearch.length >= 2) {
      const term = userSearch.toLowerCase().replace(/\s/g, '');
      filtered = filtered.filter((a) => {
        const hay = `${a.name}${a.alternate_names ?? ''}${a.location ?? ''}`.toLowerCase().replace(/\s/g, '');
        return hay.includes(term);
      });
    }

    return filtered;
  }, [allFlags, locationFilter, mountainMageFilter, marksSigServiceFilter,
      hasUpcomingEventFilter, sellsApsFilter, letterFilter, userSearch, artistsWithEvents]);

  // Join matching flags with loaded filenames to produce the display list.
  // Artists whose page hasn't been fetched yet are omitted; they appear as the user scrolls.
  const filteredData = useMemo<Artist[]>(() => {
    return matchingFlags
      .map((a) => ({ name: a.name, filename: filenameMap.get(a.name) ?? '', location: a.location, alternate_names: a.alternate_names }))
      .filter((a) => a.filename !== '');
  }, [matchingFlags, filenameMap]);

  if (pageLoading && !pageData)
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

  if (!pageData?.artistsPage)
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

              <Box component="span" sx={homepageStyles.count}>
                Proudly indexing {allFlags.length || totalArtists} artists and counting
              </Box>
            </>
          )}
        </Box>

        <Box sx={{ ...homepageStyles.filtersSection, py: 1.5, display: { xs: 'none', sm: 'block' } }}>
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
                      <MagnifyingGlass size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                size="small"
                variant="contained"
                onClick={handleRandomArtist}
                startIcon={<Shuffle size={20} />}
                sx={{ ...homepageStyles.randomButton, fontSize: '0.8125rem' }}
              >
                Random Artist
              </Button>
            </Box>

            <FormControl size="small" sx={{ ...homepageStyles.locationSelect, '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
              <InputLabel id="location-select-label" sx={{ color: themeColors.text.secondary, '&.Mui-focused': { color: themeColors.primary.main } }}>Filter by Location</InputLabel>
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

        {/* Mobile filter trigger — hidden on sm+ where the full filter panel shows */}
        <Box sx={homepageStyles.mobileFilterRow}>
          <Button
            variant={activeFilterChips.length > 0 ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilterSheetOpen(true)}
            startIcon={<Funnel size={16} weight={activeFilterChips.length > 0 ? 'fill' : 'regular'} />}
            sx={activeFilterChips.length > 0 ? homepageStyles.mobileFilterButtonActive : homepageStyles.mobileFilterButton}
          >
            {activeFilterChips.length > 0 ? `Filters (${activeFilterChips.length})` : 'Filters'}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleRandomArtist}
            startIcon={<Shuffle size={16} />}
            sx={{ ...homepageStyles.randomButton, flex: 1, fontSize: '0.8125rem', py: '5px' }}
          >
            Random
          </Button>
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
        <Box sx={{ ...homepageStyles.filterStrip as object, backgroundColor: hasActiveFilters ? themeColors.neutral[100] : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, flex: 1 }}>
            <Typography sx={homepageStyles.filterStripCount}>
              {hasActiveFilters
                ? `Showing ${filteredData.length} of ${matchingFlags.length} artists`
                : `${allFlags.length || totalArtists} artists`
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
                startIcon={<Eraser size={16} />}
                onClick={handleClearAllFilters}
                sx={homepageStyles.clearAllButton}
              >
                Clear all
              </Button>
            )}
          </Box>

          <DensityToggle value={density} onChange={handleDensityChange} />
        </Box>

        <Box sx={density === 'compact' ? homepageStyles.artistsGridCompact : density === 'gallery' ? homepageStyles.artistsGridGallery : homepageStyles.artistsGrid}>
          {filteredData.length > 0 ? (
            filteredData.map((artist: Artist, index: number) => (
              <ArtistGridItem artistData={artist} key={artist.name} eager={index < 8} hasEvent={artistsWithEvents.has(artist.name)} density={density} />
            ))
          ) : (userSearch.length >= 2 ||
            locationFilter !== "" ||
            mountainMageFilter ||
            marksSigServiceFilter ||
            hasUpcomingEventFilter ||
            sellsApsFilter) && filteredData.length === 0 ? (
            <EmptyState
              headline="No artists match your search"
              action={{ label: 'Clear search', onClick: handleClearAllFilters }}
              sx={{ gridColumn: '1 / -1' }}
            />
          ) : null
        }
        </Box>

        {/* Infinite-scroll sentinel — IntersectionObserver triggers the next page fetch. */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </Box>

      <SwipeableDrawer
        anchor="bottom"
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        onOpen={() => setFilterSheetOpen(true)}
        disableSwipeToOpen
        PaperProps={{ sx: homepageStyles.filterSheetPaper }}
      >
        <Box sx={{ overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
            <Box sx={homepageStyles.filterSheetHandle} />
          </Box>
          <Box sx={homepageStyles.filterSheetHeader}>
            <Typography sx={homepageStyles.filterSheetTitle}>Filters</Typography>
            {hasActiveFilters && (
              <Button
                size="small"
                startIcon={<Eraser size={14} />}
                onClick={handleClearAllFilters}
                sx={homepageStyles.clearAllButton}
              >
                Clear all
              </Button>
            )}
          </Box>
          <Box sx={homepageStyles.filterSheetContent}>
            <TextField
              size="small"
              sx={{ ...homepageStyles.textField, '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
              value={userSearch}
              placeholder="Search for an artist"
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MagnifyingGlass size={20} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ ...homepageStyles.locationSelect, '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
              <InputLabel id="location-select-label-sheet" sx={{ color: themeColors.text.secondary, '&.Mui-focused': { color: themeColors.primary.main } }}>Filter by Location</InputLabel>
              <Select
                labelId="location-select-label-sheet"
                id="location-select-sheet"
                value={locationFilter}
                label="Filter by Location"
                onChange={handleLocationChange}
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value="">All Locations</MenuItem>
                {locations.US.length > 0 && [
                  <ListSubheader key="us-header-s" sx={homepageStyles.listSubheader}>US States</ListSubheader>,
                  <MenuItem key="us-all-s" value="US" sx={{ pl: 3 }}>Anywhere in the US</MenuItem>,
                  ...locations.US.map((location) => (
                    <MenuItem key={`s-${location}`} value={location} sx={{ pl: 3 }}>{location.split(',')[0]}</MenuItem>
                  ))
                ]}
                {locations.Other.length > 0 && [
                  <ListSubheader key="other-header-s" sx={homepageStyles.listSubheader}>Other Locations</ListSubheader>,
                  ...locations.Other.map((location) => (
                    <MenuItem key={`s-${location}`} value={location} sx={{ pl: 3 }}>{location}</MenuItem>
                  ))
                ]}
              </Select>
            </FormControl>
            <Box sx={homepageStyles.checkboxContainer}>
              <Typography sx={{ ...homepageStyles.signingAgentLabel, fontSize: '0.875rem', mb: 0.5 }}>Options</Typography>
              <FormGroup sx={{ ...homepageStyles.checkboxesContainer, gap: 0 }}>
                <FormControlLabel
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' }, my: -0.25 }}
                  control={<Checkbox size="small" checked={marksSigServiceFilter} onChange={handleMarksSigServiceChange} name="marksSigService-s" sx={{ ...homepageStyles.checkbox, p: 0.5 }} />}
                  label="Marks Signature Service"
                />
                <FormControlLabel
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' }, my: -0.25 }}
                  control={<Checkbox size="small" checked={mountainMageFilter} onChange={handleMountainMageChange} name="mountainMage-s" sx={{ ...homepageStyles.checkbox, p: 0.5 }} />}
                  label="Mountain Mage Signing Service"
                />
                <FormControlLabel
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' }, my: -0.25 }}
                  control={<Checkbox size="small" checked={hasUpcomingEventFilter} onChange={handleHasUpcomingEventChange} name="hasUpcomingEvent-s" sx={{ ...homepageStyles.checkbox, p: 0.5 }} />}
                  label="Has Upcoming Event"
                />
                <FormControlLabel
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' }, my: -0.25 }}
                  control={<Checkbox size="small" checked={sellsApsFilter} onChange={handleSellsApsChange} name="sellsAps-s" sx={{ ...homepageStyles.checkbox, p: 0.5 }} />}
                  label="Sells APs on Website"
                />
              </FormGroup>
            </Box>
          </Box>
          <Box sx={homepageStyles.filterSheetActions}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setFilterSheetOpen(false)}
              sx={{ ...homepageStyles.randomButton, py: 1.25 }}
            >
              Done
            </Button>
          </Box>
        </Box>
      </SwipeableDrawer>

      <Fade in={showScrollTop}>
        <Fab
          size="medium"
          aria-label="scroll to top"
          onClick={scrollToTop}
          sx={homepageStyles.scrollToTop}
        >
          <ArrowUp size={24} />
        </Fab>
      </Fade>
    </Box>
  );
};

export default Homepage;
