import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { typography, vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

// Rows stack the avatars + wishlist chip under the name here (tablet spec).
const narrow = '@media (max-width: 720px)';

export const calendarStyles: Record<string, SystemStyleObject<Theme>> = {
  page: {
    minHeight: '100vh',
    backgroundColor: vault.bg,
    color: vault.fg,
  },
  statusMessage: {
    padding: `64px ${vaultLayout.gutter}`,
    textAlign: 'center',
    fontSize: 16,
    color: vault.muted,
    [vaultMedia.mobile]: { padding: `40px ${vaultLayout.gutterMobile}` },
  },

  // ─── Header row ────────────────────────────────────────────────────────────
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '24px 32px',
    padding: `64px ${vaultLayout.gutter} 32px`,
    background: `radial-gradient(ellipse 50% 90% at 0% 0%, ${vault.glow}, transparent 70%)`,
    [vaultMedia.mobile]: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '24px',
      padding: `40px ${vaultLayout.gutterMobile} 12px`,
    },
  },
  eyebrow: {
    marginBottom: '16px',
    [vaultMedia.mobile]: { marginBottom: '12px' },
  },
  title: {
    margin: 0,
    fontSize: 60,
    lineHeight: 1,
    fontWeight: 600,
    letterSpacing: '-0.035em',
    color: vault.fg,
    [vaultMedia.mobile]: { fontSize: 40 },
  },

  // ─── Filters row ───────────────────────────────────────────────────────────
  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    padding: `0 ${vaultLayout.gutter} 28px`,
    [vaultMedia.mobile]: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      padding: `12px ${vaultLayout.gutterMobile} 24px`,
    },
  },
  select: {
    minWidth: 180,
    [vaultMedia.mobile]: { minWidth: 0 },
    '& .MuiOutlinedInput-root': {
      height: 40,
      borderRadius: '9px',
      backgroundColor: vault.surface,
      color: vault.fg,
      fontSize: 13,
      '& fieldset': { borderColor: vault.lineStrong },
      '&:hover fieldset': { borderColor: vault.faint },
      '&.Mui-focused fieldset': { borderColor: vault.accent, borderWidth: 1 },
      [vaultMedia.mobile]: { height: 44, fontSize: 14 },
    },
    '& .MuiSelect-select': { paddingLeft: '14px' },
    '& .MuiSvgIcon-root': { color: vault.faint },
  },
  selectPlaceholder: {
    color: vault.muted,
  },
  clearButton: {
    padding: '9px 12px',
    minHeight: 40,
    border: 'none',
    borderRadius: '9px',
    backgroundColor: 'transparent',
    color: vault.muted,
    fontFamily: 'inherit',
    fontSize: 13,
    cursor: 'pointer',
    transition: `background-color ${vaultEffects.transition}, color ${vaultEffects.transition}`,
    '&:hover': { backgroundColor: vault.chip, color: vault.fg },
    ...focusRing,
    [vaultMedia.mobile]: { justifySelf: 'start', paddingLeft: 0 },
  },
  filtersSpacer: {
    flex: 1,
    [vaultMedia.mobile]: { display: 'none' },
  },
  wishlistToggle: {
    margin: 0,
    gap: '10px',
    '& .MuiFormControlLabel-label': { fontSize: 13, color: vault.muted },
    [vaultMedia.mobile]: {
      gridColumn: '1 / -1',
      justifyContent: 'space-between',
      minHeight: 40,
      '& .MuiFormControlLabel-label': { fontSize: 14 },
    },
  },
  // 34×20 track with a 14px thumb, per the mock.
  switch: {
    width: 34,
    height: 20,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: '3px',
      color: vault.muted,
      '&.Mui-checked': {
        transform: 'translateX(14px)',
        color: vault.onAccent,
        '& + .MuiSwitch-track': { backgroundColor: vault.accent, borderColor: vault.accent, opacity: 1 },
      },
      '&.Mui-focusVisible + .MuiSwitch-track': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
    },
    '& .MuiSwitch-thumb': { width: 14, height: 14, boxShadow: 'none' },
    '& .MuiSwitch-track': {
      borderRadius: vaultRadii.pill,
      backgroundColor: vault.chipStrong,
      border: `1px solid ${vault.lineStrong}`,
      opacity: 1,
      boxSizing: 'border-box',
    },
  },

  // ─── Month groups ──────────────────────────────────────────────────────────
  months: {
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
    padding: `0 ${vaultLayout.gutter} 64px`,
    [vaultMedia.mobile]: { gap: '28px', padding: `0 ${vaultLayout.gutterMobile} 40px` },
  },
  monthHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    margin: 0,
    paddingBottom: '12px',
    borderBottom: `1px solid ${vault.lineStrong}`,
  },
  monthName: {
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: '-0.02em',
    color: vault.fg,
  },
  eventList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },

  // ─── Event row ─────────────────────────────────────────────────────────────
  // Grid areas let the same markup become the tablet / mobile stacks.
  row: {
    display: 'grid',
    gridTemplateColumns: '130px minmax(0, 1fr) 220px 150px 24px',
    gridTemplateAreas: '"date main people wish arrow"',
    alignItems: 'center',
    columnGap: '24px',
    rowGap: '10px',
    padding: '18px 12px',
    margin: '0 -12px',
    borderRadius: vaultRadii.card,
    borderBottom: `1px solid ${vault.line}`,
    color: 'inherit',
    textDecoration: 'none',
    transition: `background-color ${vaultEffects.transition}`,
    '&:hover': { backgroundColor: vault.chip },
    '&:hover .event-arrow': { color: vault.fg, transform: 'translateX(2px)' },
    '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: -2 },
    [vaultMedia.tablet]: {
      gridTemplateColumns: '130px minmax(0, 1fr) 150px 24px',
      gridTemplateAreas: '"date main wish arrow" "date people wish arrow"',
    },
    [narrow]: {
      gridTemplateColumns: '110px minmax(0, 1fr) 24px',
      gridTemplateAreas: '"date main arrow" "date extras arrow"',
    },
    [vaultMedia.mobile]: {
      gridTemplateColumns: '50px minmax(0, 1fr)',
      gridTemplateAreas: '"block main" "block extras"',
      alignItems: 'start',
      columnGap: '14px',
      padding: '18px 0',
      margin: 0,
      borderRadius: 0,
    },
  },
  dateCol: {
    gridArea: 'date',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    [vaultMedia.mobile]: { display: 'none' },
  },
  dateRange: {
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    [narrow]: { fontSize: 18, whiteSpace: 'normal' },
  },
  dateBlock: {
    gridArea: 'block',
    display: 'none',
    [vaultMedia.mobile]: {
      display: 'block',
      padding: '8px 0',
      textAlign: 'center',
      borderRadius: '10px',
      backgroundColor: vault.chip,
      border: `1px solid ${vault.lineStrong}`,
    },
  },
  dateBlockMonth: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 10,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: vault.accentText,
  },
  dateBlockDay: {
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 1.2,
  },
  main: {
    gridArea: 'main',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  titleLine: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px 10px',
    minWidth: 0,
    [vaultMedia.mobile]: { flexDirection: 'column', alignItems: 'flex-start' },
  },
  name: {
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
    color: vault.fg,
    [vaultMedia.mobile]: { fontSize: 16 },
  },
  // The pill sits after the name on desktop and above it on mobile.
  countdownPill: {
    order: 1,
    [vaultMedia.mobile]: { order: 0 },
  },
  meta: {
    fontSize: 13,
    color: vault.muted,
    [vaultMedia.mobile]: { fontSize: 14 },
  },
  metaDates: {
    display: 'none',
    [vaultMedia.mobile]: { display: 'inline' },
  },
  // Transparent wrapper on desktop so people / wish land in their own grid
  // areas; becomes a single row under the name at ≤720px.
  extras: {
    display: 'contents',
    [narrow]: {
      gridArea: 'extras',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      minWidth: 0,
    },
    [vaultMedia.mobile]: { marginTop: '6px' },
  },
  people: {
    gridArea: 'people',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  },
  avatars: {
    display: 'flex',
    paddingRight: '8px',
  },
  avatar: {
    width: 28,
    height: 28,
    marginRight: '-8px',
    borderRadius: '50%',
    border: `2px solid ${vault.bg}`,
    backgroundColor: vault.chipStrong,
    display: 'grid',
    placeItems: 'center',
    flex: 'none',
    fontSize: 10,
    fontWeight: 600,
    color: vault.muted,
    textTransform: 'uppercase',
  },
  artistCount: {
    fontSize: 13,
    color: vault.muted,
    whiteSpace: 'nowrap',
    [vaultMedia.mobile]: { fontSize: 14 },
  },
  wishCol: {
    gridArea: 'wish',
    display: 'flex',
  },
  wishChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    borderRadius: vaultRadii.input,
    backgroundColor: vault.chip,
    border: `1px solid ${vault.lineStrong}`,
    color: vault.fg,
    fontSize: 12,
    whiteSpace: 'nowrap',
    [vaultMedia.mobile]: { padding: '7px 12px', fontSize: 14 },
  },
  wishLabel: {
    [vaultMedia.mobile]: { display: 'none' },
  },
  arrow: {
    gridArea: 'arrow',
    display: 'flex',
    justifyContent: 'center',
    color: vault.faint,
    transition: `color ${vaultEffects.transition}, transform ${vaultEffects.transition}`,
    [vaultMedia.reducedMotion]: { transition: 'none' },
    [vaultMedia.mobile]: { display: 'none' },
  },

  scrollToTopFab: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 999,
    width: 48,
    height: 48,
    backgroundColor: vault.surface,
    color: vault.fg,
    border: `1px solid ${vault.line}`,
    boxShadow: `0 12px 30px ${vault.shadow}`,
    '&:hover': { backgroundColor: vault.surface, borderColor: vault.accent },
    [vaultMedia.mobile]: { bottom: 18, right: 18 },
  },
};
