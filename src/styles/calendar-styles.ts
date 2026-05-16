import { SxProps, Theme } from '@mui/material';
import { colors, typography, transitions, borderRadius } from './design-tokens';

export const calendarStyles: Record<string, SxProps<Theme>> = {
  // Date filter chip styles
  dateChipActive: {
    backgroundColor: colors.primary.main,
    color: colors.primary.contrast,
    borderColor: colors.primary.main,
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
    color: colors.primary.main,
    borderColor: colors.primary.main,
    fontWeight: typography.fontWeight.normal,
    fontSize: { xs: '0.8125rem', sm: typography.fontSize.sm },
    height: { xs: 32, sm: 32 },
    transition: transitions.base,
    '&:hover': {
      backgroundColor: 'rgba(45, 74, 54, 0.08)',
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
    backgroundColor: colors.primary.lighter,
    color: colors.primary.main,
    border: `1px solid ${colors.primary.main}`,
    fontSize: { xs: '0.8125rem', sm: typography.fontSize.sm },
    fontWeight: typography.fontWeight.semibold,
    padding: { xs: '6px 14px', sm: '6px 16px' },
    borderRadius: borderRadius.full,
    marginLeft: { xs: 0, sm: 'auto' },
    alignSelf: { xs: 'center', sm: 'center' },
    whiteSpace: 'nowrap',
    fontFamily: typography.fontFamily.display,
  },
  filterSelect: {
    borderRadius: borderRadius.md,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.neutral[200],
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary.main,
    },
  },
  listSubheader: {
    backgroundColor: colors.neutral[100],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: '36px',
  },
  clearFiltersButton: {
    borderColor: colors.primary.main,
    color: colors.primary.main,
    textTransform: 'none',
    borderRadius: borderRadius.md,
    '&:hover': {
      borderColor: colors.primary.dark,
      backgroundColor: 'rgba(45, 74, 54, 0.04)',
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