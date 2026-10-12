import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

const chip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 10px',
  borderRadius: vaultRadii.pill,
  fontSize: 12,
  fontWeight: 500,
  whiteSpace: 'nowrap' as const,
};

const outlineButton = {
  height: 40,
  padding: '0 16px',
  borderRadius: '9px',
  border: `1px solid ${vault.lineStrong}`,
  color: vault.fg,
  textTransform: 'none' as const,
  fontSize: 14,
  fontWeight: 500,
  '&:hover': { backgroundColor: vault.chip, borderColor: vault.faint },
  ...focusRing,
};

const primaryButton = {
  height: 40,
  padding: '0 18px',
  borderRadius: '9px',
  backgroundColor: vault.accent,
  color: vault.onAccent,
  textTransform: 'none' as const,
  fontSize: 14,
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': { backgroundColor: vault.accent, boxShadow: `0 0 0 4px ${vault.glow}` },
  '&.Mui-disabled': { backgroundColor: vault.chipStrong, color: vault.faint },
  ...focusRing,
};

export const signingReportStyles: Record<string, SystemStyleObject<Theme>> = {
  // ─── Artist page section ───────────────────────────────────────────────────
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px 16px',
    marginBottom: '14px',
  },
  reportButton: {
    ...outlineButton,
    height: 34,
    fontSize: 13,
    [vaultMedia.mobile]: { width: '100%' },
  },
  summary: {
    padding: '18px 20px',
    borderRadius: vaultRadii.card,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.line}`,
  },
  summaryHeadline: {
    margin: 0,
    fontSize: 17,
    lineHeight: 1.45,
    color: vault.fg,
    '& strong': { fontWeight: 600, color: vault.accentText },
  },
  summaryMeta: {
    margin: '6px 0 0',
    fontSize: 13,
    color: vault.muted,
  },
  methodChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '12px',
  },
  methodChip: {
    ...chip,
    backgroundColor: vault.chip,
    border: `1px solid ${vault.line}`,
    color: vault.muted,
  },
  disclaimer: {
    margin: '12px 0 0',
    fontSize: 12,
    color: vault.faint,
  },
  emptyState: {
    padding: '18px 20px',
    borderRadius: vaultRadii.card,
    border: `1px dashed ${vault.lineStrong}`,
    fontSize: 14,
    color: vault.muted,
  },
  reportList: {
    listStyle: 'none',
    margin: '14px 0 0',
    padding: 0,
  },
  reportItem: {
    display: 'grid',
    gridTemplateColumns: '90px minmax(0, 1fr) auto',
    alignItems: 'baseline',
    gap: '4px 16px',
    padding: '12px 0',
    borderBottom: `1px solid ${vault.line}`,
    fontSize: 14,
    [vaultMedia.mobile]: { gridTemplateColumns: 'minmax(0, 1fr) auto' },
  },
  reportItemStale: {
    opacity: 0.55,
  },
  reportDate: {
    color: vault.muted,
    fontSize: 13,
    [vaultMedia.mobile]: { gridColumn: '1 / -1' },
  },
  reportBody: {
    minWidth: 0,
    color: vault.fg,
  },
  reportDetail: {
    display: 'block',
    marginTop: '2px',
    fontSize: 13,
    color: vault.muted,
  },
  reportNote: {
    display: 'block',
    marginTop: '4px',
    fontSize: 13,
    fontStyle: 'italic',
    color: vault.muted,
    overflowWrap: 'anywhere',
  },
  reportPrice: {
    fontWeight: 600,
    color: vault.fg,
    whiteSpace: 'nowrap',
  },
  perSig: {
    fontWeight: 400,
    color: vault.muted,
  },

  // ─── Form dialog ───────────────────────────────────────────────────────────
  backdrop: {
    backgroundColor: 'rgba(10,9,8,.6)',
    backdropFilter: 'blur(4px)',
  },
  dialogPaper: {
    position: 'relative',
    width: '100%',
    maxWidth: 520,
    margin: '16px',
    padding: '26px',
    borderRadius: vaultRadii.panel,
    color: vault.fg,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.line}`,
    boxShadow: `0 20px 60px ${vault.shadow}`,
    [vaultMedia.mobile]: { padding: '20px 16px' },
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    color: vault.faint,
    '&:hover': { color: vault.fg, backgroundColor: vault.chip },
    ...focusRing,
  },
  dialogTitle: {
    margin: '6px 0 4px',
    fontSize: 26,
    lineHeight: 1.1,
    fontWeight: 600,
    letterSpacing: '-0.03em',
  },
  dialogIntro: {
    margin: '0 0 20px',
    fontSize: 14,
    color: vault.muted,
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    [vaultMedia.mobile]: { gridTemplateColumns: '1fr' },
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  input: {
    '& .MuiInputLabel-root': { color: vault.muted, fontSize: 14 },
    '& .MuiInputLabel-root.Mui-focused': { color: vault.accentText },
    '& .MuiOutlinedInput-root': {
      borderRadius: '9px',
      backgroundColor: vault.bg,
      color: vault.fg,
      fontSize: 14,
      '& fieldset': { borderColor: vault.lineStrong },
      '&:hover fieldset': { borderColor: vault.faint },
      '&.Mui-focused fieldset': { borderColor: vault.accent, borderWidth: 1 },
    },
    '& .MuiSelect-icon': { color: vault.muted },
    '& .MuiFormHelperText-root': { marginLeft: 0, marginTop: '6px', fontSize: 12, color: vault.faint },
  },
  extrasLabel: {
    marginTop: '4px',
  },
  extraRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 120px auto',
    alignItems: 'center',
    gap: '10px',
  },
  textButton: {
    justifySelf: 'start',
    padding: '4px 0',
    minWidth: 0,
    color: vault.accentText,
    textTransform: 'none',
    fontSize: 13,
    '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
    ...focusRing,
  },
  iconButton: {
    color: vault.faint,
    '&:hover': { color: vault.danger, backgroundColor: vault.chip },
    ...focusRing,
  },
  error: {
    margin: '16px 0 0',
    padding: '10px 14px',
    borderRadius: vaultRadii.input,
    fontSize: 13,
    backgroundColor: vault.dangerBg,
    border: `1px solid ${vault.danger}`,
    color: vault.danger,
  },
  success: {
    margin: '8px 0 0',
    padding: '14px 16px',
    borderRadius: vaultRadii.input,
    fontSize: 14,
    backgroundColor: vault.okBg,
    border: `1px solid ${vault.ok}`,
    color: vault.ok,
  },
  formFootnote: {
    margin: '16px 0 0',
    fontSize: 12,
    lineHeight: 1.5,
    color: vault.faint,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '18px',
    [vaultMedia.mobile]: { flexDirection: 'column-reverse' },
  },
  secondaryButton: outlineButton,
  primaryButton,

  // ─── Status chips (settings + admin) ───────────────────────────────────────
  statusPending: { ...chip, backgroundColor: vault.warnBg, color: vault.warn, border: `1px solid ${vault.warn}` },
  statusApproved: { ...chip, backgroundColor: vault.okBg, color: vault.ok, border: `1px solid ${vault.ok}` },
  statusRejected: { ...chip, backgroundColor: vault.dangerBg, color: vault.danger, border: `1px solid ${vault.danger}` },
  deleteButton: {
    padding: '2px 8px',
    minWidth: 0,
    color: vault.faint,
    textTransform: 'none',
    fontSize: 13,
    '&:hover': { color: vault.danger, backgroundColor: vault.chip },
    ...focusRing,
  },

  // ─── Admin review page ─────────────────────────────────────────────────────
  adminPage: {
    minHeight: '100vh',
    color: vault.fg,
    background: `${vaultEffects.heroGlowLeft}, ${vault.bg}`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 420px, auto',
  },
  adminInner: {
    maxWidth: 900,
    mx: 'auto',
    padding: `56px ${vaultLayout.gutter} 72px`,
    [vaultMedia.mobile]: { padding: `36px ${vaultLayout.gutterMobile} 48px` },
  },
  adminTitle: {
    margin: '12px 0 28px',
    fontSize: 44,
    lineHeight: 1,
    fontWeight: 600,
    letterSpacing: '-0.035em',
    [vaultMedia.mobile]: { fontSize: 34 },
  },
  adminList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  adminCard: {
    padding: '18px 20px',
    borderRadius: vaultRadii.panel,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.line}`,
  },
  adminCardHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '6px 16px',
  },
  adminArtist: {
    fontSize: 18,
    fontWeight: 600,
    color: vault.fg,
    textDecoration: 'none',
    '&:hover': { color: vault.accentText },
    ...focusRing,
  },
  adminMeta: {
    margin: '6px 0 0',
    fontSize: 13,
    color: vault.muted,
  },
  outlierChip: { ...chip, backgroundColor: vault.warnBg, color: vault.warn, border: `1px solid ${vault.warn}` },
  adminActions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '10px',
    marginTop: '14px',
  },
  rejectInput: {
    flex: 1,
    minWidth: 200,
  },
};
