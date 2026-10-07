import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

// Hero stacks the info panel under the title here; grid drops to 2 columns.
const narrow = '@media (max-width: 720px)';

export const eventDetailStyles: Record<string, SystemStyleObject<Theme>> = {
  page: {
    minHeight: '100vh',
    color: vault.fg,
    // The glow starts at the very top so the back link sits inside it, rather
    // than above a hard edge where the hero begins.
    background: `${vaultEffects.heroGlowLeft}, ${vault.bg}`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 480px, auto',
  },
  statusMessage: {
    padding: `40px ${vaultLayout.gutter} 64px`,
    fontSize: 16,
    color: vault.muted,
    [vaultMedia.mobile]: { padding: `32px ${vaultLayout.gutterMobile} 40px` },
  },

  // ─── Back link ─────────────────────────────────────────────────────────────
  backRow: {
    padding: `28px ${vaultLayout.gutter} 0`,
    [vaultMedia.mobile]: { padding: `20px ${vaultLayout.gutterMobile} 0` },
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: 13,
    color: vault.muted,
    textDecoration: 'none',
    borderRadius: '4px',
    transition: `color ${vaultEffects.transition}`,
    '&:hover': { color: vault.fg },
    ...focusRing,
    [vaultMedia.mobile]: { minHeight: vaultLayout.tapTarget, fontSize: 14 },
  },

  // ─── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 340px',
    alignItems: 'end',
    gap: '40px',
    padding: `40px ${vaultLayout.gutter} 48px`,
    borderBottom: `1px solid ${vault.line}`,
    [narrow]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
      alignItems: 'stretch',
      gap: '28px',
    },
    [vaultMedia.mobile]: {
      padding: `20px ${vaultLayout.gutterMobile} 32px`,
      borderBottom: 'none',
    },
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    [vaultMedia.mobile]: { marginBottom: '10px' },
  },
  title: {
    margin: 0,
    fontSize: 72,
    lineHeight: 0.95,
    fontWeight: 600,
    letterSpacing: '-0.04em',
    color: vault.fg,
    overflowWrap: 'anywhere',
    [vaultMedia.tablet]: { fontSize: 60 },
    [vaultMedia.mobile]: { fontSize: 46 },
  },
  siteLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '24px',
    paddingBottom: '2px',
    fontSize: 14,
    color: vault.muted,
    textDecoration: 'none',
    borderBottom: `1px solid ${vault.lineStrong}`,
    transition: `color ${vaultEffects.transition}, border-color ${vaultEffects.transition}`,
    '&:hover': { color: vault.fg, borderColor: vault.fg },
    ...focusRing,
    [vaultMedia.mobile]: { marginTop: '16px', fontSize: 15 },
  },

  // ─── Info panel ────────────────────────────────────────────────────────────
  panel: {
    margin: 0,
    borderRadius: vaultRadii.panel,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.line}`,
    overflow: 'hidden',
  },
  panelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '16px',
    padding: '16px 18px',
    borderBottom: `1px solid ${vault.line}`,
    fontSize: 14,
    [vaultMedia.mobile]: { padding: '18px 16px', fontSize: 15 },
  },
  panelLabel: {
    margin: 0,
    color: vault.muted,
    flex: 'none',
  },
  panelValue: {
    margin: 0,
    color: vault.fg,
    fontWeight: 500,
    textAlign: 'right',
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
  panelAction: {
    padding: '12px',
  },
  calendarButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    minHeight: 38,
    padding: '9px 16px',
    border: 'none',
    borderRadius: vaultRadii.input,
    backgroundColor: vault.accent,
    color: vault.onAccent,
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: `filter ${vaultEffects.transition}, box-shadow ${vaultEffects.transition}`,
    '&:hover': { filter: 'brightness(1.08)', boxShadow: `0 8px 24px ${vault.glowStrong}` },
    ...focusRing,
    [vaultMedia.mobile]: { padding: '13px 16px', fontSize: 15 },
  },

  // ─── Add-to-calendar popover ───────────────────────────────────────────────
  menuPaper: {
    marginTop: '6px',
    minWidth: 240,
    borderRadius: vaultRadii.card,
    backgroundColor: vault.surface,
    backgroundImage: 'none',
    border: `1px solid ${vault.lineStrong}`,
    boxShadow: `0 20px 60px ${vault.shadow}`,
    color: vault.fg,
    '& .MuiList-root': { padding: '6px' },
  },
  menuItem: {
    gap: '10px',
    minHeight: 40,
    padding: '9px 12px',
    borderRadius: vaultRadii.input,
    fontSize: 14,
    color: vault.fg,
    '&:hover, &.Mui-focusVisible': { backgroundColor: vault.chipStrong },
    '& svg': { color: vault.accentText, flex: 'none' },
  },

  // ─── Artists attending ─────────────────────────────────────────────────────
  artistsSection: {
    padding: `40px ${vaultLayout.gutter} 64px`,
    [vaultMedia.mobile]: { padding: `0 ${vaultLayout.gutterMobile} 40px` },
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '16px',
    marginBottom: '20px',
    [vaultMedia.mobile]: { marginBottom: '16px' },
  },
  sectionTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: '-0.02em',
    color: vault.fg,
  },
  sortHint: {
    [vaultMedia.mobile]: { display: 'none' },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '20px',
    [vaultMedia.tablet]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
    [narrow]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' },
  },
  artistLink: {
    display: 'block',
    minWidth: 0,
    color: 'inherit',
    textDecoration: 'none',
    borderRadius: vaultRadii.slab,
    '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 3 },
  },
  emptyMessage: {
    gridColumn: '1 / -1',
    margin: 0,
    padding: '24px 0',
    fontSize: 14,
    color: vault.muted,
  },
  errorMessage: {
    margin: 0,
    fontSize: 14,
    color: vault.muted,
  },
};
