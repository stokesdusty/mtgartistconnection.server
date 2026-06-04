import { SxProps, Theme } from '@mui/material';
import { colors, themeColors, spacing, shadows, typography, transitions, borderRadius, hoverEffect } from './design-tokens';

export const headerStyles: Record<string, SxProps<Theme>> = {
  appBar: {
    background: themeColors.neutral.white,
    color: themeColors.text.primary,
    boxShadow: shadows.sm,
    borderRadius: 0,
    position: 'sticky',
    height: '59px',
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
      background: themeColors.primary.main,
      height: 2,
      borderRadius: `${borderRadius.sm} ${borderRadius.sm} 0 0`,
    },
  },
  tab: {
    fontWeight: typography.fontWeight.medium,
    fontSize: { xs: typography.fontSize.xs, md: typography.fontSize.sm },
    color: themeColors.text.secondary,
    textTransform: 'none',
    minWidth: 'auto',
    padding: { xs: `${spacing.sm} ${spacing.md}`, md: `${spacing.md} ${spacing.lg}` },
    fontFamily: typography.fontFamily.display,
    letterSpacing: '0.01em',
    transition: transitions.base,
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      color: themeColors.primary.main,
      fontWeight: typography.fontWeight.semibold,
    },
    '&:hover': {
      color: themeColors.primary.main,
      backgroundColor: themeColors.neutral[50],
    },
  },
  themeToggle: {
    color: themeColors.text.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    mr: 1,
    transition: transitions.base,
    '&:hover': {
      backgroundColor: themeColors.neutral[50],
    },
  },
  menuButton: {
    color: themeColors.text.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    border: `1px solid ${themeColors.neutral[200]}`,
    transition: transitions.base,
    '&:hover': {
      backgroundColor: themeColors.neutral[50],
      borderColor: themeColors.primary.main,
    },
  },
  menu: {
    '& .MuiPaper-root': {
      background: themeColors.neutral.white,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
      minWidth: 200,
      boxShadow: shadows.lg,
      border: `1px solid ${themeColors.neutral[200]}`,
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
    color: themeColors.text.primary,
    transition: transitions.base,
    '&:hover': {
      backgroundColor: themeColors.neutral[50],
      color: themeColors.primary.main,
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
  accountButton: {
    color: themeColors.primary.main,
    textTransform: 'none',
    fontSize: { xs: typography.fontSize.sm, md: typography.fontSize.base },
    fontWeight: typography.fontWeight.semibold,
    padding: { xs: '6px 12px', md: '8px 16px' },
    borderRadius: borderRadius.sm,
    backgroundColor: themeColors.neutral[50],
    '&:hover': {
      backgroundColor: themeColors.neutral[100],
      color: colors.primary.dark,
    },
  },
  signInButton: {
    color: themeColors.text.secondary,
    textTransform: 'none',
    fontSize: { xs: typography.fontSize.sm, md: typography.fontSize.base },
    fontWeight: typography.fontWeight.medium,
    padding: { xs: '6px 12px', md: '8px 16px' },
    borderRadius: borderRadius.sm,
    transition: transitions.base,
    '&:hover': {
      backgroundColor: themeColors.neutral[50],
      color: themeColors.primary.main,
    },
  },
  signUpButton: {
    textTransform: 'none',
    fontSize: { xs: typography.fontSize.sm, md: typography.fontSize.base },
    fontWeight: typography.fontWeight.semibold,
    padding: { xs: '6px 12px', md: '8px 16px' },
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.main,
    color: colors.primary.contrast,
    transition: transitions.base,
    '&:hover': {
      backgroundColor: colors.primary.dark,
      color: colors.primary.contrast,
    },
  },
  drawerHeader: {
    p: 3,
    backgroundColor: colors.primary.main,
    color: colors.primary.contrast,
    borderBottom: `1px solid ${colors.primary.dark}`,
  },
  drawerHeaderLabel: {
    fontWeight: typography.fontWeight.semibold,
    mb: 0.5,
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    opacity: 0.8,
  },
  drawerHeaderEmail: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  drawerListItem: {
    borderRadius: borderRadius.sm,
    mb: 0.5,
    transition: transitions.base,
    '&:hover': {
      backgroundColor: colors.neutral[50],
      '& .MuiListItemIcon-root': { color: colors.primary.main },
      '& .MuiListItemText-primary': { color: colors.primary.main },
    },
  },
  drawerListItemLogout: {
    borderRadius: borderRadius.md,
    transition: transitions.base,
    '&:hover': {
      backgroundColor: colors.neutral[50],
      '& .MuiListItemIcon-root': { color: colors.accent.red },
      '& .MuiListItemText-primary': { color: colors.accent.red },
    },
  },
  drawerIcon: {
    color: colors.neutral[600],
    transition: transitions.base,
  },
  drawerItemText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[900],
    transition: transitions.base,
  },
};
