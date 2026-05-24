import { colors, themeColors, typography, borderRadius, shadows, transitions } from './design-tokens';

export const newsStyles = {
  container: {
    backgroundColor: themeColors.neutral[100],
    minHeight: '100vh',
    padding: { xs: 2, md: 4 },
  },
  header: {
    textAlign: 'center',
    mb: 4,
    mt: 2,
  },
  title: {
    fontWeight: typography.fontWeight.bold,
    color: themeColors.primary.main,
    mb: 1,
    fontFamily: typography.fontFamily.heading,
  },
  subtitle: {
    color: themeColors.text.secondary,
    fontSize: typography.fontSize.lg,
  },
  articleCard: {
    backgroundColor: themeColors.neutral.white,
    borderRadius: borderRadius.md,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: `1px solid ${themeColors.neutral[200]}`,
    mb: 3,
    cursor: 'pointer',
    transition: transitions.base,
    '&:hover': {
      boxShadow: shadows.md,
      transform: 'translateY(-2px)',
      borderColor: themeColors.primary.main,
    },
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 2,
  },
  artistAvatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    border: `2px solid ${themeColors.primary.main}`,
  },
  articleTitle: {
    fontWeight: typography.fontWeight.bold,
    color: themeColors.text.primary,
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
    flex: 1,
  },
  summary: {
    color: themeColors.text.secondary,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal,
    mb: 2,
  },
  metaInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap',
    mb: 2,
  },
  artistChip: {
    backgroundColor: colors.primary.main,
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: transitions.base,
    '&:hover': {
      backgroundColor: colors.primary.dark,
      transform: 'scale(1.05)',
    },
    '& .MuiChip-label': {
      fontWeight: typography.fontWeight.semibold,
    },
  },
  dateText: {
    color: themeColors.text.secondary,
    fontSize: typography.fontSize.sm,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },
  readMore: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    color: themeColors.primary.main,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
    mt: 1,
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 2,
    mb: 3,
    p: 2,
    backgroundColor: themeColors.neutral.white,
    borderRadius: borderRadius.md,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: `1px solid ${themeColors.neutral[200]}`,
  },
  filterLabel: {
    color: themeColors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
    mr: 1,
  },
  artistSelect: {
    minWidth: 200,
    '& .MuiOutlinedInput-root': {
      borderRadius: borderRadius.md,
      color: themeColors.text.primary,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: themeColors.neutral[300],
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: themeColors.primary.main,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: themeColors.primary.main,
      },
    },
    '& .MuiInputLabel-root': {
      color: themeColors.text.secondary,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: themeColors.primary.main,
    },
    '& .MuiSvgIcon-root': {
      color: themeColors.text.secondary,
    },
  },
  clearButton: {
    color: themeColors.text.secondary,
    borderColor: themeColors.neutral[300],
    textTransform: 'none',
    '&:hover': {
      borderColor: themeColors.text.secondary,
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
  resultsCount: {
    color: themeColors.text.secondary,
    fontSize: typography.fontSize.sm,
    ml: 'auto',
  },
  emptyState: {
    p: 6,
    textAlign: 'center',
    borderRadius: borderRadius.md,
  },
  emptyStateTitle: {
    color: themeColors.text.secondary,
    mb: 1,
  },
  emptyStateText: {
    color: themeColors.text.hint,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  loadingSpinner: {
    color: themeColors.primary.main,
  },
  loadingText: {
    mt: 2,
    color: themeColors.text.secondary,
  },
  errorAlert: {
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.accent.red}`,
    backgroundColor: colors.accent.redLight,
  },
};

export const getDateChipStyles = (isActive: boolean) => ({
  backgroundColor: isActive ? colors.primary.main : 'transparent',
  color: isActive ? colors.primary.contrast : themeColors.primary.main,
  borderColor: themeColors.primary.main,
  fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.normal,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: isActive ? colors.primary.dark : 'rgba(var(--c-primary-main-rgb), 0.08)',
    transform: 'translateY(-1px)',
  },
});
