import { SxProps, Theme } from '@mui/material';
import { typography, vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

export type Styles = {
    [key:string]: SxProps;
};

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

const hideScrollbar = {
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

export const homepageStyles: Record<string, SxProps<Theme>> = {
  page: {
    minHeight: '100vh',
    backgroundColor: vault.bg,
    color: vault.fg,
  },

  // ─── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    padding: `80px ${vaultLayout.gutter} 40px`,
    textAlign: 'center',
    background: vaultEffects.heroGlow,
    [vaultMedia.mobile]: { padding: `40px ${vaultLayout.gutterMobile} 24px` },
  },
  eyebrow: {
    marginBottom: '22px',
    [vaultMedia.mobile]: { marginBottom: '14px', fontSize: 11 },
  },
  title: {
    maxWidth: 900,
    margin: '0 auto',
    fontSize: 68,
    lineHeight: 1,
    fontWeight: 600,
    letterSpacing: '-0.035em',
    textWrap: 'balance',
    color: vault.fg,
    '@media (max-width: 900px)': { fontSize: 54 },
    [vaultMedia.mobile]: { fontSize: 40 },
  },
  titleMuted: {
    color: vault.faint,
  },

  // ─── Search ────────────────────────────────────────────────────────────────
  search: {
    maxWidth: 720,
    height: 60,
    margin: '40px auto 0',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '0 10px 0 22px',
    borderRadius: vaultRadii.search,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.lineStrong}`,
    boxShadow: vaultEffects.searchShadow,
    color: vault.muted,
    transition: `border-color ${vaultEffects.transition}`,
    '&:focus-within': { borderColor: vault.accent },
    [vaultMedia.mobile]: {
      height: 52,
      marginTop: '24px',
      gap: '10px',
      padding: '0 6px 0 16px',
      borderRadius: '13px',
    },
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: vault.fg,
    font: 'inherit',
    fontSize: 16,
    '&::placeholder': { color: vault.faint, opacity: 1 },
    '&::-webkit-search-cancel-button': { display: 'none' },
  },
  kbd: {
    flex: 'none',
    padding: '3px 7px',
    borderRadius: '5px',
    border: `1px solid ${vault.lineStrong}`,
    fontFamily: typography.fontFamily.mono,
    fontSize: 11,
    lineHeight: 1.2,
    color: vault.faint,
    [vaultMedia.mobile]: { display: 'none' },
  },
  randomButton: {
    flex: 'none',
    minWidth: 0,
    height: 40,
    padding: '0 16px',
    gap: '6px',
    borderRadius: '9px',
    backgroundColor: vault.accent,
    color: vault.onAccent,
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': { backgroundColor: vault.accent, filter: 'brightness(1.08)', boxShadow: 'none' },
    ...focusRing,
    [vaultMedia.mobile]: { width: 40, padding: 0, borderRadius: '10px' },
  },
  // "Random" text is dropped on mobile, leaving the ↻ icon button.
  randomLabel: {
    [vaultMedia.mobile]: {
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
    },
  },

  // ─── Filter chips ──────────────────────────────────────────────────────────
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
    [vaultMedia.mobile]: {
      flexWrap: 'nowrap',
      justifyContent: 'flex-start',
      overflowX: 'auto',
      margin: `20px -${vaultLayout.gutterMobile} 0`,
      padding: `0 ${vaultLayout.gutterMobile} 2px`,
      ...hideScrollbar,
    },
  },
  flavorLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '22px',
    padding: '4px 2px',
    borderRadius: '6px',
    fontSize: 13,
    color: vault.muted,
    textDecoration: 'none',
    transition: `color ${vaultEffects.transition}`,
    '& svg': { color: vault.accentText },
    '&:hover': { color: vault.fg },
    '&:hover .flavor-link-arrow, &:focus-visible .flavor-link-arrow': { transform: 'translateX(3px)' },
    [vaultMedia.reducedMotion]: {
      '&:hover .flavor-link-arrow, &:focus-visible .flavor-link-arrow': { transform: 'none' },
    },
    ...focusRing,
    [vaultMedia.mobile]: { marginTop: '16px', minHeight: vaultLayout.tapTarget, fontSize: 12 },
  },
  flavorLinkArrow: {
    color: vault.accentText,
    transition: `transform ${vaultEffects.transition}`,
  },
  desktopOnly: {
    [vaultMedia.mobile]: { display: 'none' },
  },
  mobileOnly: {
    display: 'none',
    [vaultMedia.mobile]: { display: 'inline-flex' },
  },
  // ─── Toolbar ───────────────────────────────────────────────────────────────
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: `24px ${vaultLayout.gutter}`,
    borderTop: `1px solid ${vault.line}`,
    [vaultMedia.mobile]: { padding: `16px ${vaultLayout.gutterMobile}`, gap: '8px' },
  },
  letterRail: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2px',
    [vaultMedia.mobile]: { display: 'none' },
  },
  letterButton: {
    padding: '5px 7px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: typography.fontFamily.mono,
    fontSize: 12,
    lineHeight: 1.2,
    color: vault.faint,
    transition: `color ${vaultEffects.transition}, background-color ${vaultEffects.transition}`,
    '&:hover': { color: vault.fg },
    '&[aria-pressed="true"]': { color: vault.accentText, backgroundColor: vault.glow },
    ...focusRing,
  },
  resultCount: {
    display: 'none',
    [vaultMedia.mobile]: { display: 'block', whiteSpace: 'nowrap' },
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  letterSelect: {
    display: 'none',
    [vaultMedia.mobile]: {
      display: 'block',
      height: 40,
      padding: '0 28px 0 12px',
      borderRadius: '9px',
      border: `1px solid ${vault.lineStrong}`,
      backgroundColor: vault.surface,
      color: vault.fg,
      fontFamily: typography.fontFamily.mono,
      fontSize: 12,
      appearance: 'none',
      backgroundImage: `linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)`,
      backgroundPosition: 'right 14px center, right 10px center',
      backgroundSize: '4px 4px, 4px 4px',
      backgroundRepeat: 'no-repeat',
      ...focusRing,
    },
  },

  // ─── Active filters ────────────────────────────────────────────────────────
  activeRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    padding: `0 ${vaultLayout.gutter} 20px`,
    [vaultMedia.mobile]: { padding: `0 ${vaultLayout.gutterMobile} 16px` },
  },
  activeCount: {
    marginRight: '4px',
    [vaultMedia.mobile]: { display: 'none' },
  },
  activeChip: {
    height: 30,
    borderRadius: vaultRadii.pill,
    backgroundColor: vault.chip,
    border: `1px solid ${vault.lineStrong}`,
    color: vault.fg,
    fontSize: 12,
    '& .MuiChip-deleteIcon': { color: vault.faint, '&:hover': { color: vault.fg } },
  },
  clearAll: {
    minWidth: 0,
    padding: '4px 8px',
    color: vault.muted,
    fontSize: 12,
    textTransform: 'none',
    '&:hover': { color: vault.fg, backgroundColor: vault.chip },
  },

  // ─── Grid ──────────────────────────────────────────────────────────────────
  gridSection: {
    padding: `0 ${vaultLayout.gutter} 64px`,
    [vaultMedia.mobile]: { padding: `0 ${vaultLayout.gutterMobile} 40px` },
  },
  statusMessage: {
    padding: `80px ${vaultLayout.gutter}`,
    textAlign: 'center',
    color: vault.muted,
    fontSize: 16,
  },

  // ─── Menus, popovers, fields ───────────────────────────────────────────────
  menu: {
    '& .MuiPaper-root': {
      marginTop: '6px',
      maxHeight: 420,
      minWidth: 220,
      backgroundColor: vault.surface,
      border: `1px solid ${vault.line}`,
      borderRadius: vaultRadii.card,
      boxShadow: `0 20px 60px ${vault.shadow}`,
    },
    '& .MuiList-root': { padding: '6px' },
  },
  menuItem: {
    minHeight: 36,
    borderRadius: '7px',
    fontSize: 14,
    color: vault.fg,
    '&:hover': { backgroundColor: vault.chip },
    '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: vault.chipStrong, fontWeight: 600 },
  },
  listSubheader: {
    lineHeight: '32px',
    backgroundColor: vault.surface,
    fontFamily: typography.fontFamily.mono,
    fontSize: 11,
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    color: vault.faint,
  },
  popover: {
    '& .MuiPaper-root': {
      marginTop: '6px',
      width: 320,
      padding: '12px',
      backgroundColor: vault.surface,
      border: `1px solid ${vault.line}`,
      borderRadius: vaultRadii.card,
      boxShadow: `0 20px 60px ${vault.shadow}`,
    },
  },
  field: {
    '& .MuiOutlinedInput-root': {
      minHeight: 40,
      borderRadius: '9px',
      backgroundColor: vault.surface,
      color: vault.fg,
      fontSize: 14,
      '& fieldset': { borderColor: vault.lineStrong },
      '&:hover fieldset': { borderColor: vault.faint },
      '&.Mui-focused fieldset': { borderColor: vault.accent, borderWidth: 1 },
    },
    '& .MuiSvgIcon-root': { color: vault.faint },
  },
  formStack: {
    display: 'grid',
    gap: '22px',
  },
  chipWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },

  // ─── Mobile filter sheet ───────────────────────────────────────────────────
  filterSheetPaper: {
    maxHeight: '85vh',
    borderRadius: '16px 16px 0 0',
    backgroundColor: vault.surface,
    backgroundImage: 'none',
    borderTop: `1px solid ${vault.line}`,
  },
  filterSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: vaultRadii.pill,
    backgroundColor: vault.lineStrong,
  },
  filterSheetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `8px ${vaultLayout.gutterMobile} 16px`,
  },
  filterSheetTitle: {
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: '-0.02em',
    color: vault.fg,
  },
  filterSheetContent: {
    padding: `0 ${vaultLayout.gutterMobile} 20px`,
  },
  filterSheetActions: {
    position: 'sticky',
    bottom: 0,
    padding: `14px ${vaultLayout.gutterMobile} calc(14px + env(safe-area-inset-bottom))`,
    borderTop: `1px solid ${vault.line}`,
    backgroundColor: vault.surface,
  },
  doneButton: {
    width: '100%',
    height: 48,
    borderRadius: '10px',
    backgroundColor: vault.accent,
    color: vault.onAccent,
    fontSize: 15,
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': { backgroundColor: vault.accent, filter: 'brightness(1.08)', boxShadow: 'none' },
  },

  // ─── Scroll to top ─────────────────────────────────────────────────────────
  scrollToTop: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 1000,
    backgroundColor: vault.surface,
    color: vault.fg,
    border: `1px solid ${vault.lineStrong}`,
    boxShadow: `0 12px 30px ${vault.shadow}`,
    '&:hover': { backgroundColor: vault.surface, borderColor: vault.accent },
    [vaultMedia.mobile]: { bottom: 16, right: 16 },
  },
};
