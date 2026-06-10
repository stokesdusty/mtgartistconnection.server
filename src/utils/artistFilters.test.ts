import { filterArtists, ArtistFlag, FLAG_MARKSSIG, FLAG_MOUNTAINMAGE, FLAG_ARTISTPROOFS } from './artistFilters';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const noFilters = {
  locationFilter: '',
  mountainMageFilter: false,
  marksSigServiceFilter: false,
  hasUpcomingEventFilter: false,
  sellsApsFilter: false,
  letterFilter: '',
  userSearch: '',
  artistsWithEvents: new Set<string>(),
  setFilter: '',
  setArtistsData: {},
};

const a = (name: string, flags = 0, location?: string, alternate_names?: string): ArtistFlag =>
  ({ name, flags, location, alternate_names });

const artists: ArtistFlag[] = [
  a('Aaron Miller',     FLAG_MARKSSIG,                       'Oregon, US'),
  a('Bram Sels',        FLAG_MOUNTAINMAGE,                   'Belgium'),
  a('Chris Rahn',       FLAG_MARKSSIG | FLAG_MOUNTAINMAGE,   'Texas, US'),
  a('Dan Scott',        FLAG_ARTISTPROOFS,                   'California, US'),
  a('Éric Deschamps',   0,                                   'Quebec, Canada'),
  a('4bidden Artist',   0),
  a('Ábel Farkas',      0),
  a('0-9-Artist',       0),
  a('!Special',         0),
  a('Zack Stella',      FLAG_MARKSSIG | FLAG_ARTISTPROOFS,   'New York, US'),
  a('Anna Steinbauer',  0, 'Bavaria, Germany', 'Anna S'),
];

// ---------------------------------------------------------------------------
// No filters
// ---------------------------------------------------------------------------
describe('no filters active', () => {
  it('returns the full list unchanged', () => {
    expect(filterArtists(artists, noFilters)).toHaveLength(artists.length);
  });

  it('returns the same artist objects (referential equality of elements)', () => {
    const result = filterArtists(artists, noFilters);
    artists.forEach((artist) => expect(result).toContain(artist));
  });
});

