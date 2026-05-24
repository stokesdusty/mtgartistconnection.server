import { SxProps, Theme } from '@mui/material';
import { themeColors, spacing, typography, transitions, borderRadius } from './design-tokens';

export const footerStyles: Record<string, SxProps<Theme>> = {
  footerContainer: {
    backgroundColor: themeColors.neutral.white,
    borderTop: `1px solid ${themeColors.neutral[200]}`,
    padding: { xs: spacing.xl, md: spacing.xxl },
    marginTop: 'auto',
  },
  footerContent: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    gap: spacing.lg,
  },
  footerText: {
    color: themeColors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.primary,
    textAlign: 'center',
  },
  footerLinks: {
    display: 'flex',
    gap: spacing.lg,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: { xs: 'relative', md: 'absolute' },
    bottom: { md: 0 },
    right: { md: 0 },
    marginTop: { xs: spacing.md, md: 0 },
  },
  link: {
    color: themeColors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.primary,
    textDecoration: 'none',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    transition: transitions.base,
    '&:hover': {
      color: themeColors.primary.main,
      backgroundColor: themeColors.neutral[50],
      textDecoration: 'none',
    },
  },
  iconLink: {
    color: themeColors.text.secondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    transition: transitions.base,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      color: themeColors.primary.main,
      backgroundColor: themeColors.neutral[50],
    },
  },
  supportBanner: {
    backgroundColor: themeColors.neutral[50],
    borderTop: `1px solid ${themeColors.neutral[200]}`,
    padding: { xs: spacing.md, md: spacing.lg },
  },
  supportBannerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  supportText: {
    color: themeColors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.primary,
  },
};
