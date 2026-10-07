import SegmentedControl, { SegmentOption } from '../shared/SegmentedControl';

export type GridDensity = 'comfortable' | 'compact' | 'gallery';

const DENSITY_KEY = 'mtgac-grid-density';

export function getDensityPreference(): GridDensity {
  try {
    const stored = localStorage.getItem(DENSITY_KEY);
    if (stored === 'comfortable' || stored === 'compact' || stored === 'gallery') {
      return stored;
    }
  } catch {}
  return 'comfortable';
}

export function saveDensityPreference(value: GridDensity): void {
  try {
    localStorage.setItem(DENSITY_KEY, value);
  } catch {}
}

const MODES: SegmentOption<GridDensity>[] = [
  { value: 'comfortable', label: 'Grid' },
  { value: 'compact', label: 'Dense' },
  { value: 'gallery', label: 'Banner' },
];

const DensityToggle = ({
  value,
  onChange,
}: {
  value: GridDensity;
  onChange: (v: GridDensity) => void;
}) => (
  <SegmentedControl
    size="sm"
    aria-label="Grid layout"
    options={MODES}
    value={value}
    onChange={(v) => {
      onChange(v);
      saveDensityPreference(v);
    }}
  />
);

export default DensityToggle;
