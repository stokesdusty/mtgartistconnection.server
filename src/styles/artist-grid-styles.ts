import { SxProps, Theme } from '@mui/material';
import { vault, vaultMedia } from './design-tokens';

// Grid: 4 → 3 (≤1100) → 2 (≤720), 12px gap on mobile.
// Dense packs small squares; Banner shows wide 16:9 slabs.
export const artistGridStyles: Record<string, SxProps<Theme>> = {
  link: {
    display: 'block',
    minWidth: 0,
    color: 'inherit',
    textDecoration: 'none',
    borderRadius: '14px',
    '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 3 },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '20px',
    '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
    '@media (max-width: 720px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    [vaultMedia.mobile]: { gap: '12px' },
  },
  gridDense: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '14px',
    [vaultMedia.mobile]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' },
  },
  gridBanner: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '20px',
    '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '@media (max-width: 720px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
    [vaultMedia.mobile]: { gap: '12px' },
  },
};
