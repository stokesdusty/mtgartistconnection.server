import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { typography, vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

const panel = {
  padding: '22px',
  borderRadius: vaultRadii.panel,
  backgroundColor: vault.surface,
  border: `1px solid ${vault.line}`,
  [vaultMedia.mobile]: { padding: '16px' },
};

export const CHART_HEIGHT = 140;

export const analyticsStyles: Record<string, SystemStyleObject<Theme>> = {
  page: {
    minHeight: '100vh',
    color: vault.fg,
    background: `${vaultEffects.heroGlowLeft}, ${vault.bg}`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 420px, auto',
  },
  inner: {
    maxWidth: 1100,
    mx: 'auto',
    padding: `64px ${vaultLayout.gutter} 72px`,
    [vaultMedia.mobile]: { padding: `40px ${vaultLayout.gutterMobile} 48px` },
  },

  // ─── Header ────────────────────────────────────────────────────────────────
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '24px 32px',
    marginBottom: '32px',
    [vaultMedia.mobile]: { flexDirection: 'column', alignItems: 'stretch', gap: '20px', marginBottom: '24px' },
  },
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
  rangeLabel: {
    marginTop: '12px',
  },

  // ─── Stat tiles ────────────────────────────────────────────────────────────
  tiles: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '20px',
    [vaultMedia.tablet]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
    [vaultMedia.mobile]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' },
  },
  tile: {
    ...panel,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: 0,
    padding: '18px 20px',
    [vaultMedia.mobile]: { padding: '14px' },
  },
  tileValue: {
    fontSize: 32,
    lineHeight: 1.1,
    fontWeight: 600,
    letterSpacing: '-0.03em',
    color: vault.fg,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    [vaultMedia.mobile]: { fontSize: 24 },
  },
  tileValueText: {
    fontSize: 20,
    letterSpacing: '-0.01em',
    paddingTop: '6px',
    paddingBottom: '5px',
    [vaultMedia.mobile]: { fontSize: 17 },
  },

  // ─── Panels ────────────────────────────────────────────────────────────────
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  panel,
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: '6px 16px',
    marginBottom: '6px',
  },
  panelTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: vault.fg,
  },
  panelNote: {
    margin: '0 0 20px',
    fontSize: 13,
    lineHeight: 1.5,
    color: vault.muted,
  },
  noData: {
    padding: '12px 0',
    fontSize: 14,
    color: vault.muted,
  },
  threeUp: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '20px',
    [vaultMedia.tablet]: { gridTemplateColumns: '1fr' },
  },

  // ─── Column chart ──────────────────────────────────────────────────────────
  chartWrap: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    columnGap: '10px',
  },
  yAxis: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    fontFamily: typography.fontFamily.mono,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    color: vault.faint,
    // Nudge the labels so they centre on the top gridline and the baseline.
    marginTop: '-7px',
    marginBottom: '-7px',
  },
  plot: {
    position: 'relative',
    height: CHART_HEIGHT,
    display: 'flex',
    alignItems: 'stretch',
    gap: '2px',
    borderTop: `1px solid ${vault.line}`,
    borderBottom: `1px solid ${vault.lineStrong}`,
    outline: 'none',
    '&:focus-visible': { boxShadow: `0 0 0 2px ${vault.accent}`, borderRadius: '4px' },
  },
  slot: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderRadius: '4px 4px 0 0',
    cursor: 'default',
  },
  slotActive: {
    backgroundColor: vault.chip,
  },
  bar: {
    width: '100%',
    maxWidth: 24,
    minHeight: 2,
    borderRadius: '4px 4px 0 0',
    backgroundColor: vault.accent,
    transition: 'height .3s ease, opacity .15s ease',
    [vaultMedia.reducedMotion]: { transition: 'none' },
  },
  barDimmed: {
    opacity: 0.45,
  },
  xAxis: {
    gridColumn: 2,
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
    fontFamily: typography.fontFamily.mono,
    fontSize: 11,
    color: vault.faint,
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    transform: 'translate(-50%, -8px)',
    zIndex: 1,
    padding: '8px 10px',
    borderRadius: vaultRadii.input,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.lineStrong}`,
    boxShadow: `0 12px 30px ${vault.shadow}`,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  tooltipDate: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 11,
    color: vault.muted,
  },
  tooltipValue: {
    marginTop: '2px',
    fontSize: 15,
    fontWeight: 600,
    color: vault.fg,
  },
  peak: {
    fontVariantNumeric: 'tabular-nums',
  },

  // ─── Table view (details) ──────────────────────────────────────────────────
  tableToggle: {
    marginTop: '16px',
    '& > summary': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer',
      listStyle: 'none',
      fontSize: 13,
      color: vault.muted,
      borderRadius: '4px',
      '&::-webkit-details-marker': { display: 'none' },
      '&::before': { content: '"▸"', fontSize: 10, transition: 'transform .15s ease' },
      '&:hover': { color: vault.fg },
      ...focusRing,
    },
    '&[open] > summary::before': { transform: 'rotate(90deg)' },
  },
  tableScroll: {
    marginTop: '12px',
    maxHeight: 280,
    overflowY: 'auto',
    borderTop: `1px solid ${vault.line}`,
  },

  // ─── Bar lists ─────────────────────────────────────────────────────────────
  barList: {
    listStyle: 'none',
    margin: '14px 0 0',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  barRowHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '12px',
    marginBottom: '6px',
  },
  barLabel: {
    minWidth: 0,
    fontSize: 14,
    color: vault.fg,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  barCount: {
    flex: 'none',
    fontFamily: typography.fontFamily.mono,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    color: vault.muted,
  },
  track: {
    height: 6,
    borderRadius: vaultRadii.pill,
    backgroundColor: vault.chipStrong,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: vaultRadii.pill,
    backgroundColor: vault.accent,
    transition: 'width .3s ease',
    [vaultMedia.reducedMotion]: { transition: 'none' },
  },

  // ─── Tables ────────────────────────────────────────────────────────────────
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '8px',
    '& th': {
      padding: '10px 8px',
      textAlign: 'left',
      fontFamily: typography.fontFamily.mono,
      fontSize: 11,
      fontWeight: 400,
      letterSpacing: '.1em',
      textTransform: 'uppercase',
      color: vault.faint,
      borderBottom: `1px solid ${vault.lineStrong}`,
    },
    '& td': {
      padding: '10px 8px',
      fontSize: 14,
      color: vault.fg,
      borderBottom: `1px solid ${vault.line}`,
    },
    '& tbody tr:hover td': { backgroundColor: vault.chip },
    '& .num': { textAlign: 'right', fontFamily: typography.fontFamily.mono, fontSize: 13, fontVariantNumeric: 'tabular-nums' },
    '& .rank': { width: 40, fontFamily: typography.fontFamily.mono, fontSize: 12, color: vault.faint, fontVariantNumeric: 'tabular-nums' },
    '& a': {
      color: vault.fg,
      textDecoration: 'none',
      borderRadius: '4px',
      '&:hover': { color: vault.accentText },
      ...focusRing,
    },
  },
};
