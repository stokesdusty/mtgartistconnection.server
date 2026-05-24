import { SxProps, Theme } from '@mui/material';
import { colors, themeColors, typography, transitions, borderRadius } from './design-tokens';

export const calendarStyles: Record<string, SxProps<Theme>> = {
  dateChipActive: {
    backgroundColor: colors.primary.main,
    color: colors.primary.contrast,
    borderColor: colors.primary.main,
    borderRadius: borderRadius.sm,
    fontWeight: typography.fontWeight.semibold,
    fontSize: { xs: '0.8125rem', sm: typography.fontSize.sm },
    height: { xs: 32, sm: 32 },
    transition: transitions.base,
    '&:hover': {
      backgroundColor: colors.primary.dark,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  dateChipInactive: {
    backgroundColor: 'transparent',
    color: themeColors.primary.main,
    borderColor: themeColors.primary.main,
    borderRadius: borderRadius.sm,
    fontWeight: typography.fontWeight.normal,
    fontSize: { xs: '0.8125rem', sm: typography.fontSize.sm },
    height: { xs: 32, sm: 32 },
    transition: transitions.base,
    '&:hover': {
      backgroundColor: 'rgba(var(--c-primary-main-rgb), 0.08)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  eventCountBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.primary.lighter,
    color: themeColors.primary.main,
    border: `1px solid ${themeColors.primary.main}`,
    fontSize: { xs: '0.8125rem', sm: typography.fontSize.sm },
    fontWeight: typography.fontWeight.semibold,
    padding: { xs: '6px 14px', sm: '6px 16px' },
    borderRadius: borderRadius.full,
    marginLeft: { xs: 0, sm: 'auto' },
    alignSelf: { xs: 'center', sm: 'center' },
    whiteSpace: 'nowrap',
    fontFamily: typography.fontFamily.display,
  },
  filterFormControl: {
    minWidth: 250,
    '& .MuiInputLabel-root': {
      color: themeColors.text.secondary,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: themeColors.primary.main,
    },
  },
  filterSelect: {
    borderRadius: borderRadius.md,
    '& .MuiSelect-select': {
      color: themeColors.text.primary,
    },
    '& .MuiSelect-icon': {
      color: themeColors.text.secondary,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: themeColors.neutral[200],
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: themeColors.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: themeColors.primary.main,
    },
  },
  listSubheader: {
    backgroundColor: themeColors.neutral[100],
    color: themeColors.text.primary,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: '36px',
  },
  clearFiltersButton: {
    borderColor: themeColors.primary.main,
    color: themeColors.primary.main,
    textTransform: 'none',
    borderRadius: borderRadius.sm,
    '&:hover': {
      borderColor: colors.primary.dark,
      backgroundColor: 'rgba(var(--c-primary-main-rgb), 0.04)',
    },
  },
  scrollToTopFab: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    bgcolor: colors.primary.main,
    '&:hover': { bgcolor: colors.primary.dark },
    zIndex: 999,
  },
};
