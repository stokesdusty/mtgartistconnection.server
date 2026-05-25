import { Box, Tooltip } from '@mui/material';
import { SquaresFour, GridNine, Images } from '@phosphor-icons/react';
import { colors, themeColors, borderRadius, transitions } from '../../styles/design-tokens';

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

const MODES: { value: GridDensity; Icon: React.ComponentType<any>; label: string }[] = [
  { value: 'comfortable', Icon: SquaresFour, label: 'Comfortable' },
  { value: 'compact',     Icon: GridNine,    label: 'Compact rows' },
  { value: 'gallery',     Icon: Images,      label: 'Gallery'     },
];

const DensityToggle = ({
  value,
  onChange,
}: {
  value: GridDensity;
  onChange: (v: GridDensity) => void;
}) => {
  const handleClick = (v: GridDensity) => {
    onChange(v);
    saveDensityPreference(v);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '2px',
        border: `1px solid ${themeColors.neutral[200]}`,
        borderRadius: borderRadius.md,
        padding: '2px',
        backgroundColor: themeColors.neutral[50],
        flexShrink: 0,
      }}
    >
      {MODES.map(({ value: v, Icon, label }) => (
        <Tooltip key={v} title={label} placement="top" arrow>
          <Box
            component="button"
            onClick={() => handleClick(v)}
            aria-label={label}
            aria-pressed={value === v}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 28,
              border: 'none',
              borderRadius: `calc(${borderRadius.md} - 2px)`,
              cursor: 'pointer',
              transition: transitions.fast,
              backgroundColor: value === v ? colors.primary.main : 'transparent',
              color: value === v ? colors.neutral.white : themeColors.text.secondary,
              '&:hover': {
                backgroundColor: value === v ? colors.primary.dark : themeColors.neutral[200],
              },
            }}
          >
            <Icon size={16} weight={value === v ? 'fill' : 'regular'} />
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};

export default DensityToggle;
