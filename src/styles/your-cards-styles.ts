import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { typography, vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

// Artist | Proofs | Signed | Wishlist | arrow
const COLUMNS = 'minmax(0, 1fr) 96px 96px 96px 20px';
const COLUMNS_MOBILE = 'minmax(0, 1fr) 48px 48px 48px';

export const yourCardsStyles: Record<string, SystemStyleObject<Theme>> = {
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
  statusPanel: {
    padding: '28px',
    borderRadius: vaultRadii.panel,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.line}`,
    textAlign: 'center',
    fontSize: 15,
    color: vault.muted,
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
  titleCount: {
    color: vault.faint,
  },

  // ─── Totals ────────────────────────────────────────────────────────────────
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    margin: '36px 0 48px',
    [vaultMedia.mobile]: { gap: '8px', margin: '28px 0 40px' },
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '20px',
    borderRadius: vaultRadii.panel,
    backgroundColor: vault.surface,
    border: `1px solid ${vault.line}`,
    [vaultMedia.mobile]: { padding: '14px', gap: '8px' },
  },
  statValue: {
    fontSize: 40,
    lineHeight: 1,
    fontWeight: 600,
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
    [vaultMedia.mobile]: { fontSize: 28 },
  },

  // ─── Artist table ──────────────────────────────────────────────────────────
  headerRow: {
    display: 'grid',
    gridTemplateColumns: COLUMNS,
    alignItems: 'end',
    gap: '12px',
    padding: '0 12px 12px',
    borderBottom: `1px solid ${vault.lineStrong}`,
    [vaultMedia.mobile]: { gridTemplateColumns: COLUMNS_MOBILE, gap: '8px', padding: '0 8px 10px' },
  },
  colLabel: {
    textAlign: 'center',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: COLUMNS,
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: vaultRadii.card,
    borderBottom: `1px solid ${vault.line}`,
    color: vault.fg,
    textDecoration: 'none',
    transition: `background-color ${vaultEffects.transition}`,
    '&:hover': { backgroundColor: vault.chip },
    '&:hover .your-cards-arrow': { color: vault.fg },
    ...focusRing,
    [vaultMedia.mobile]: { gridTemplateColumns: COLUMNS_MOBILE, gap: '8px', padding: '12px 8px' },
  },
  artist: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minWidth: 0,
    [vaultMedia.mobile]: { gap: '10px' },
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
    [vaultMedia.mobile]: { width: 30, height: 30, fontSize: 11 },
  },
  artistName: {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    [vaultMedia.mobile]: { fontSize: 15 },
  },
  count: {
    textAlign: 'center',
    fontFamily: typography.fontFamily.mono,
    fontSize: 14,
    fontVariantNumeric: 'tabular-nums',
    color: vault.faint,
  },
  countActive: {
    justifySelf: 'center',
    minWidth: 32,
    padding: '2px 8px',
    borderRadius: vaultRadii.pill,
    backgroundColor: vault.glow,
    color: vault.accentText,
  },
  arrow: {
    display: 'flex',
    justifyContent: 'flex-end',
    color: vault.faint,
    transition: `color ${vaultEffects.transition}`,
    [vaultMedia.mobile]: { display: 'none' },
  },
  arrowSpacer: {
    [vaultMedia.mobile]: { display: 'none' },
  },
};
