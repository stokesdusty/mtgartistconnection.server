import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { typography, vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

const panel = {
  borderRadius: vaultRadii.panel,
  backgroundColor: vault.surface,
  border: `1px solid ${vault.line}`,
  color: vault.fg,
  textDecoration: 'none',
};

const linkedPanel = {
  cursor: 'pointer',
  transition: `border-color ${vaultEffects.transition}, box-shadow ${vaultEffects.transition}`,
  '&:hover': { borderColor: vault.accent, boxShadow: `0 12px 34px ${vault.glow}` },
  ...focusRing,
};

export const dashboardStyles: Record<string, SystemStyleObject<Theme>> = {
  page: {
    minHeight: '100vh',
    color: vault.fg,
    background: `${vaultEffects.heroGlowLeft}, ${vault.bg}`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 420px, auto',
  },
  inner: {
    maxWidth: 900,
    mx: 'auto',
    padding: `64px ${vaultLayout.gutter} 72px`,
    [vaultMedia.mobile]: { padding: `40px ${vaultLayout.gutterMobile} 48px` },
  },
  errorPanel: {
    ...panel,
    padding: '28px',
    textAlign: 'center',
    fontSize: 15,
    color: vault.muted,
  },

  // ─── Greeting ──────────────────────────────────────────────────────────────
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
  titleFaint: {
    color: vault.faint,
  },

  // ─── Quick stats ───────────────────────────────────────────────────────────
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    margin: '36px 0 48px',
    [vaultMedia.mobile]: { gap: '8px', margin: '28px 0 40px' },
  },
  stat: {
    ...panel,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '20px',
    [vaultMedia.mobile]: { padding: '14px', gap: '8px' },
  },
  statLinked: linkedPanel,
  statValue: {
    fontSize: 40,
    lineHeight: 1,
    fontWeight: 600,
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
    [vaultMedia.mobile]: { fontSize: 28 },
  },

  // ─── Sections ──────────────────────────────────────────────────────────────
  section: {
    marginBottom: '48px',
    [vaultMedia.mobile]: { marginBottom: '40px' },
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '12px',
    paddingBottom: '12px',
    marginBottom: '4px',
    borderBottom: `1px solid ${vault.lineStrong}`,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: '-0.02em',
    color: vault.fg,
  },
  sectionLink: {
    color: vault.accentText,
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
    ...focusRing,
  },
  empty: {
    padding: '20px 0',
    fontSize: 15,
    color: vault.muted,
  },

  // ─── Rows (signings + followed artists) ────────────────────────────────────
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 12px',
    margin: '0 -12px',
    borderRadius: vaultRadii.card,
    borderBottom: `1px solid ${vault.line}`,
    color: vault.fg,
    textDecoration: 'none',
    transition: `background-color ${vaultEffects.transition}`,
    '&:hover': { backgroundColor: vault.chip },
    '&:hover .dashboard-row-arrow': { color: vault.fg },
    ...focusRing,
    [vaultMedia.mobile]: { gap: '12px' },
  },
  dateBlock: {
    width: 56,
    flex: 'none',
    textAlign: 'center',
    padding: '8px 0',
    borderRadius: vaultRadii.input,
    backgroundColor: vault.chip,
    border: `1px solid ${vault.line}`,
    [vaultMedia.mobile]: { width: 50 },
  },
  dateBlockMonth: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 10,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: vault.accentText,
  },
  dateBlockDay: {
    fontSize: 22,
    fontWeight: 600,
    lineHeight: 1.2,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
  },
  rowTitleLine: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px 10px',
    maxWidth: '100%',
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
    color: vault.fg,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    [vaultMedia.mobile]: { fontSize: 16 },
  },
  rowMeta: {
    fontSize: 14,
    color: vault.muted,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: vault.chipStrong,
    border: `1px solid ${vault.line}`,
    display: 'grid',
    placeItems: 'center',
    flex: 'none',
    fontSize: 12,
    fontWeight: 600,
    color: vault.muted,
    textTransform: 'uppercase',
  },
  arrow: {
    flex: 'none',
    display: 'flex',
    color: vault.faint,
    transition: `color ${vaultEffects.transition}`,
  },

  // ─── Tool launcher ─────────────────────────────────────────────────────────
  tools: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '16px',
    [vaultMedia.tablet]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '@media (max-width: 420px)': { gridTemplateColumns: '1fr' },
  },
  tool: {
    ...panel,
    ...linkedPanel,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '18px',
    borderRadius: vaultRadii.card,
  },
  toolIcon: {
    display: 'grid',
    placeItems: 'center',
    width: 38,
    height: 38,
    marginBottom: '10px',
    borderRadius: vaultRadii.input,
    backgroundColor: vault.glow,
    border: `1px solid ${vault.line}`,
    color: vault.accentText,
  },
  toolLabel: {
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: vault.fg,
  },
  toolDesc: {
    fontSize: 13,
    lineHeight: 1.45,
    color: vault.muted,
  },
};
