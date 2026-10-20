import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { typography, vault, vaultEffects, vaultMedia } from './design-tokens';
import { artistDashboardStyles } from './artist-dashboard-styles';

// The signature examples editor, shared by the artist dashboard and the admin
// EditArtist page. Inputs and buttons match the dashboard.
export const signatureManagerStyles: Record<string, SystemStyleObject<Theme>> = {
  input: artistDashboardStyles.input,
  button: artistDashboardStyles.button,
  error: artistDashboardStyles.saveError,

  list: {
    listStyle: 'none',
    margin: '0 0 20px',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  item: {
    display: 'grid',
    gridTemplateColumns: '56px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '14px',
    [vaultMedia.mobile]: { gridTemplateColumns: '48px minmax(0, 1fr)', '& > :last-child': { gridColumn: '1 / -1' } },
  },
  thumb: {
    width: '100%',
    aspectRatio: '63 / 88',
    objectFit: 'cover',
    borderRadius: '6px',
    border: `1px solid ${vault.line}`,
    background: vaultEffects.stripes,
    display: 'block',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    justifyContent: 'flex-end',
  },
  iconButton: {
    color: vault.muted,
    '&:hover': { color: vault.fg },
  },
  addRow: {
    display: 'grid',
    gridTemplateColumns: '56px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '14px',
    paddingTop: '16px',
    borderTop: `1px solid ${vault.line}`,
    [vaultMedia.mobile]: { gridTemplateColumns: '48px minmax(0, 1fr)', '& > :last-child': { gridColumn: '1 / -1' } },
  },
  pickButton: {
    width: '100%',
    aspectRatio: '63 / 88',
    minWidth: 0,
    padding: 0,
    borderRadius: '6px',
    border: `1px dashed ${vault.line}`,
    color: vault.muted,
    overflow: 'hidden',
    '&:hover': { borderColor: vault.muted, backgroundColor: 'transparent' },
  },
  hint: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 11,
    color: vault.muted,
    marginTop: '10px',
  },
};
