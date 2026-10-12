import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { typography, vault, vaultEffects, vaultMedia } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

export const priceChipStyles: Record<string, SystemStyleObject<Theme>> = {
  // Side-by-side vendor chips that share a row equally.
  row: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(0, 1fr)',
    gap: '6px',
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    minWidth: 0,
    padding: '0 6px',
    borderRadius: '6px',
    backgroundColor: vault.chip,
    border: `1px solid ${vault.line}`,
    fontFamily: typography.fontFamily.mono,
    fontSize: 11,
    lineHeight: 1.2,
    color: vault.fg,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    transition: `background-color ${vaultEffects.transition}, border-color ${vaultEffects.transition}`,
    '&:hover': { backgroundColor: vault.chipStrong, borderColor: vault.lineStrong },
    '& .price-label': { color: vault.faint },
    '& .price-value': { overflow: 'hidden', textOverflow: 'ellipsis' },
    ...focusRing,
    [vaultMedia.mobile]: { fontSize: 12 },
  },
  // Label above value, for columns too narrow to fit three chips across.
  stacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '2px',
    padding: '0 8px',
    '& .price-value': { maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' },
  },
};