// ---------------------------------------------------------------------------
// Location filter
// ---------------------------------------------------------------------------
describe('locationFilter', () => {
  it('returns only artists matching the exact location string', () => {
    const result = filterArtists(artists, { ...noFilters, locationFilter: 'Texas, US' });
    expect(result.map(a => a.name)).toEqual(['Chris Rahn']);
  });

  it('"US" matches any artist whose location ends with ", US"', () => {
    const result = filterArtists(artists, { ...noFilters, locationFilter: 'US' });
    const names = result.map(a => a.name);
    expect(names).toContain('Aaron Miller');
    expect(names).toContain('Chris Rahn');
    expect(names).toContain('Dan Scott');
    expect(names).toContain('Zack Stella');
    expect(names).not.toContain('Bram Sels');
    expect(names).not.toContain('Éric Deschamps');
  });

  it('returns an empty array when no artist matches', () => {
    const result = filterArtists(artists, { ...noFilters, locationFilter: 'Antarctica' });
    expect(result).toHaveLength(0);
  });

  it('does not match partial location strings', () => {
    const result = filterArtists(artists, { ...noFilters, locationFilter: 'Texas' });
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Flag filters
// ---------------------------------------------------------------------------
describe('mountainMageFilter', () => {
  it('returns only artists with the Mountain Mage bit set', () => {
    const result = filterArtists(artists, { ...noFilters, mountainMageFilter: true });
    const names = result.map(a => a.name);
    expect(names).toContain('Bram Sels');
    expect(names).toContain('Chris Rahn');
    expect(names).not.toContain('Aaron Miller');
    expect(names).not.toContain('Dan Scott');
  });
});

describe('marksSigServiceFilter', () => {
  it('returns only artists with the Marks Sig Service bit set', () => {
    const result = filterArtists(artists, { ...noFilters, marksSigServiceFilter: true });
    const names = result.map(a => a.name);
    expect(names).toContain('Aaron Miller');
    expect(names).toContain('Chris Rahn');
    expect(names).toContain('Zack Stella');
    expect(names).not.toContain('Bram Sels');
    expect(names).not.toContain('Dan Scott');
  });
});

describe('sellsApsFilter', () => {
  it('returns only artists with the Artist Proofs bit set', () => {
    const result = filterArtists(artists, { ...noFilters, sellsApsFilter: true });
    const names = result.map(a => a.name);
    expect(names).toContain('Dan Scott');
    expect(names).toContain('Zack Stella');
    expect(names).not.toContain('Aaron Miller');
    expect(names).not.toContain('Bram Sels');
  });
});

// ---------------------------------------------------------------------------
// hasUpcomingEventFilter
// ---------------------------------------------------------------------------
describe('hasUpcomingEventFilter', () => {
  it('returns only artists in the artistsWithEvents set', () => {
    const result = filterArtists(artists, {
      ...noFilters,
      hasUpcomingEventFilter: true,
      artistsWithEvents: new Set(['Aaron Miller', 'Zack Stella']),
    });
    expect(result.map(a => a.name)).toEqual(['Aaron Miller', 'Zack Stella']);
  });

  it('returns empty array when the events set is empty', () => {
    const result = filterArtists(artists, {
      ...noFilters,
      hasUpcomingEventFilter: true,
      artistsWithEvents: new Set(),
    });
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Letter filter
// ---------------------------------------------------------------------------
describe('letterFilter', () => {
  it('filters by starting letter A', () => {
    const result = filterArtists(artists, { ...noFilters, letterFilter: 'A' });
    const names = result.map(a => a.name);
    expect(names).toContain('Aaron Miller');
    expect(names).toContain('Anna Steinbauer');
    expect(names).not.toContain('Bram Sels');
  });

  it('filters by starting letter Z', () => {
    const result = filterArtists(artists, { ...noFilters, letterFilter: 'Z' });
    expect(result.map(a => a.name)).toEqual(['Zack Stella']);
  });

  it('"0-9" returns artists whose name starts with a digit', () => {
    const result = filterArtists(artists, { ...noFilters, letterFilter: '0-9' });
    const names = result.map(a => a.name);
    expect(names).toContain('0-9-Artist');
    expect(names).toContain('4bidden Artist');
    expect(names).not.toContain('Aaron Miller');
  });

  it('"Other" returns artists whose name does not start with a letter or digit', () => {
    const result = filterArtists(artists, { ...noFilters, letterFilter: 'Other' });
    expect(result.map(a => a.name)).toEqual(['!Special']);
  });

  it('handles accented first letters via NFD normalization (É → E)', () => {
    const result = filterArtists(artists, { ...noFilters, letterFilter: 'E' });
    const names = result.map(a => a.name);
    expect(names).toContain('Éric Deschamps');
  });

  it('handles accented first letters via NFD normalization (Á → A)', () => {
    const result = filterArtists(artists, { ...noFilters, letterFilter: 'A' });
    const names = result.map(a => a.name);
    expect(names).toContain('Ábel Farkas');
  });

  it('returns empty array when no artist starts with the given letter', () => {
    const result = filterArtists(artists, { ...noFilters, letterFilter: 'Q' });
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Text search
// ---------------------------------------------------------------------------
describe('userSearch', () => {
  it('does not filter when search term is shorter than 2 characters', () => {
    const result = filterArtists(artists, { ...noFilters, userSearch: 'A' });
    expect(result).toHaveLength(artists.length);
  });

  it('filters by artist name (case-insensitive, 2+ chars)', () => {
    const result = filterArtists(artists, { ...noFilters, userSearch: 'zack' });
    expect(result.map(a => a.name)).toEqual(['Zack Stella']);
  });

  it('matches partial name', () => {
    const result = filterArtists(artists, { ...noFilters, userSearch: 'ste' });
    const names = result.map(a => a.name);
    expect(names).toContain('Zack Stella');
    expect(names).toContain('Anna Steinbauer');
  });

  it('ignores whitespace in both query and artist name', () => {
    const result = filterArtists(artists, { ...noFilters, userSearch: 'aaronmiller' });
    expect(result.map(a => a.name)).toContain('Aaron Miller');
  });

  it('matches against alternate_names', () => {
    // Anna Steinbauer has alternate_names: 'Anna S'
    const result = filterArtists(artists, { ...noFilters, userSearch: 'anna s' });
    expect(result.map(a => a.name)).toContain('Anna Steinbauer');
  });

  it('matches against location', () => {
    const result = filterArtists(artists, { ...noFilters, userSearch: 'Bavaria' });
    expect(result.map(a => a.name)).toContain('Anna Steinbauer');
  });

  it('returns empty array when no artist matches', () => {
    const result = filterArtists(artists, { ...noFilters, userSearch: 'xyznomatch' });
    expect(result).toHaveLength(0);
  });

  it('is case-insensitive for accented characters', () => {
    const result = filterArtists(artists, { ...noFilters, userSearch: 'éric' });
    expect(result.map(a => a.name)).toContain('Éric Deschamps');
  });
});

// ---------------------------------------------------------------------------
// Set filter
// ---------------------------------------------------------------------------
describe('setFilter', () => {
  const setArtistsData = {
    khm: ['aaronmiller', 'zackstella'],
    grn: ['chriscahn'],
  };

  it('returns only artists in the specified set (normalized name match)', () => {
    const result = filterArtists(artists, { ...noFilters, setFilter: 'khm', setArtistsData });
    const names = result.map(a => a.name);
    expect(names).toContain('Aaron Miller');
    expect(names).toContain('Zack Stella');
    expect(names).not.toContain('Bram Sels');
  });

  it('returns empty array when the set has no matching artists', () => {
    const result = filterArtists(artists, {
      ...noFilters,
      setFilter: 'unknown-set',
      setArtistsData,
    });
    expect(result).toHaveLength(0);
  });

  it('normalizes artist names by lowercasing and removing spaces for matching', () => {
    // 'Aaron Miller' → 'aaronmiller' must match entry 'aaronmiller'
    const result = filterArtists(
      [a('Aaron Miller', 0)],
      { ...noFilters, setFilter: 'khm', setArtistsData: { khm: ['aaronmiller'] } },
    );
    expect(result).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Combined filters
// ---------------------------------------------------------------------------
describe('combined filters', () => {
  it('applies multiple filters as an intersection (AND logic)', () => {
    // Both Marks Sig AND US location
    const result = filterArtists(artists, {
      ...noFilters,
      marksSigServiceFilter: true,
      locationFilter: 'US',
    });
    const names = result.map(a => a.name);
    // Aaron Miller: marksSig + Oregon, US ✓
    // Chris Rahn: marksSig + mountainMage + Texas, US ✓
    // Zack Stella: marksSig + artistProofs + New York, US ✓
    // Bram Sels: mountainMage only, Belgium ✗
    expect(names).toContain('Aaron Miller');
    expect(names).toContain('Chris Rahn');
    expect(names).toContain('Zack Stella');
    expect(names).not.toContain('Bram Sels');
    expect(names).not.toContain('Dan Scott');
  });

  it('letter filter + text search narrow results further', () => {
    // Letter A then search "anna"
    const result = filterArtists(artists, {
      ...noFilters,
      letterFilter: 'A',
      userSearch: 'anna',
    });
    expect(result.map(a => a.name)).toEqual(['Anna Steinbauer']);
  });

  it('returns empty array when combined filters produce no matches', () => {
    const result = filterArtists(artists, {
      ...noFilters,
      mountainMageFilter: true,
      locationFilter: 'California, US',
    });
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('edge cases', () => {
  it('returns an empty array when given an empty artist list', () => {
    expect(filterArtists([], noFilters)).toHaveLength(0);
  });

  it('handles artists with no location gracefully for location filter', () => {
    const result = filterArtists(
      [a('No Location Artist', 0, undefined)],
      { ...noFilters, locationFilter: 'Texas, US' },
    );
    expect(result).toHaveLength(0);
  });

  it('handles artists with no location gracefully for US location filter', () => {
    const result = filterArtists(
      [a('No Location Artist', 0, undefined)],
      { ...noFilters, locationFilter: 'US' },
    );
    expect(result).toHaveLength(0);
  });

  it('does not mutate the input array', () => {
    const input = [...artists];
    filterArtists(artists, { ...noFilters, locationFilter: 'Texas, US' });
    expect(artists).toHaveLength(input.length);
  });
});
