import { SxProps, Theme } from '@mui/material';
import { typography, vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from './design-tokens';

const focusRing = {
  '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
};

export const footerStyles: Record<string, SxProps<Theme>> = {
  footer: {
    margin: `0 ${vaultLayout.gutter}`,
    padding: '28px 0 36px',
    borderTop: `1px solid ${vault.line}`,
    fontSize: 13,
    color: vault.faint,
    [vaultMedia.mobile]: { margin: `0 ${vaultLayout.gutterMobile}`, padding: '24px 0 32px' },
  },
  mainRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px 32px',
    [vaultMedia.mobile]: { flexDirection: 'column', alignItems: 'stretch', gap: '20px' },
  },
  supportRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    [vaultMedia.mobile]: { justifyContent: 'space-between' },
  },
  supportText: {
    color: vault.muted,
  },
  supportButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: vaultRadii.input,
    border: `1px solid ${vault.accent}`,
    color: vault.accentText,
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    transition: `background-color ${vaultEffects.transition}`,
    '&:hover': { backgroundColor: vault.glow },
    ...focusRing,
    [vaultMedia.mobile]: { minHeight: 40, padding: '9px 16px' },
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px 20px',
    [vaultMedia.mobile]: { gap: '8px 16px' },
  },
  link: {
    color: vault.faint,
    fontSize: 13,
    textDecoration: 'none',
    borderRadius: '4px',
    transition: `color ${vaultEffects.transition}`,
    '&:hover': { color: vault.fg, textDecoration: 'none' },
    ...focusRing,
    [vaultMedia.mobile]: { color: vault.muted, fontSize: 14, padding: '6px 0' },
  },
  copyright: {
    color: vault.faint,
    [vaultMedia.mobile]: {
      flexBasis: '100%',
      marginTop: '4px',
      fontFamily: typography.fontFamily.mono,
      fontSize: 12,
    },
  },
  // Full name only on mobile, where the copyright sits on its own line.
  copyrightName: {
    display: 'none',
    [vaultMedia.mobile]: { display: 'inline' },
  },
  disclosureRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px 32px',
    marginTop: '24px',
    [vaultMedia.mobile]: { flexDirection: 'column', alignItems: 'flex-start', marginTop: '20px' },
  },
  disclosure: {
    margin: 0,
    maxWidth: 720,
    fontSize: 11,
    lineHeight: 1.5,
    color: vault.faint,
  },
  partnerBadge: {
    flex: 'none',
    display: 'flex',
    borderRadius: '4px',
    opacity: 0.85,
    transition: `opacity ${vaultEffects.transition}`,
    '&:hover': { opacity: 1 },
    '& img': { height: 20, width: 'auto', display: 'block' },
    ...focusRing,
  },
};
