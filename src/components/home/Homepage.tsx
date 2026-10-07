import {
  Box,
  Button,
  Chip,
} from "@mui/material";
import { Eraser, MagnifyingGlass, ArrowUp, ArrowsClockwise, Quotes } from "@phosphor-icons/react";
import { useQuery, NetworkStatus } from "@apollo/client";
import { GET_ARTISTS_PAGE, GET_ARTIST_FILTER_FLAGS, GET_SIGNINGEVENTS, GET_ARTISTS_BY_EVENT_IDS, GET_ARTISTS_BY_SET } from "../graphql/queries";
import ArtistGridItem, { TileEvent } from "./ArtistGridItem";
import DensityToggle, { GridDensity, getDensityPreference, saveDensityPreference } from "./DensityToggle";
import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";

import FiltersForm, { LocationChip, ScryfallSet, SetChip, TOGGLE_FILTERS, ToggleKey, locationLabel } from "./FiltersForm";
import EmptyState from "../shared/EmptyState";
import FilterChip from "../shared/FilterChip";
import MonoLabel from "../shared/MonoLabel";
import Slab from "../shared/Slab";
import { ArtistGridSkeleton } from "../shared/Skeletons";
import { homepageStyles } from "../../styles/homepage-styles";
import { artistGridStyles } from "../../styles/artist-grid-styles";
import axios from "axios";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import Fab from "@mui/material/Fab";
import Fade from "@mui/material/Fade";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import PageMeta from "../shared/PageMeta";
import { filterArtists, ArtistFlag } from "../../utils/artistFilters";

// Display record returned by artistsPage (filename needed to render the card image).
interface ArtistDisplay {
  name: string;
  filename: string;
}

// Merged shape passed to ArtistGridItem.
interface Artist {
  name: string;
  filename: string;
  location?: string;
  alternate_names?: string;
}

const MAJOR_SET_TYPES = new Set(['core', 'expansion', 'masters', 'draft_innovation', 'starter']);

const PAGE_SIZE = 60;

const LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0-9','Other'];

// Tiles show a signing badge for events starting within this window.
const BADGE_WINDOW_DAYS = 30;

const GRID_STYLE: Record<GridDensity, keyof typeof artistGridStyles> = {
  comfortable: 'grid',
  compact: 'gridDense',
  gallery: 'gridBanner',
};

const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

