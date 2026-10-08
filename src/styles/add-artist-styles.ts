import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

export const addArtistStyles: Record<string, SystemStyleObject<Theme>> = {
  page: {
    minHeight: '100vh',
    color: vault.fg,
    background: `${vaultEffects.heroGlowLeft}, ${vault.bg}`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 420px, auto',
  },
  inner: {
    maxWidth: 860,
    mx: 'auto',
    padding: `64px ${vaultLayout.gutter} 72px`,
    [vaultMedia.mobile]: { padding: `40px ${vaultLayout.gutterMobile} 48px` },
  },

  // ─── Header ────────────────────────────────────────────────────────────────
  eyebrow: {
    marginBottom: '16px',
    [vaultMedia.mobile]: { marginBottom: '12px' },
  },
  title: {
    margin: 0,
    fontSize: 56,
    lineHeight: 1,
    fontWeight: 600,
    letterSpacing: '-0.035em',
    color: vault.fg,
    [vaultMedia.mobile]: { fontSize: 40 },
  },
  intro: {
    margin: '16px 0 32px',
    maxWidth: 720,
    fontSize: 15,
    lineHeight: 1.6,
    color: vault.muted,
    [vaultMedia.mobile]: { fontSize: 14, marginBottom: '24px' },
  },

  // ─── Sections ──────────────────────────────────────────────────────────────
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  panel: {
    padding: '24px',
    borderRadius: vaultRadii.panel,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.line}`,
    boxShadow: `0 12px 30px ${vault.shadow}`,
    [vaultMedia.mobile]: { padding: '18px' },
  },
  sectionTitle: {
    margin: '0 0 6px',
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: '-0.02em',
    color: vault.fg,
  },
  sectionIntro: {
    margin: '0 0 20px',
    fontSize: 14,
    color: vault.muted,
  },

  // ─── Form fields ───────────────────────────────────────────────────────────
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px 20px',
    [vaultMedia.mobile]: { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0,
  },
  fieldWide: {
    gridColumn: '1 / -1',
  },
  fieldLabel: {
    cursor: 'pointer',
  },
  input: {
    '& .MuiOutlinedInput-root': {
      minHeight: 44,
      borderRadius: '9px',
      backgroundColor: vault.bg,
      color: vault.fg,
      fontSize: 14,
      '& fieldset': { borderColor: vault.lineStrong },
      '&:hover fieldset': { borderColor: vault.faint },
      '&.Mui-focused fieldset': { borderColor: vault.accent, borderWidth: 1 },
    },
    '& input::placeholder, & textarea::placeholder': { color: vault.faint, opacity: 1 },
  },

  // ─── Yes / No options ──────────────────────────────────────────────────────
  optionList: {
    margin: 0,
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '12px 0',
    borderTop: `1px solid ${vault.line}`,
    '&:last-of-type': { borderBottom: `1px solid ${vault.line}` },
    [vaultMedia.mobile]: { flexDirection: 'column', alignItems: 'stretch', gap: '10px' },
  },
  optionLabel: {
    fontSize: 15,
    color: vault.fg,
  },

  // ─── Feedback + actions ────────────────────────────────────────────────────
  message: {
    padding: '12px 16px',
    borderRadius: vaultRadii.input,
    fontSize: 14,
  },
  messageSuccess: {
    backgroundColor: vault.okBg,
    border: `1px solid ${vault.ok}`,
    color: vault.ok,
  },
  messageError: {
    backgroundColor: vault.dangerBg,
    border: `1px solid ${vault.danger}`,
    color: vault.danger,
  },
  successSpacing: {
    marginBottom: '20px',
  },
  messageDismiss: {
    float: 'right',
    marginLeft: '12px',
    padding: 0,
    border: 'none',
    background: 'none',
    color: 'inherit',
    font: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
    ...focusRing,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    height: 46,
    padding: '0 24px',
    border: 'none',
    borderRadius: '9px',
    backgroundColor: vault.accent,
    color: vault.onAccent,
    fontFamily: 'inherit',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: `box-shadow ${vaultEffects.transition}`,
    '&:hover:not(:disabled)': { boxShadow: `0 0 0 4px ${vault.glow}` },
    '&:disabled': { cursor: 'default', backgroundColor: vault.chipStrong, color: vault.faint },
    ...focusRing,
    [vaultMedia.mobile]: { width: '100%' },
  },
};
