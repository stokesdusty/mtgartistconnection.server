import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { typography, vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

type Sx = SystemStyleObject<Theme>;

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

// Compact field chrome shared by the grid's text inputs and selects.
const fieldOutline = {
  '& .MuiOutlinedInput-notchedOutline': { borderColor: vault.line },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: vault.lineStrong },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: vault.accent, borderWidth: 1 },
  '&.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
};

const iconButton: Sx = {
  padding: '5px',
  borderRadius: vaultRadii.input,
  color: vault.faint,
  transition: `color ${vaultEffects.transition}, background-color ${vaultEffects.transition}`,
  '&:hover': { color: vault.fg, backgroundColor: vault.chip },
  ...focusRing,
};

export const signingTrackerStyles: Record<string, Sx> = {
  page: {
    minHeight: '100vh',
    color: vault.fg,
    background: `${vaultEffects.heroGlowLeft}, ${vault.bg}`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 420px, auto',
  },
  inner: {
    maxWidth: 1680,
    mx: 'auto',
    padding: `64px ${vaultLayout.gutter} 72px`,
    [vaultMedia.mobile]: { padding: `40px ${vaultLayout.gutterMobile} 48px` },
  },
  loading: {
    fontSize: 15,
    color: vault.muted,
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
  subtitle: {
    margin: '12px 0 0',
    fontSize: 15,
    color: vault.muted,
  },
  actions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    [vaultMedia.mobile]: { '& > *': { flex: 1 } },
  },
  primaryButton: {
    height: 42,
    padding: '0 18px',
    borderRadius: '9px',
    backgroundColor: vault.accent,
    color: vault.onAccent,
    textTransform: 'none',
    fontSize: 14,
    fontWeight: 600,
    boxShadow: 'none',
    '&:hover': { backgroundColor: vault.accent, boxShadow: `0 0 0 4px ${vault.glow}` },
    ...focusRing,
  },
  secondaryButton: {
    height: 42,
    padding: '0 16px',
    borderRadius: '9px',
    border: `1px solid ${vault.lineStrong}`,
    backgroundColor: 'transparent',
    color: vault.fg,
    textTransform: 'none',
    fontSize: 14,
    fontWeight: 500,
    '&:hover': { backgroundColor: vault.chip, borderColor: vault.faint },
    ...focusRing,
  },
  notice: {
    marginBottom: '20px',
    padding: '12px 16px',
    borderRadius: vaultRadii.card,
    backgroundColor: vault.chip,
    border: `1px solid ${vault.line}`,
    fontSize: 14,
    color: vault.muted,
  },
  emptyPanel: {
    padding: '40px 24px',
    borderRadius: vaultRadii.panel,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.line}`,
    textAlign: 'center',
    fontSize: 15,
    color: vault.muted,
  },
  batchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  // ─── Archived section ──────────────────────────────────────────────────────
  archivedSection: {
    marginTop: '40px',
  },
  archivedToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    padding: '6px 0',
    border: 'none',
    background: 'none',
    color: vault.muted,
    fontFamily: 'inherit',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    '&:hover': { color: vault.fg },
    ...focusRing,
  },

  // ─── Batch panel ───────────────────────────────────────────────────────────
  panel: {
    overflow: 'hidden',
    borderRadius: vaultRadii.panel,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.line}`,
    boxShadow: `0 12px 30px ${vault.shadow}`,
  },
  panelArchived: {
    backgroundColor: vault.chip,
    boxShadow: 'none',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px 10px',
    padding: '12px 14px',
  },
  panelHeaderOpen: {
    borderBottom: `1px solid ${vault.line}`,
  },
  dragHandle: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 2px',
    color: vault.faint,
    cursor: 'grab',
    touchAction: 'none',
    borderRadius: '6px',
    '&:hover': { color: vault.fg },
    '&:active': { cursor: 'grabbing' },
    ...focusRing,
  },
  iconButton,
  iconButtonDanger: {
    ...iconButton,
    '&:hover': { color: vault.danger, backgroundColor: vault.dangerBg },
  },
  batchName: {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: vault.fg,
  },
  batchNameEditable: {
    cursor: 'text',
    '&:hover': { color: vault.accentText },
  },
  batchNameInput: {
    width: 260,
    '& .MuiOutlinedInput-root': {
      height: 32,
      fontSize: 15,
      fontWeight: 600,
      color: vault.fg,
      backgroundColor: vault.bg,
      borderRadius: vaultRadii.input,
      ...fieldOutline,
    },
    '& .MuiInputBase-input': { padding: '4px 10px' },
  },
  batchMeta: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 11,
    color: vault.faint,
  },
  statusChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  spacer: {
    flex: 1,
  },
  batchTotal: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 13,
    color: vault.fg,
    marginRight: '4px',
  },

  // ─── Bulk-set bar ──────────────────────────────────────────────────────────
  bulkBar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px 18px',
    padding: '10px 16px',
    backgroundColor: vault.glow,
    borderBottom: `1px solid ${vault.line}`,
  },
  bulkGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  bulkLabel: {
    fontSize: 12,
    color: vault.muted,
  },
  bulkPlaceholder: {
    fontSize: 12,
    color: vault.faint,
  },

  // ─── Grid ──────────────────────────────────────────────────────────────────
  tableScroll: {
    overflowX: 'auto',
  },
  tableInner: {
    minWidth: 1540,
  },
  headerRow: {
    padding: '10px 8px',
    backgroundColor: vault.chip,
    borderBottom: `1px solid ${vault.line}`,
  },
  colHeader: {
    padding: '0 4px',
    userSelect: 'none',
  },
  sortHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0 4px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    color: vault.faint,
    '&:hover': { color: vault.fg },
    ...focusRing,
  },
  sortHeaderActive: {
    color: vault.accentText,
  },
  row: {
    alignItems: 'center',
    padding: '4px 8px',
    borderBottom: `1px solid ${vault.line}`,
    transition: `background-color ${vaultEffects.transition}`,
    '&:hover': { backgroundColor: vault.chip },
  },
  rowStriped: {
    backgroundColor: vault.chip,
    '&:hover': { backgroundColor: vault.chipStrong },
  },
  cell: {
    padding: '0 4px',
  },
  totalCell: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0 8px',
    fontFamily: typography.fontFamily.mono,
    fontSize: 12,
    color: vault.fg,
  },
  dash: {
    padding: '0 8px',
    fontSize: 12,
    color: vault.faint,
  },
  removeCell: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyRows: {
    padding: '16px 20px',
    fontSize: 14,
    color: vault.muted,
  },

  // ─── Panel footer ──────────────────────────────────────────────────────────
  panelFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderTop: `1px solid ${vault.line}`,
  },
  addCardButton: {
    padding: '6px 12px',
    borderRadius: vaultRadii.input,
    color: vault.accentText,
    textTransform: 'none',
    fontSize: 13,
    fontWeight: 600,
    '&:hover': { backgroundColor: vault.glow },
    ...focusRing,
  },
  footerTotal: {
    fontSize: 13,
    color: vault.muted,
    '& strong': { fontFamily: typography.fontFamily.mono, fontWeight: 500, color: vault.fg },
  },
};

