import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { colors, vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

// The preview mirrors the printed page, so its paper and slots stay light in
// both themes. Filled slots match the print stylesheet (#3498db); empty ones
// use a near match for its #ccc.
export const PRINT_SLOT_COLORS = {
  filled: colors.accent.blue,
  empty: colors.neutral[300],
};

export const artistSheetStyles: Record<string, SystemStyleObject<Theme>> = {
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

  // ─── Header ────────────────────────────────────────────────────────────────
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
    margin: '12px 0 32px',
    fontSize: 15,
    color: vault.muted,
    [vaultMedia.mobile]: { marginBottom: '24px' },
  },

  // ─── Form panel ────────────────────────────────────────────────────────────
  formPanel: {
    padding: '24px',
    borderRadius: vaultRadii.panel,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.line}`,
    boxShadow: `0 12px 30px ${vault.shadow}`,
    [vaultMedia.mobile]: { padding: '18px' },
  },
  fields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '20px',
    [vaultMedia.mobile]: { gridTemplateColumns: '1fr', gap: '14px' },
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0,
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
    '& .MuiInputBase-input::placeholder': { color: vault.faint, opacity: 1 },
    '& .MuiSvgIcon-root': { color: vault.faint },
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '10px',
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
    '&.Mui-disabled': { backgroundColor: vault.chipStrong, color: vault.faint },
    ...focusRing,
  },
  secondaryButton: {
    height: 42,
    padding: '0 16px',
    borderRadius: '9px',
    border: `1px solid ${vault.lineStrong}`,
    color: vault.fg,
    textTransform: 'none',
    fontSize: 14,
    fontWeight: 500,
    '&:hover': { backgroundColor: vault.chip, borderColor: vault.faint },
    ...focusRing,
  },
  clearButton: {
    height: 42,
    marginLeft: 'auto',
    padding: '0 12px',
    borderRadius: '9px',
    color: vault.muted,
    textTransform: 'none',
    fontSize: 14,
    fontWeight: 500,
    '&:hover': { color: vault.danger, backgroundColor: vault.dangerBg },
    ...focusRing,
  },
  slotCount: {
    fontVariantNumeric: 'tabular-nums',
    opacity: 0.75,
    marginLeft: '6px',
  },
  hint: {
    marginTop: '14px',
    fontSize: 13,
    color: vault.muted,
  },

  // ─── Preview ───────────────────────────────────────────────────────────────
  previewSection: {
    marginTop: '48px',
    [vaultMedia.mobile]: { marginTop: '40px' },
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '12px',
    paddingBottom: '12px',
    marginBottom: '20px',
    borderBottom: `1px solid ${vault.lineStrong}`,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: '-0.02em',
    color: vault.fg,
  },
  // Slab-style mount around the white page.
  paperMount: {
    padding: '10px',
    borderRadius: vaultRadii.slabSignature,
    background: vaultEffects.slabFrame,
    border: `1px solid ${vault.line}`,
    boxShadow: `0 20px 50px ${vault.shadow}`,
    [vaultMedia.mobile]: { padding: '5px', borderRadius: '12px' },
  },
  paper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '6px',
    padding: '14px',
    borderRadius: vaultRadii.input,
    backgroundColor: colors.neutral.white,
    [vaultMedia.mobile]: { padding: '8px', gap: '4px' },
  },

  // ─── Slot (always print colours) ───────────────────────────────────────────
  slot: {
    position: 'relative',
    minHeight: 72,
    padding: '6px 8px',
    boxSizing: 'border-box',
    backgroundColor: colors.neutral.white,
    borderLeft: `4px solid ${PRINT_SLOT_COLORS.empty}`,
    '&:hover .slot-delete, &:focus-within .slot-delete': { opacity: 1 },
    [vaultMedia.mobile]: { minHeight: 64, padding: '4px 5px', borderLeftWidth: 3 },
  },
  slotFilled: {
    borderLeftColor: PRINT_SLOT_COLORS.filled,
  },
  slotLine: {
    fontSize: 11,
    lineHeight: 1.6,
    color: colors.neutral[700],
    overflowWrap: 'anywhere',
    '& strong': { fontWeight: 600 },
    [vaultMedia.mobile]: { fontSize: 9 },
  },
  slotDelete: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 20,
    height: 20,
    display: 'grid',
    placeItems: 'center',
    padding: 0,
    border: 'none',
    borderRadius: '50%',
    background: 'none',
    color: colors.neutral[500],
    cursor: 'pointer',
    opacity: 0,
    transition: `opacity ${vaultEffects.transition}, color ${vaultEffects.transition}`,
    '&:hover': { color: colors.accent.red, backgroundColor: colors.accent.redLight },
    '&:focus-visible': { opacity: 1, outline: `2px solid ${PRINT_SLOT_COLORS.filled}`, outlineOffset: 1 },
    // No hover on touch screens: keep the button visible.
    '@media (hover: none)': { opacity: 1 },
  },
};
