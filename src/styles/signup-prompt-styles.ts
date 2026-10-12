import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { vault, vaultEffects, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

export const signupPromptStyles: Record<string, SystemStyleObject<Theme>> = {
  backdrop: {
    backgroundColor: 'rgba(10,9,8,.6)',
    backdropFilter: 'blur(4px)',
  },
  paper: {
    position: 'relative',
    width: '100%',
    maxWidth: 460,
    margin: '16px',
    padding: '28px',
    borderRadius: vaultRadii.panel,
    color: vault.fg,
    background: `${vaultEffects.heroGlow}, ${vault.surface}`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 220px, auto',
    border: `1px solid ${vault.line}`,
    boxShadow: `0 20px 60px ${vault.shadow}`,
    [vaultMedia.mobile]: { padding: '22px 18px' },
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    color: vault.faint,
    '&:hover': { color: vault.fg, backgroundColor: vault.chip },
    ...focusRing,
  },

  // ─── Header ────────────────────────────────────────────────────────────────
  header: {
    textAlign: 'center',
    marginBottom: '22px',
  },
  eyebrow: {
    marginBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: 36,
    lineHeight: 1,
    fontWeight: 600,
    letterSpacing: '-0.035em',
    color: vault.fg,
    [vaultMedia.mobile]: { fontSize: 30 },
  },
  titleMuted: {
    color: vault.faint,
  },
  subtitle: {
    margin: '12px 0 0',
    fontSize: 15,
    color: vault.muted,
  },

  // ─── Benefits ──────────────────────────────────────────────────────────────
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  iconWrap: {
    flex: 'none',
    display: 'grid',
    placeItems: 'center',
    width: 34,
    height: 34,
    borderRadius: vaultRadii.input,
    backgroundColor: vault.glow,
    border: `1px solid ${vault.line}`,
    color: vault.accentText,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.4,
    color: vault.fg,
  },
  itemBody: {
    fontSize: 13,
    lineHeight: 1.45,
    color: vault.muted,
  },
  footnote: {
    margin: '20px 0 0',
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: 'center',
    color: vault.faint,
  },

  // ─── Actions ───────────────────────────────────────────────────────────────
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    [vaultMedia.mobile]: { flexDirection: 'column-reverse' },
  },
  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: '9px',
    border: `1px solid ${vault.lineStrong}`,
    color: vault.muted,
    textTransform: 'none',
    fontSize: 14,
    fontWeight: 500,
    '&:hover': { backgroundColor: vault.chip, color: vault.fg },
    ...focusRing,
  },
  primaryButton: {
    flex: 1.4,
    height: 44,
    borderRadius: '9px',
    backgroundColor: vault.accent,
    color: vault.onAccent,
    textTransform: 'none',
    fontSize: 14,
    fontWeight: 600,
    '&:hover': { backgroundColor: vault.accent, boxShadow: `0 0 0 4px ${vault.glow}` },
    ...focusRing,
  },
};
