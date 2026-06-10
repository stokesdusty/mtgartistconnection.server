export interface ArtistFlag {
  name: string;
  flags: number;
  location?: string;
  alternate_names?: string;
}

export const FLAG_MARKSSIG     = 1 << 0;
export const FLAG_MOUNTAINMAGE = 1 << 1;
export const FLAG_ARTISTPROOFS = 1 << 2;

export interface ArtistFilterOptions {
  locationFilter: string;
  mountainMageFilter: boolean;
  marksSigServiceFilter: boolean;
  hasUpcomingEventFilter: boolean;
  sellsApsFilter: boolean;
  letterFilter: string;
  userSearch: string;
  artistsWithEvents: Set<string>;
  setFilter: string;
  setArtistsData: Record<string, string[]>;
}

export function filterArtists(
  allFlags: ArtistFlag[],
  options: ArtistFilterOptions,
): ArtistFlag[] {
  const {
    locationFilter,
    mountainMageFilter,
    marksSigServiceFilter,
    hasUpcomingEventFilter,
    sellsApsFilter,
    letterFilter,
    userSearch,
    artistsWithEvents,
    setFilter,
    setArtistsData,
  } = options;

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
  if (setFilter) {
    const setNames = new Set<string>(setArtistsData[setFilter] ?? []);
    filtered = filtered.filter((a) => setNames.has(a.name.toLowerCase().replace(/\s/g, '')));
  }

  return filtered;
}
