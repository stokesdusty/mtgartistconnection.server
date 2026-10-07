import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  Box,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Fab,
  ListSubheader,
  Switch
} from "@mui/material";
import { EventCardSkeleton } from "../shared/Skeletons";
import { ArrowUp } from "@phosphor-icons/react";
import { GET_SIGNINGEVENTS, GET_ARTISTS_BY_EVENT_IDS, GET_MY_CARD_COLLECTION } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import SigningEvent from "./SigningEvent";
import EmptyState from "../shared/EmptyState";
import MonoLabel from "../shared/MonoLabel";
import SegmentedControl, { SegmentOption } from "../shared/SegmentedControl";
import { calendarStyles } from "../../styles/calendar-styles";
import { homepageStyles } from "../../styles/homepage-styles";
import PageMeta from "../shared/PageMeta";

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

const DATE_RANGE_OPTIONS: SegmentOption<DateRangeFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'this-week', label: 'This week', shortLabel: 'Week' },
  { value: 'this-month', label: 'This month', shortLabel: 'Month' },
  { value: 'next-3-months', label: 'Next 3 months', shortLabel: '3 mo' },
];

const locationLabel = (value: string) => (value === 'US' ? 'Anywhere in the US' : value);

const Calendar = () => {
  usePageTitle("Events Calendar");

  const [searchParams, setSearchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') ?? '';
  const artistFilter = searchParams.get('artist') ?? '';
  const dateRangeFilter = (searchParams.get('range') as DateRangeFilter) ?? 'all';

  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  // Only meaningful with a collection to read from, so ignored when logged out.
  const wishlistOnly = isLoggedIn && searchParams.get('wishlist') === '1';

  const { data, error, loading } = useQuery(GET_SIGNINGEVENTS);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const updateFilter = (key: string, value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true });
  };

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
    today.setHours(0, 0, 0, 0);
    return data.signingEvent
      .filter((event: any) => new Date(event.endDate) >= today)
      .map((event: any) => event.id);
  }, [data]);

  // Single batched query to fetch all artists for upcoming events
  const { data: eventArtistsData } = useQuery(GET_ARTISTS_BY_EVENT_IDS, {
    variables: { eventIds: upcomingEventIds },
    skip: upcomingEventIds.length === 0,
    fetchPolicy: 'cache-and-network',
  });

  const { data: myCollectionData } = useQuery(GET_MY_CARD_COLLECTION, {
    skip: !isLoggedIn,
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

  // Count wishlisted cards per artist name
  const wishlistCountByArtist = useMemo(() => {
    if (!myCollectionData?.myCardCollection) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    myCollectionData.myCardCollection.forEach((card: any) => {
      if (card.wishlistSigned && card.artistName) {
        counts[card.artistName] = (counts[card.artistName] ?? 0) + 1;
      }
    });
    return counts;
  }, [myCollectionData]);

  // Sum wishlisted cards across all artists per event
  const wishlistCountByEvent = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(eventArtistsMap).forEach(([eventId, artists]) => {
      const total = artists.reduce((sum, name) => sum + (wishlistCountByArtist[name] ?? 0), 0);
      if (total > 0) counts[eventId] = total;
    });
    return counts;
  }, [eventArtistsMap, wishlistCountByArtist]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLocationChange = (event: SelectChangeEvent) => {
    updateFilter('location', event.target.value);
  };

  const handleArtistChange = (event: SelectChangeEvent) => {
    updateFilter('artist', event.target.value);
  };

  const handleClearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const handleDateRangeChange = (range: DateRangeFilter) => {
    updateFilter('range', range === 'all' ? '' : range);
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

  // Count events per artist across all upcoming events
  const artistEventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(eventArtistsMap).forEach((artists) => {
      artists.forEach((artist) => {
        counts[artist] = (counts[artist] ?? 0) + 1;
      });
    });
    return counts;
  }, [eventArtistsMap]);

  const locations = useMemo(() => {
    if (!data?.signingEvent) return { US: [], Other: [], counts: {} as Record<string, number> };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = data.signingEvent.filter((event: any) => {
      const endDate = new Date(event.endDate);
      return endDate >= today;
    });

    const usLocations = new Set<string>();
    const otherLocations = new Set<string>();
    const counts: Record<string, number> = {};

    upcomingEvents.forEach((event: any) => {
      if (event.city) {
        const parts = event.city.split(',').map((s: string) => s.trim());
        if (parts.length === 2) {
          const stateCode = parts[1].toUpperCase();
          if (stateCodeToName[stateCode]) {
            const stateName = stateCodeToName[stateCode];
            usLocations.add(stateName);
            counts[stateName] = (counts[stateName] ?? 0) + 1;
            counts['US'] = (counts['US'] ?? 0) + 1;
          } else {
            otherLocations.add(event.city);
            counts[event.city] = (counts[event.city] ?? 0) + 1;
          }
        } else {
          otherLocations.add(event.city);
          counts[event.city] = (counts[event.city] ?? 0) + 1;
        }
      }
    });

    return {
      US: Array.from(usLocations).sort(),
      Other: Array.from(otherLocations).sort(),
      counts,
    };
  }, [data]);

  const filteredAndSortedEvents = useMemo(() => {
    if (!data?.signingEvent) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
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

    // Apply wishlist filter: events where a wishlisted artist is signing
    if (wishlistOnly) {
      filtered = filtered.filter((eventData: any) => (wishlistCountByEvent[eventData.id] ?? 0) > 0);
    }

    return filtered.sort(
      (a: any, b: any) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [data, locationFilter, artistFilter, dateRangeFilter, eventArtistsMap, wishlistOnly, wishlistCountByEvent]);

  // Group by the month each event starts in ("October 2026")
  const monthGroups = useMemo(() => {
    const groups: { key: string; label: string; events: any[] }[] = [];
    filteredAndSortedEvents.forEach((eventData: any) => {
      const start = new Date(eventData.startDate);
      const key = `${start.getFullYear()}-${start.getMonth()}`;
      let group = groups[groups.length - 1];
      if (!group || group.key !== key) {
        group = {
          key,
          label: start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          events: [],
        };
        groups.push(group);
      }
      group.events.push(eventData);
    });
    return groups;
  }, [filteredAndSortedEvents]);

  const hasFilters = Boolean(locationFilter || artistFilter || dateRangeFilter !== 'all' || wishlistOnly);

  const pageMeta = (
    <PageMeta
      title="Events Calendar"
      description="Browse upcoming Magic: The Gathering artist signing events, conventions, and streams. Find where your favorite MTG artists will be."
      path="/calendar"
    />
  );

  const title = (
    <Box component="h1" sx={calendarStyles.title}>Signing calendar</Box>
  );

  if (loading)
    return (
      <Box sx={calendarStyles.page}>
        {pageMeta}
        <Box sx={calendarStyles.hero}>{title}</Box>
        <EventCardSkeleton count={5} />
      </Box>
    );

  if (error)
    return (
      <Box sx={[calendarStyles.page, calendarStyles.statusMessage]}>
        Error loading calendar: {error.message}
      </Box>
    );

  const eyebrow = filteredAndSortedEvents.length === upcomingEventIds.length
    ? `${upcomingEventIds.length} upcoming ${upcomingEventIds.length === 1 ? 'event' : 'events'}`
    : `Showing ${filteredAndSortedEvents.length} of ${upcomingEventIds.length} upcoming events`;

  return (
    <Box sx={calendarStyles.page}>
      {pageMeta}

      <Box sx={calendarStyles.hero}>
        <Box>
          <MonoLabel tone="accent" size={12} tracking="wide" sx={calendarStyles.eyebrow}>
            {eyebrow}
          </MonoLabel>
          {title}
        </Box>
        <SegmentedControl
          aria-label="Date range"
          options={DATE_RANGE_OPTIONS}
          value={dateRangeFilter}
          onChange={handleDateRangeChange}
        />
      </Box>

      <Box sx={calendarStyles.filtersRow}>
        <FormControl size="small" sx={calendarStyles.select}>
          <Select
            id="location-select"
            value={locationFilter}
            displayEmpty
            onChange={handleLocationChange}
            inputProps={{ 'aria-label': 'Filter by location' }}
            renderValue={(v) =>
              v ? locationLabel(v) : <Box component="span" sx={calendarStyles.selectPlaceholder}>Location</Box>
            }
            MenuProps={{ sx: homepageStyles.menu }}
          >
            <MenuItem value="" sx={homepageStyles.menuItem}>
              All locations
            </MenuItem>
            {locations.US.length > 0 && [
              <ListSubheader key="us-header" sx={homepageStyles.listSubheader}>
                US States
              </ListSubheader>,
              <MenuItem key="us-all" value="US" sx={homepageStyles.menuItem}>
                Anywhere in the US ({locations.counts['US'] ?? 0})
              </MenuItem>,
              ...locations.US.map((location) => (
                <MenuItem key={location} value={location} sx={homepageStyles.menuItem}>
                  {location} ({locations.counts[location] ?? 0})
                </MenuItem>
              ))
            ]}
            {locations.Other.length > 0 && [
              <ListSubheader key="other-header" sx={homepageStyles.listSubheader}>
                Other Locations
              </ListSubheader>,
              ...locations.Other.map((location) => (
                <MenuItem key={location} value={location} sx={homepageStyles.menuItem}>
                  {location} ({locations.counts[location] ?? 0})
                </MenuItem>
              ))
            ]}
          </Select>
        </FormControl>

        <FormControl size="small" sx={calendarStyles.select}>
          <Select
            id="artist-select"
            value={artistFilter}
            displayEmpty
            onChange={handleArtistChange}
            inputProps={{ 'aria-label': 'Filter by artist' }}
            renderValue={(v) =>
              v || <Box component="span" sx={calendarStyles.selectPlaceholder}>Artist</Box>
            }
            MenuProps={{ sx: homepageStyles.menu }}
          >
            <MenuItem value="" sx={homepageStyles.menuItem}>
              All artists
            </MenuItem>
            {uniqueArtists.map((artist) => (
              <MenuItem key={artist} value={artist} sx={homepageStyles.menuItem}>
                {artist} ({artistEventCounts[artist] ?? 0})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasFilters && (
          <Box component="button" type="button" onClick={handleClearFilters} sx={calendarStyles.clearButton}>
            Clear filters
          </Box>
        )}

        <Box sx={calendarStyles.filtersSpacer} />

        {isLoggedIn && (
          <FormControlLabel
            labelPlacement="start"
            label="My wishlist only"
            sx={calendarStyles.wishlistToggle}
            control={
              <Switch
                checked={wishlistOnly}
                onChange={(e) => updateFilter('wishlist', e.target.checked ? '1' : '')}
                sx={calendarStyles.switch}
              />
            }
          />
        )}
      </Box>

      <Box sx={calendarStyles.months}>
        {monthGroups.length > 0 ? (
          monthGroups.map((group) => (
            <Box component="section" key={group.key} aria-labelledby={`month-${group.key}`}>
              <Box component="h2" id={`month-${group.key}`} sx={calendarStyles.monthHeader}>
                <Box component="span" sx={calendarStyles.monthName}>{group.label}</Box>
                <MonoLabel size={12} uppercase={false}>
                  {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
                </MonoLabel>
              </Box>
              <Box component="ul" sx={calendarStyles.eventList}>
                {group.events.map((eventData: any) => (
                  <SigningEvent
                    key={eventData.id}
                    props={eventData}
                    wishlistCount={wishlistCountByEvent[eventData.id] ?? 0}
                    artistNames={eventArtistsMap[eventData.id]}
                  />
                ))}
              </Box>
            </Box>
          ))
        ) : hasFilters ? (
          <EmptyState
            headline={`No events match${artistFilter ? ` for ${artistFilter}` : ''}${locationFilter ? ` in ${locationLabel(locationFilter)}` : ''}${dateRangeFilter !== 'all' ? ` ${dateRangeFilter.replace(/-/g, ' ')}` : ''}${wishlistOnly ? ' with wishlisted artists' : ''}`}
            body="Try broadening your filters."
            action={{ label: 'Clear filters', onClick: handleClearFilters }}
          />
        ) : (
          <EmptyState
            headline="No upcoming events scheduled"
            body="Check back soon for new signing events."
          />
        )}
      </Box>

      {showScrollTop && (
        <Fab
          onClick={scrollToTop}
          aria-label="Scroll to top"
          sx={calendarStyles.scrollToTopFab}
        >
          <ArrowUp size={20} />
        </Fab>
      )}
    </Box>
  );
};

export default Calendar;