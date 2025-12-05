import { SxProps, Theme } from '@mui/material';
import { colors, spacing, typography, transitions, borderRadius } from './design-tokens';

export const footerStyles: Record<string, SxProps<Theme>> = {
  footerContainer: {
    backgroundColor: colors.neutral.white,
    borderTop: `1px solid ${colors.neutral[200]}`,
    padding: { xs: spacing.xl, md: spacing.xxl },
    marginTop: 'auto',
  },
  footerContent: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    gap: { xs: spacing.lg, sm: spacing.xl },
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.primary,
    textAlign: { xs: 'center', sm: 'left' },
  },
  footerLinks: {
    display: 'flex',
    gap: spacing.lg,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: { xs: 'center', sm: 'flex-end' },
  },
  link: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.primary,
    textDecoration: 'none',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    transition: transitions.base,
    '&:hover': {
      color: colors.primary.main,
      backgroundColor: colors.neutral[50],
      textDecoration: 'none',
    },
  },
  iconLink: {
    color: colors.text.secondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    transition: transitions.base,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      color: colors.primary.main,
      backgroundColor: colors.neutral[50],
    },
  },
};