const Homepage = () => {
  usePageTitle();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    fetchPolicy: 'cache-and-network',
  });

  // Filter-flags query — all artists, lightweight bitfield index.
  const { data: flagsData } = useQuery(GET_ARTIST_FILTER_FLAGS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: eventsData } = useQuery(GET_SIGNINGEVENTS);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [density, setDensity] = useState<GridDensity>(() => {
    const urlDensity = searchParams.get('density');
    if (urlDensity === 'comfortable' || urlDensity === 'compact' || urlDensity === 'gallery') {
      return urlDensity;
    }
    return getDensityPreference();
  });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [scryfallSets, setScryfallSets] = useState<ScryfallSet[]>([]);
  const [setsLoading, setSetsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchInputValue, setSearchInputValue] = useState(() => new URLSearchParams(window.location.search).get('search') || '');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read filter state from URL params
  const userSearch = searchParams.get('search') || '';
  const locationFilter = searchParams.get('location') || '';
  const mountainMageFilter = searchParams.get('mountainMage') === 'true';
  const marksSigServiceFilter = searchParams.get('marksSig') === 'true';
  const hasUpcomingEventFilter = searchParams.get('hasEvent') === 'true';
  const sellsApsFilter = searchParams.get('sellsAps') === 'true';
  const letterFilter = searchParams.get('letter') || '';
  const setFilter = searchParams.get('set') || '';

  const toggles = useMemo<Record<ToggleKey, boolean>>(() => ({
    hasEvent: hasUpcomingEventFilter,
    sellsAps: sellsApsFilter,
    marksSig: marksSigServiceFilter,
    mountainMage: mountainMageFilter,
  }), [hasUpcomingEventFilter, sellsApsFilter, marksSigServiceFilter, mountainMageFilter]);

  // Whether any filter/search is active — the flags index already has everything
  // needed to render matches in this case, so pagination should not keep fetching.
  const hasActiveFilters = userSearch.length >= 2 || Boolean(locationFilter) || mountainMageFilter ||
    marksSigServiceFilter || hasUpcomingEventFilter || sellsApsFilter || Boolean(letterFilter) || Boolean(setFilter);

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
  const loadedArtists = useMemo<ArtistDisplay[]>(
    () => pageData?.artistsPage?.artists ?? [],
    [pageData?.artistsPage?.artists],
  );
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
  // Skipped while a filter/search is active: matches are already fully known
  // from the flags index, so there's no need to keep paginating artistsPage.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || hasActiveFilters) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '300px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore, hasActiveFilters]);

  // Upcoming (not yet ended) events, by id
  const upcomingEvents = useMemo(() => {
    const map = new Map<string, any>();
    if (!eventsData?.signingEvent) return map;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventsData.signingEvent
      .filter((event: any) => new Date(event.endDate) >= today)
      .forEach((event: any) => map.set(event.id, event));
    return map;
  }, [eventsData]);

  const upcomingEventIds = useMemo(() => Array.from(upcomingEvents.keys()), [upcomingEvents]);

  // Single batched query to fetch all artists for upcoming events
  const { data: eventArtistsData } = useQuery(GET_ARTISTS_BY_EVENT_IDS, {
    variables: { eventIds: upcomingEventIds },
    skip: upcomingEventIds.length === 0,
  });

  // Build set of artists with upcoming events from batched query result
  const artistsWithEvents = useMemo(() => {
    if (!eventArtistsData?.artistsByEventIds) return new Set<string>();
    return new Set<string>(eventArtistsData.artistsByEventIds.map((a: any) => a.artistName as string));
  }, [eventArtistsData]);

  // Each artist's soonest event starting within the badge window → tile badge.
  const tileEvents = useMemo(() => {
    const result = new Map<string, TileEvent & { start: number }>();
    if (!eventArtistsData?.artistsByEventIds) return result;

    const cutoff = Date.now() + BADGE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    eventArtistsData.artistsByEventIds.forEach(({ eventId, artistName }: any) => {
      const event = upcomingEvents.get(eventId);
      if (!event) return;
      const start = new Date(event.startDate);
      if (start.getTime() > cutoff) return;
      const existing = result.get(artistName);
      if (existing && existing.start <= start.getTime()) return;
      result.set(artistName, {
        name: event.name,
        date: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        start: start.getTime(),
      });
    });
    return result;
  }, [eventArtistsData, upcomingEvents]);

  // Artists credited in the selected set — kept fresh daily by the webservice's set sync.
  // null = not loaded yet, or the set hasn't been indexed.
  const { data: setArtistsData, loading: setArtistsLoading } = useQuery(GET_ARTISTS_BY_SET, {
    variables: { code: setFilter },
    skip: !setFilter,
  });
  const setArtistNames = useMemo<ReadonlySet<string> | null>(() => {
    const names: string[] | null | undefined = setArtistsData?.artistsBySet;
    return names ? new Set(names) : null;
  }, [setArtistsData]);
  const setNotIndexed = Boolean(setFilter) && !setArtistsLoading && setArtistsData !== undefined && setArtistNames === null;

  // Fetch major MTG sets from Scryfall once on mount for the set filter dropdown.
  useEffect(() => {
    setSetsLoading(true);
    axios.get<{ data: ScryfallSet[] }>('https://api.scryfall.com/sets')
      .then(res => {
        const filtered = res.data.data
          .filter(s => MAJOR_SET_TYPES.has(s.set_type))
          .sort((a, b) => new Date(b.released_at).getTime() - new Date(a.released_at).getTime());
        setScryfallSets(filtered);
      })
      .catch(() => {})
      .finally(() => setSetsLoading(false));
  }, []);


  // Show scroll-to-top button when user scrolls below the fold
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // "/" focuses the search box (unless the user is already typing somewhere).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      e.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync input display value when URL search param changes externally
  // (e.g., letter filter clears search, clear-all, back/forward navigation)
  useEffect(() => {
    setSearchInputValue(userSearch);
  }, [userSearch]);

  // Cancel debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInputValue(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      searchDebounceRef.current = null;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set('search', value);
        } else {
          next.delete('search');
        }
        if (next.has('letter')) next.delete('letter');
        return next;
      }, { replace: true });
    }, 300);
  };

  const handleLocationChange = (value: string) => {
    updateSearchParams('location', value);
  };

  const handleToggle = (key: ToggleKey, value: boolean) => {
    updateSearchParams(key, value);
  };

  // Set (or clear, with '') the letter filter. Clears search, as before.
  const applyLetter = (letter: string) => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    const newParams = new URLSearchParams(searchParams);
    if (letter) {
      newParams.set('letter', letter);
    } else {
      newParams.delete('letter');
    }
    // Clear search when filtering by letter
    newParams.delete('search');
    setSearchParams(newParams, { replace: true });
  };

  // Rail buttons toggle: clicking the active letter clears it.
  const handleLetterFilter = (letter: string) => {
    applyLetter(letterFilter === letter ? '' : letter);
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
    updateSearchParams('density', v === 'comfortable' ? '' : v);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Build array of active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onDelete: () => void }[] = [];

    if (userSearch.length >= 2) {
      chips.push({
        key: 'search',
        label: `Search: "${userSearch}"`,
        onDelete: () => {
          if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
            searchDebounceRef.current = null;
          }
          updateSearchParams('search', '');
        },
      });
    }
    if (locationFilter) {
      chips.push({
        key: 'location',
        label: `Location: ${locationLabel(locationFilter)}`,
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
    TOGGLE_FILTERS.forEach(({ key, label }) => {
      if (toggles[key]) {
        chips.push({ key, label, onDelete: () => updateSearchParams(key, false) });
      }
    });
    if (setFilter) {
      const setObj = scryfallSets.find(s => s.code === setFilter);
      chips.push({
        key: 'set',
        label: `Set: ${setObj?.name ?? setFilter.toUpperCase()}`,
        onDelete: () => updateSearchParams('set', ''),
      });
    }

    return chips;
  }, [userSearch, locationFilter, letterFilter, toggles, setFilter, scryfallSets, updateSearchParams]);

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
  const matchingFlags = useMemo<ArtistFlag[]>(() => filterArtists(allFlags, {
    locationFilter,
    mountainMageFilter,
    marksSigServiceFilter,
    hasUpcomingEventFilter,
    sellsApsFilter,
    letterFilter,
    userSearch,
    artistsWithEvents,
    setFilter,
    setArtistNames,
  }), [allFlags, locationFilter, mountainMageFilter, marksSigServiceFilter,
      hasUpcomingEventFilter, sellsApsFilter, letterFilter, userSearch, artistsWithEvents,
      setFilter, setArtistNames]);

  // When a filter/search is active, the flags index already carries filename —
  // render straight from it, no need to wait on artistsPage pagination.
  // Otherwise (default browse view), join against loaded filenames so the grid
  // only renders as many cards as have been paginated in via infinite scroll.
  const filteredData = useMemo<Artist[]>(() => {
    if (hasActiveFilters) {
      return matchingFlags
        .filter((a) => !!a.filename)
        .map((a) => ({ name: a.name, filename: a.filename as string, location: a.location, alternate_names: a.alternate_names }));
    }
    return matchingFlags
      .map((a) => ({ name: a.name, filename: filenameMap.get(a.name) ?? '', location: a.location, alternate_names: a.alternate_names }))
      .filter((a) => a.filename !== '');
  }, [matchingFlags, filenameMap, hasActiveFilters]);

  const artistCount = (allFlags.length || totalArtists).toLocaleString();

  const hero = (eyebrow: React.ReactNode, controls?: React.ReactNode) => (
    <Box component="section" sx={homepageStyles.hero}>
      <MonoLabel tone="accent" size={12} tracking="wide" component="div" sx={homepageStyles.eyebrow}>
        {eyebrow}
      </MonoLabel>
      <Box component="h1" sx={homepageStyles.title}>
        Every Magic artist. <Box component="span" sx={homepageStyles.titleMuted}>One vault.</Box>
      </Box>
      {controls}
    </Box>
  );

  if (pageLoading && !pageData)
    return (
      <Box sx={homepageStyles.page}>
        {hero('Loading artists...')}
        <Box sx={{ ...(homepageStyles.gridSection as object), pt: 3 }}>
          <ArtistGridSkeleton count={8} />
        </Box>
      </Box>
    );

  if (error)
    return (
      <Box sx={homepageStyles.page}>
        <Box sx={homepageStyles.statusMessage}>
          Error loading artists. Please try again later.
        </Box>
      </Box>
    );

  if (!pageData?.artistsPage)
    return (
      <Box sx={homepageStyles.page}>
        <Box sx={homepageStyles.statusMessage}>
          No artists found
        </Box>
      </Box>
    );

  const [signingSoonToggle, ...otherToggles] = TOGGLE_FILTERS;
  const renderToggle = ({ key, label, live }: typeof TOGGLE_FILTERS[number]) => (
    <FilterChip
      key={key}
      active={toggles[key]}
      live={live}
      onClick={() => handleToggle(key, !toggles[key])}
      // Marks / Mountain Mage live in the filter sheet on mobile
      sx={key === 'marksSig' || key === 'mountainMage' ? homepageStyles.desktopOnly : undefined}
    >
      {label}
    </FilterChip>
  );

  const resultSummary = hasActiveFilters
    ? `${filteredData.length.toLocaleString()} of ${matchingFlags.length.toLocaleString()}`
    : `${artistCount} artists`;

  return (
    <Box sx={homepageStyles.page}>
      <PageMeta
        title="MtG Artist Connection"
        description="Discover Magic: The Gathering artists. Browse profiles, signing events, and card art on MtG Artist Connection."
        path="/"
      />

      {hero(`${artistCount} artists indexed`, (
        <>
          <Box component="form" role="search" onSubmit={(e: React.FormEvent) => e.preventDefault()} sx={homepageStyles.search}>
            <MagnifyingGlass size={18} aria-hidden />
            <Box
              component="input"
              ref={searchInputRef}
              type="search"
              value={searchInputValue}
              onChange={handleSearchChange}
              placeholder="Search for an artist"
              aria-label="Search artists"
              autoComplete="off"
              sx={homepageStyles.searchInput}
            />
            <Box component="kbd" sx={homepageStyles.kbd} title="Press / to search">/</Box>
            <Button onClick={handleRandomArtist} sx={homepageStyles.randomButton} aria-label="Random artist">
              <Box component="span" sx={homepageStyles.randomLabel}>Random</Box>
              <ArrowsClockwise size={16} weight="bold" aria-hidden />
            </Button>
          </Box>

          {/* Desktop: Signing soon · Sells APs · Marks · Mountain Mage · Location · Set.
              Mobile (one scrolling row): Signing soon · Filters · n · Sells APs · Location. */}
          <Box sx={homepageStyles.chipRow}>
            {renderToggle(signingSoonToggle)}
            <FilterChip
              count={activeFilterChips.length}
              active={activeFilterChips.length > 0}
              aria-haspopup="dialog"
              onClick={() => setFilterSheetOpen(true)}
              sx={homepageStyles.mobileOnly}
            >
              Filters
            </FilterChip>
            {otherToggles.map(renderToggle)}
            <LocationChip locations={locations} value={locationFilter} onChange={handleLocationChange} />
            <Box sx={homepageStyles.desktopOnly}>
              <SetChip scryfallSets={scryfallSets} setsLoading={setsLoading} value={setFilter} onChange={(code) => updateSearchParams('set', code)} />
            </Box>
          </Box>

          <Box component={RouterLink} to="/randomflavortext" sx={homepageStyles.flavorLink}>
            <Quotes size={14} weight="fill" aria-hidden />
            <span>Read a random piece of flavor text</span>
            <Box component="span" aria-hidden className="flavor-link-arrow" sx={homepageStyles.flavorLinkArrow}>→</Box>
          </Box>
        </>
      ))}

      <Box sx={homepageStyles.toolbar}>
        <Box component="nav" aria-label="Filter by first letter" sx={homepageStyles.letterRail}>
          {LETTERS.map((letter) => (
            <Box
              key={letter}
              component="button"
              type="button"
              aria-pressed={letterFilter === letter}
              onClick={() => handleLetterFilter(letter)}
              sx={homepageStyles.letterButton}
            >
              {letter}
            </Box>
          ))}
        </Box>
        <MonoLabel uppercase={false} size={12} sx={homepageStyles.resultCount}>{resultSummary}</MonoLabel>
        <Box sx={homepageStyles.toolbarRight}>
          <Box
            component="select"
            aria-label="Filter by first letter"
            value={letterFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => applyLetter(e.target.value)}
            sx={homepageStyles.letterSelect}
          >
            <option value="">A–Z</option>
            {LETTERS.map((letter) => <option key={letter} value={letter}>{letter}</option>)}
          </Box>
          <DensityToggle value={density} onChange={handleDensityChange} />
        </Box>
      </Box>

      {hasActiveFilters && (
        <Box sx={homepageStyles.activeRow}>
          <MonoLabel uppercase={false} size={12} sx={homepageStyles.activeCount}>
            Showing {resultSummary} artists
          </MonoLabel>
          {activeFilterChips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              size="small"
              onDelete={chip.onDelete}
              sx={homepageStyles.activeChip}
            />
          ))}
          {activeFilterChips.length > 1 && (
            <Button
              size="small"
              startIcon={<Eraser size={14} />}
              onClick={handleClearAllFilters}
              sx={homepageStyles.clearAll}
            >
              Clear all
            </Button>
          )}
        </Box>
      )}

      <Box sx={homepageStyles.gridSection}>
        <Box sx={artistGridStyles[GRID_STYLE[density]]}>
          {setFilter && setArtistsLoading ? (
            // Selected set's artist list is in flight — placeholders, not "no matches"
            Array.from({ length: 8 }).map((_, i) => (
              <Slab key={i} aspectRatio="5 / 6" mobileAspectRatio="4 / 5" />
            ))
          ) : setNotIndexed ? (
            <EmptyState
              headline="This set hasn't been indexed yet"
              body="New sets are added to the filter daily. Check back soon."
              action={{ label: 'Clear set filter', onClick: () => updateSearchParams('set', '') }}
              sx={{ gridColumn: '1 / -1' }}
            />
          ) : filteredData.length > 0 ? (
            filteredData.map((artist: Artist, index: number) => (
              <ArtistGridItem
                artistData={artist}
                key={artist.name}
                eager={index < 8}
                event={tileEvents.get(artist.name)}
                density={density}
              />
            ))
          ) : (userSearch.length >= 2 ||
            locationFilter !== "" ||
            mountainMageFilter ||
            marksSigServiceFilter ||
            hasUpcomingEventFilter ||
            sellsApsFilter ||
            setFilter) && filteredData.length === 0 ? (
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
        PaperProps={{ sx: homepageStyles.filterSheetPaper, 'aria-label': 'Filters' } as object}
      >
        <Box sx={{ overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1 }}>
            <Box sx={homepageStyles.filterSheetHandle} />
          </Box>
          <Box sx={homepageStyles.filterSheetHeader}>
            <Box component="h2" sx={{ ...(homepageStyles.filterSheetTitle as object), m: 0 }}>Filters</Box>
            {hasActiveFilters && (
              <Button
                size="small"
                startIcon={<Eraser size={14} />}
                onClick={handleClearAllFilters}
                sx={homepageStyles.clearAll}
              >
                Clear all
              </Button>
            )}
          </Box>
          <Box sx={homepageStyles.filterSheetContent}>
            <FiltersForm
              idSuffix="-m"
              locationFilter={locationFilter}
              setFilter={setFilter}
              locations={locations}
              scryfallSets={scryfallSets}
              setsLoading={setsLoading}
              toggles={toggles}
              onToggle={handleToggle}
              onLocationChange={handleLocationChange}
              onSetChange={(code) => updateSearchParams('set', code)}
            />
          </Box>
          <Box sx={homepageStyles.filterSheetActions}>
            <Button onClick={() => setFilterSheetOpen(false)} sx={homepageStyles.doneButton}>
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
          <ArrowUp size={22} />
        </Fab>
      </Fade>
    </Box>
  );
};

export default Homepage;
