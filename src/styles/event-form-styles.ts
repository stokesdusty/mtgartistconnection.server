import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { vault, vaultMedia, vaultRadii } from './design-tokens';
import { addArtistStyles } from './add-artist-styles';

// Add Event / Add Artist to Event share the Add Artist page shell and fields;
// these extras cover the date pickers, selects and their dropdowns.
export const eventFormStyles: Record<string, SystemStyleObject<Theme>> = {
  ...addArtistStyles,

  input: {
    ...addArtistStyles.input,
    '& .MuiSvgIcon-root': { color: vault.faint },
    '& .MuiIconButton-root:hover .MuiSvgIcon-root': { color: vault.fg },
  },
  fieldHelp: {
    margin: 0,
    fontSize: 12,
    color: vault.faint,
  },
  dateRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px 20px',
    [vaultMedia.mobile]: { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  // ─── Dropdowns ─────────────────────────────────────────────────────────────
  menu: {
    '& .MuiPaper-root': {
      marginTop: '6px',
      maxHeight: 420,
      backgroundColor: vault.surface,
      border: `1px solid ${vault.line}`,
      borderRadius: vaultRadii.card,
      boxShadow: `0 20px 60px ${vault.shadow}`,
    },
    '& .MuiList-root, & .MuiAutocomplete-listbox': { padding: '6px' },
  },
  menuItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    minHeight: 36,
    borderRadius: '7px',
    fontSize: 14,
    color: vault.fg,
    whiteSpace: 'normal',
    '&:hover, &.Mui-focused': { backgroundColor: vault.chip },
    '&.Mui-selected, &.Mui-selected:hover, &[aria-selected="true"]': { backgroundColor: vault.chipStrong, fontWeight: 600 },
  },
  placeholder: {
    color: vault.faint,
  },

  // ─── Status ────────────────────────────────────────────────────────────────
  status: {
    padding: '40px 0',
    fontSize: 15,
    color: vault.muted,
  },
};
