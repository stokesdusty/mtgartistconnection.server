import { SxProps, Theme } from '@mui/material';
import { colors, spacing, shadows, typography, transitions, borderRadius, hoverEffect } from './design-tokens';

export const headerStyles: Record<string, SxProps<Theme>> = {
  appBar: {
    background: colors.neutral.white,
    color: colors.text.primary,
    boxShadow: shadows.sm,
    borderRadius: 0,
    position: 'sticky',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: { xs: spacing.md, md: `${spacing.lg} ${spacing.xxl}` },
    minHeight: '72px !important',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    ...hoverEffect.scale,
  },
  logoImage: {
    width: { xs: '200px', md: '240px', lg: '260px' },
    height: 'auto',
    transition: transitions.base,
  },
  tabContainer: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  tabs: {
    '& .MuiTabs-indicator': {
      background: colors.primary.main,
      height: 2,
      borderRadius: `${borderRadius.sm} ${borderRadius.sm} 0 0`,
    },
  },
  tab: {
    fontWeight: typography.fontWeight.medium,
    fontSize: { xs: typography.fontSize.xs, md: typography.fontSize.sm },
    color: colors.text.secondary,
    textTransform: 'none',
    minWidth: 'auto',
    padding: { xs: `${spacing.sm} ${spacing.md}`, md: `${spacing.md} ${spacing.lg}` },
    fontFamily: typography.fontFamily.display,
    letterSpacing: '0.01em',
    transition: transitions.base,
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      color: colors.primary.main,
      fontWeight: typography.fontWeight.semibold,
    },
    '&:hover': {
      color: colors.primary.main,
      backgroundColor: colors.neutral[50],
    },
  },
  menuButton: {
    color: colors.text.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.neutral[200]}`,
    transition: transitions.base,
    '&:hover': {
      backgroundColor: colors.neutral[50],
      borderColor: colors.primary.main,
    },
  },
  menu: {
    '& .MuiPaper-root': {
      background: colors.neutral.white,
      borderRadius: borderRadius.lg,
      marginTop: spacing.sm,
      minWidth: 200,
      boxShadow: shadows.lg,
      border: `1px solid ${colors.neutral[200]}`,
      '& .MuiList-root': {
        padding: spacing.sm,
      },
    },
  },
  menuItem: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: borderRadius.md,
    margin: `${spacing.xs} 0`,
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
    transition: transitions.base,
    '&:hover': {
      backgroundColor: colors.neutral[50],
      color: colors.primary.main,
    },
    '&.Mui-selected': {
      backgroundColor: colors.primary.main,
      color: colors.neutral.white,
      fontWeight: typography.fontWeight.semibold,
      '&:hover': {
        backgroundColor: colors.primary.dark,
        color: colors.neutral.white,
      },
    },
  },
};
