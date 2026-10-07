import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

export const authStyles: Record<string, SystemStyleObject<Theme>> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: `80px ${vaultLayout.gutter} 72px`,
    color: vault.fg,
    background: `${vaultEffects.heroGlow}, ${vault.bg}`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 560px, auto',
    [vaultMedia.mobile]: { padding: `40px ${vaultLayout.gutterMobile} 48px` },
  },
  inner: {
    width: '100%',
    maxWidth: 440,
  },

  // ─── Header ────────────────────────────────────────────────────────────────
  header: {
    textAlign: 'center',
    marginBottom: '28px',
    [vaultMedia.mobile]: { marginBottom: '22px' },
  },
  eyebrow: {
    marginBottom: '16px',
    [vaultMedia.mobile]: { marginBottom: '12px' },
  },
  title: {
    margin: 0,
    fontSize: 48,
    lineHeight: 1,
    fontWeight: 600,
    letterSpacing: '-0.035em',
    color: vault.fg,
    [vaultMedia.mobile]: { fontSize: 38 },
  },
  titleMuted: {
    color: vault.faint,
  },
  subtitle: {
    margin: '14px 0 0',
    fontSize: 15,
    color: vault.muted,
  },

  // ─── Card ──────────────────────────────────────────────────────────────────
  card: {
    padding: '24px',
    borderRadius: vaultRadii.panel,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.line}`,
    boxShadow: `0 20px 60px ${vault.shadow}`,
    [vaultMedia.mobile]: { padding: '18px' },
  },
  tabs: {
    marginBottom: '22px',
  },

  // ─── Sign-up info ──────────────────────────────────────────────────────────
  signupInfo: {
    marginBottom: '22px',
    padding: '16px',
    borderRadius: vaultRadii.card,
    backgroundColor: vault.glow,
    border: `1px solid ${vault.line}`,
  },
  signupInfoText: {
    margin: '0 0 10px',
    fontSize: 14,
    lineHeight: 1.5,
    color: vault.fg,
  },
  signupInfoList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    '& li': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      fontSize: 14,
      lineHeight: 1.45,
      color: vault.muted,
    },
    '& svg': {
      flex: 'none',
      marginTop: '2px',
      color: vault.accentText,
    },
  },
  signupInfoFootnote: {
    margin: '12px 0 0',
    fontSize: 12,
    lineHeight: 1.5,
    color: vault.faint,
  },

  // ─── Form ──────────────────────────────────────────────────────────────────
  error: {
    marginBottom: '18px',
    padding: '12px 16px',
    borderRadius: vaultRadii.input,
    backgroundColor: vault.dangerBg,
    border: `1px solid ${vault.danger}`,
    color: vault.danger,
    fontSize: 14,
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
      minHeight: 46,
      borderRadius: '9px',
      backgroundColor: vault.bg,
      color: vault.fg,
      fontSize: 15,
      '& fieldset': { borderColor: vault.lineStrong },
      '&:hover fieldset': { borderColor: vault.faint },
      '&.Mui-focused fieldset': { borderColor: vault.accent, borderWidth: 1 },
      '&.Mui-error fieldset': { borderColor: vault.danger },
      '&.Mui-disabled': { opacity: 0.7 },
    },
    '& .MuiFormHelperText-root': {
      marginLeft: 0,
      marginTop: '6px',
      fontSize: 12,
      '&.Mui-error': { color: vault.danger },
    },
    // Keep browser autofill on the field colour instead of the default yellow/blue.
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
      WebkitBoxShadow: `0 0 0 1000px ${vault.bg} inset`,
      WebkitTextFillColor: vault.fg,
      caretColor: vault.fg,
      transition: 'background-color 5000s ease-in-out 0s',
    },
  },
  submitButton: {
    width: '100%',
    height: 46,
    marginTop: '22px',
    borderRadius: '9px',
    backgroundColor: vault.accent,
    color: vault.onAccent,
    textTransform: 'none',
    fontSize: 15,
    fontWeight: 600,
    boxShadow: 'none',
    '&:hover': { backgroundColor: vault.accent, boxShadow: `0 0 0 4px ${vault.glow}` },
    '&.Mui-disabled': { backgroundColor: vault.accent, color: vault.onAccent, opacity: 0.7 },
    ...focusRing,
  },
  switchPrompt: {
    margin: '20px 0 0',
    textAlign: 'center',
    fontSize: 14,
    color: vault.muted,
  },
  switchLink: {
    padding: 0,
    border: 'none',
    background: 'none',
    color: vault.accentText,
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
    borderRadius: '4px',
    '&:hover': { textDecoration: 'underline' },
    ...focusRing,
  },
};