// ─── Field + chip helpers (spread into sx) ───────────────────────────────────

export const trackerInput: Sx = {
  '& .MuiInputBase-root': {
    height: 30,
    fontSize: 12,
    color: vault.fg,
    backgroundColor: vault.bg,
    borderRadius: '7px',
  },
  '& .MuiOutlinedInput-root': fieldOutline,
  '& .MuiInputBase-input': { padding: '4px 8px' },
  '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: vault.muted },
};

export const trackerSelect: Sx = {
  height: 30,
  width: '100%',
  fontSize: 12,
  color: vault.fg,
  backgroundColor: vault.bg,
  borderRadius: '7px',
  ...fieldOutline,
  '& .MuiSelect-select': { padding: '4px 8px', display: 'flex', alignItems: 'center' },
  '& .MuiSelect-select.Mui-disabled': { WebkitTextFillColor: vault.muted },
  '& .MuiSvgIcon-root': { color: vault.faint },
};

export const trackerMenuItem: Sx = {
  fontSize: 12,
};

/** Status/payment pill: tone colour on its tinted background. */
export const toneChip = (tone: { color: string; bg: string }): Sx => ({
  height: 20,
  borderRadius: vaultRadii.pill,
  backgroundColor: tone.bg,
  color: tone.color,
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
  '& .MuiChip-label': { padding: '0 8px' },
});
