import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

export const settingsStyles: Record<string, SystemStyleObject<Theme>> = {
  page: {
    minHeight: '100vh',
    color: vault.fg,
    background: `${vaultEffects.heroGlowLeft}, ${vault.bg}`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 420px, auto',
  },
  inner: {
    maxWidth: 760,
    mx: 'auto',
    padding: `64px ${vaultLayout.gutter} 72px`,
    [vaultMedia.mobile]: { padding: `40px ${vaultLayout.gutterMobile} 48px` },
  },

  // ─── Header ────────────────────────────────────────────────────────────────
  eyebrow: {
    marginBottom: '16px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    [vaultMedia.mobile]: { marginBottom: '12px' },
  },
  title: {
    margin: '0 0 40px',
    fontSize: 56,
    lineHeight: 1,
    fontWeight: 600,
    letterSpacing: '-0.035em',
    color: vault.fg,
    [vaultMedia.mobile]: { fontSize: 40, marginBottom: '28px' },
  },

  // ─── Sections ──────────────────────────────────────────────────────────────
  sections: {
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

  // ─── Account info rows ─────────────────────────────────────────────────────
  infoList: {
    margin: '14px 0 0',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '120px minmax(0, 1fr)',
    alignItems: 'baseline',
    gap: '16px',
    padding: '12px 0',
    borderTop: `1px solid ${vault.line}`,
    [vaultMedia.mobile]: { gridTemplateColumns: '1fr', gap: '4px' },
  },
  infoValue: {
    margin: 0,
    fontSize: 15,
    color: vault.fg,
    overflowWrap: 'anywhere',
  },

  // ─── Form fields ───────────────────────────────────────────────────────────
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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
    '& .MuiFormHelperText-root': { marginLeft: 0, marginTop: '6px', fontSize: 12, color: vault.faint },
  },

  // ─── Preference switches ───────────────────────────────────────────────────
  prefList: {
    marginBottom: '20px',
  },
  prefRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    margin: 0,
    padding: '10px 0',
    borderTop: `1px solid ${vault.line}`,
    cursor: 'pointer',
    '&:last-of-type': { borderBottom: `1px solid ${vault.line}` },
    '& .MuiFormControlLabel-label': { fontSize: 15, color: vault.fg },
  },
  switch: {
    flex: 'none',
    '& .MuiSwitch-switchBase.Mui-checked': { color: vault.onAccent },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: vault.accent, opacity: 1 },
    '& .MuiSwitch-track': { backgroundColor: vault.faint },
    '& .MuiSwitch-switchBase.Mui-focusVisible .MuiSwitch-thumb': {
      outline: `2px solid ${vault.accent}`,
      outlineOffset: 2,
    },
  },

  // ─── Feedback + actions ────────────────────────────────────────────────────
  message: {
    marginBottom: '16px',
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
  button: {
    height: 42,
    padding: '0 20px',
    borderRadius: '9px',
    backgroundColor: vault.accent,
    color: vault.onAccent,
    textTransform: 'none',
    fontSize: 14,
    fontWeight: 600,
    boxShadow: 'none',
    '&:hover': { backgroundColor: vault.accent, boxShadow: `0 0 0 4px ${vault.glow}` },
    ...focusRing,
    [vaultMedia.mobile]: { width: '100%' },
  },
};
