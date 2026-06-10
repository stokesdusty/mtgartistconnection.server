import { getDensityPreference, saveDensityPreference, GridDensity } from './DensityToggle';

const DENSITY_KEY = 'mtgac-grid-density';

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// getDensityPreference
// ---------------------------------------------------------------------------
describe('getDensityPreference', () => {
  it('returns "comfortable" when nothing is stored', () => {
    expect(getDensityPreference()).toBe('comfortable');
  });

  it('returns "comfortable" when that value is stored', () => {
    localStorage.setItem(DENSITY_KEY, 'comfortable');
    expect(getDensityPreference()).toBe('comfortable');
  });

  it('returns "compact" when that value is stored', () => {
    localStorage.setItem(DENSITY_KEY, 'compact');
    expect(getDensityPreference()).toBe('compact');
  });

  it('returns "gallery" when that value is stored', () => {
    localStorage.setItem(DENSITY_KEY, 'gallery');
    expect(getDensityPreference()).toBe('gallery');
  });

  it('returns "comfortable" when an unrecognised value is stored', () => {
    localStorage.setItem(DENSITY_KEY, 'superwide');
    expect(getDensityPreference()).toBe('comfortable');
  });

  it('returns "comfortable" when an empty string is stored', () => {
    localStorage.setItem(DENSITY_KEY, '');
    expect(getDensityPreference()).toBe('comfortable');
  });
});

// ---------------------------------------------------------------------------
// saveDensityPreference
// ---------------------------------------------------------------------------
describe('saveDensityPreference', () => {
  it('writes the value to localStorage', () => {
    saveDensityPreference('compact');
    expect(localStorage.getItem(DENSITY_KEY)).toBe('compact');
  });

  it('overwrites a previously saved value', () => {
    saveDensityPreference('compact');
    saveDensityPreference('gallery');
    expect(localStorage.getItem(DENSITY_KEY)).toBe('gallery');
  });

  it('round-trips through getDensityPreference', () => {
    const values: GridDensity[] = ['comfortable', 'compact', 'gallery'];
    values.forEach((v) => {
      saveDensityPreference(v);
      expect(getDensityPreference()).toBe(v);
    });
  });
});
