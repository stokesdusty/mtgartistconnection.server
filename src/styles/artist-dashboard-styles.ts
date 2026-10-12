import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { vault, vaultMedia, vaultRadii } from './design-tokens';
import { settingsStyles } from './settings-styles';

// Same page, panel and form look as Settings, plus a few dashboard-only pieces.
export const artistDashboardStyles: Record<string, SystemStyleObject<Theme>> = {
  ...settingsStyles,

  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: '12px 20px',
    marginBottom: '40px',
    [vaultMedia.mobile]: { marginBottom: '28px' },
  },
  title: {
    ...settingsStyles.title,
    margin: 0,
    [vaultMedia.mobile]: { fontSize: 40 },
  },
  viewLink: {
    fontSize: 14,
    fontWeight: 600,
    color: vault.accentText,
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },
  verifiedChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: vaultRadii.pill,
    backgroundColor: vault.okBg,
    color: vault.ok,
    border: `1px solid ${vault.ok}`,
    fontSize: 12,
    fontWeight: 600,
  },

  linkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '4px',
    [vaultMedia.mobile]: { gridTemplateColumns: '1fr' },
  },
  noteCounter: {
    fontSize: 12,
    color: vault.faint,
    textAlign: 'right',
  },
  noteCounterOver: {
    color: vault.danger,
  },

  saveBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '20px',
    padding: '14px 0',
    backgroundColor: vault.bg,
    borderTop: `1px solid ${vault.line}`,
    [vaultMedia.mobile]: { flexDirection: 'column-reverse', alignItems: 'stretch' },
  },
  saveHint: {
    fontSize: 13,
    color: vault.muted,
  },
  saveError: {
    color: vault.danger,
  },
  button: {
    ...settingsStyles.button,
    '&.Mui-disabled': { backgroundColor: vault.accent, color: vault.onAccent, opacity: 0.45 },
  },

  logList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  logItem: {
    display: 'grid',
    gridTemplateColumns: '150px minmax(0, 1fr)',
    gap: '16px',
    padding: '10px 0',
    borderTop: `1px solid ${vault.line}`,
    fontSize: 14,
    color: vault.fg,
    [vaultMedia.mobile]: { gridTemplateColumns: '1fr', gap: '2px' },
  },
  logMeta: {
    color: vault.muted,
    fontSize: 13,
  },
};
