import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { typography, vault, vaultEffects, vaultMedia, vaultRadii } from './design-tokens';
import { settingsStyles } from './settings-styles';
import { signingTrackerStyles } from './signing-tracker-styles';

type Sx = SystemStyleObject<Theme>;

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

// Group order pages share the tracker's page chrome and buttons and the settings
// page's panels and fields, so they read as part of the Signing Tracker.
export const groupOrderStyles: Record<string, Sx> = {
  page: signingTrackerStyles.page,
  inner: { ...settingsStyles.inner, maxWidth: 1040 },
  loading: signingTrackerStyles.loading,
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '24px',
    fontSize: 13,
    color: vault.muted,
    textDecoration: 'none',
    '&:hover': { color: vault.fg },
    ...focusRing,
  },

  // ─── Header ────────────────────────────────────────────────────────────────
  hero: { ...signingTrackerStyles.hero, alignItems: 'flex-start' },
  eyebrow: signingTrackerStyles.eyebrow,
  title: { ...signingTrackerStyles.title, overflowWrap: 'anywhere' },
  subtitle: signingTrackerStyles.subtitle,
  eventLink: { color: 'inherit', textDecorationColor: vault.lineStrong, '&:hover': { color: vault.fg } },

  // ─── Panels and fields ─────────────────────────────────────────────────────
  sections: settingsStyles.sections,
  panel: settingsStyles.panel,
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: '8px 16px',
    marginBottom: '6px',
  },
  sectionTitle: { ...settingsStyles.sectionTitle, margin: 0 },
  sectionIntro: { ...settingsStyles.sectionIntro, margin: '6px 0 20px' },
  fields: settingsStyles.fields,
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  field: settingsStyles.field,
  fieldHint: { margin: 0, fontSize: 12, color: vault.faint },
  input: settingsStyles.input,
  message: settingsStyles.message,
  messageError: settingsStyles.messageError,
  messageSuccess: settingsStyles.messageSuccess,
  notice: signingTrackerStyles.notice,
  checkboxRow: {
    alignItems: 'flex-start',
    margin: '0 0 20px',
    '& .MuiFormControlLabel-label': { fontSize: 14, color: vault.fg, paddingTop: '9px' },
    '& .MuiCheckbox-root': { color: vault.faint },
    '& .MuiCheckbox-root.Mui-checked': { color: vault.accent },
  },

  // ─── Buttons ───────────────────────────────────────────────────────────────
  actions: { ...signingTrackerStyles.actions, flexWrap: 'wrap' },
  primaryButton: signingTrackerStyles.primaryButton,
  secondaryButton: signingTrackerStyles.secondaryButton,
  dangerButton: {
    ...signingTrackerStyles.secondaryButton,
    color: vault.danger,
    '&:hover': { backgroundColor: vault.dangerBg, borderColor: vault.danger },
  },
  smallButton: {
    ...signingTrackerStyles.secondaryButton,
    height: 32,
    padding: '0 12px',
    fontSize: 13,
  },
  textButton: {
    padding: '4px 6px',
    minWidth: 0,
    textTransform: 'none',
    fontSize: 13,
    color: vault.muted,
    '&:hover': { color: vault.fg, backgroundColor: vault.chip },
    ...focusRing,
  },

  // ─── Summary list ──────────────────────────────────────────────────────────
  summaryList: { margin: 0 },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: '170px minmax(0, 1fr)',
    gap: '16px',
    padding: '12px 0',
    borderTop: `1px solid ${vault.line}`,
    [vaultMedia.mobile]: { gridTemplateColumns: '1fr', gap: '4px' },
  },
  summaryValue: { margin: 0, fontSize: 15, color: vault.fg, overflowWrap: 'anywhere' },
  longText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.6,
    color: vault.fg,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },

  // ─── Price grid (read-only and editor) ─────────────────────────────────────
  // Scrolls sideways on its own at phone width so the page never does.
  gridScroll: {
    overflowX: 'auto',
    margin: '0 -4px',
    padding: '0 4px',
  },
  gridTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
    '& th, & td': {
      padding: '10px 8px',
      borderTop: `1px solid ${vault.line}`,
      textAlign: 'left',
      verticalAlign: 'middle',
      whiteSpace: 'nowrap',
    },
    '& thead th': {
      borderTop: 'none',
      fontFamily: typography.fontFamily.mono,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: vault.faint,
    },
    '& tbody th': { fontWeight: 500, color: vault.fg, whiteSpace: 'normal', minWidth: 140 },
  },
  slots: { fontFamily: typography.fontFamily.mono, fontSize: 12, color: vault.muted },
  slotsFull: { fontFamily: typography.fontFamily.mono, fontSize: 12, color: vault.danger },
  cellTbd: { color: vault.muted },
  cellOff: { color: vault.faint },
  cellInput: {
    width: 96,
    '& .MuiInputBase-root': { height: 34, fontSize: 14, color: vault.fg, backgroundColor: vault.bg, borderRadius: '7px' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: vault.line },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: vault.lineStrong },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: vault.accent, borderWidth: 1 },
    '& .MuiInputBase-input': { padding: '6px 8px' },
    '& .MuiInputAdornment-root p': { color: vault.faint, fontSize: 13 },
  },
  capInput: { width: 72 },
  cellControls: { display: 'flex', alignItems: 'center', gap: '2px' },
  iconButton: {
    padding: '5px',
    borderRadius: vaultRadii.input,
    color: vault.faint,
    '&:hover': { color: vault.fg, backgroundColor: vault.chip },
    ...focusRing,
  },
  offButton: {
    minWidth: 0,
    height: 34,
    padding: '0 10px',
    borderRadius: '7px',
    border: `1px dashed ${vault.lineStrong}`,
    color: vault.faint,
    textTransform: 'none',
    fontSize: 13,
    '&:hover': { color: vault.fg, borderColor: vault.faint, backgroundColor: 'transparent' },
    ...focusRing,
  },
  typeList: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '16px' },
  typeInput: { width: 170 },
  addRow: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginTop: '16px' },
  artistPicker: { flex: '1 1 260px', maxWidth: 360 },

  // ─── People lists ──────────────────────────────────────────────────────────
  personList: { listStyle: 'none', margin: 0, padding: 0 },
  personRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px 16px',
    padding: '14px 0',
    borderTop: `1px solid ${vault.line}`,
  },
  personName: { margin: 0, fontSize: 15, fontWeight: 500, color: vault.fg, overflowWrap: 'anywhere' },
  personMeta: { margin: '2px 0 0', fontSize: 13, color: vault.muted },
  personActions: { display: 'flex', gap: '8px', alignItems: 'center' },
  pill: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: vaultRadii.pill,
    backgroundColor: vault.chip,
    fontFamily: typography.fontFamily.mono,
    fontSize: 11,
    color: vault.muted,
    verticalAlign: 'middle',
  },
  pillAccent: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: vaultRadii.pill,
    backgroundColor: vault.chipStrong,
    fontFamily: typography.fontFamily.mono,
    fontSize: 11,
    color: vault.accentText,
    verticalAlign: 'middle',
  },
  emptyText: { margin: 0, padding: '14px 0 0', borderTop: `1px solid ${vault.line}`, fontSize: 14, color: vault.muted },

  // ─── Signing Tracker section ───────────────────────────────────────────────
  trackerSection: { marginBottom: '32px' },
  trackerSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '12px',
  },
  trackerSectionTitle: { margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: vault.fg },
  orderCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  orderCard: {
    display: 'block',
    padding: '16px 18px',
    borderRadius: vaultRadii.panel,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.line}`,
    color: 'inherit',
    textDecoration: 'none',
    transition: `border-color ${vaultEffects.transition}`,
    '&:hover': { borderColor: vault.lineStrong },
    ...focusRing,
  },
  orderCardName: { margin: '6px 0 4px', fontSize: 16, fontWeight: 600, color: vault.fg, overflowWrap: 'anywhere' },
  orderCardMeta: { margin: 0, fontSize: 13, color: vault.muted },
};
