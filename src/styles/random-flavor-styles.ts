import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { onArt, vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

// Scryfall art_crop images are 626×457.
export const ART_CROP_RATIO = '626 / 457';

export const randomFlavorStyles: Record<string, SystemStyleObject<Theme>> = {
  page: {
    minHeight: '100vh',
    color: vault.fg,
    background: `${vaultEffects.heroGlow}, ${vault.bg}`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 520px, auto',
  },
  inner: {
    maxWidth: 760,
    mx: 'auto',
    padding: `64px ${vaultLayout.gutter} 72px`,
    textAlign: 'center',
    [vaultMedia.mobile]: { padding: `40px ${vaultLayout.gutterMobile} 48px` },
  },
  eyebrow: {
    marginBottom: '28px',
    [vaultMedia.mobile]: { marginBottom: '20px' },
  },
  errorPanel: {
    marginBottom: '24px',
    padding: '14px 18px',
    borderRadius: vaultRadii.card,
    backgroundColor: vault.dangerBg,
    border: `1px solid ${vault.danger}`,
    color: vault.danger,
    fontSize: 14,
  },

  // ─── Art ───────────────────────────────────────────────────────────────────
  art: {
    maxWidth: 620,
    mx: 'auto',
  },
  artLoadingOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    display: 'grid',
    placeItems: 'center',
    backgroundColor: onArt.badgeBg,
    backdropFilter: onArt.badgeBlur,
    WebkitBackdropFilter: onArt.badgeBlur,
    color: onArt.text,
  },

  // ─── Quote ─────────────────────────────────────────────────────────────────
  figure: {
    margin: '40px 0 0',
    [vaultMedia.mobile]: { marginTop: '28px' },
  },
  quote: {
    margin: 0,
    fontSize: 26,
    lineHeight: 1.45,
    fontStyle: 'italic',
    fontWeight: 400,
    letterSpacing: '-0.01em',
    color: vault.fg,
    whiteSpace: 'pre-line',
    textWrap: 'balance',
    [vaultMedia.mobile]: { fontSize: 20 },
  },
  caption: {
    marginTop: '28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    [vaultMedia.mobile]: { marginTop: '22px' },
  },
  cardName: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: vault.fg,
  },
  byline: {
    fontSize: 15,
    color: vault.muted,
    '& a': { color: vault.accentText },
  },
  allCardsLink: {
    marginTop: '4px',
    color: vault.accentText,
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
    ...focusRing,
  },

  // ─── Action ────────────────────────────────────────────────────────────────
  reloadButton: {
    marginTop: '40px',
    height: 46,
    padding: '0 22px',
    borderRadius: '10px',
    backgroundColor: vault.accent,
    color: vault.onAccent,
    textTransform: 'none',
    fontSize: 15,
    fontWeight: 600,
    boxShadow: 'none',
    '&:hover': { backgroundColor: vault.accent, boxShadow: `0 0 0 4px ${vault.glow}` },
    '&.Mui-disabled': { backgroundColor: vault.chipStrong, color: vault.muted },
    ...focusRing,
    [vaultMedia.mobile]: { marginTop: '32px', width: '100%' },
  },
};
