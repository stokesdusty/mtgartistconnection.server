import { colors, typography, borderRadius, shadows, transitions } from './design-tokens';

export const newsStyles = {
  container: {
    backgroundColor: colors.neutral[100],
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
    color: colors.primary.main,
    mb: 1,
    fontFamily: typography.fontFamily.heading,
  },
  subtitle: {
    color: colors.neutral[700],
    fontSize: typography.fontSize.lg,
  },
  articleCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: `1px solid ${colors.neutral[200]}`,
    mb: 3,
    cursor: 'pointer',
    transition: transitions.base,
    '&:hover': {
      boxShadow: shadows.md,
      transform: 'translateY(-2px)',
      borderColor: colors.primary.main,
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
    border: `2px solid ${colors.primary.main}`,
  },
  articleTitle: {
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
    flex: 1,
  },
  summary: {
    color: colors.neutral[700],
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
    color: colors.neutral[600],
    fontSize: typography.fontSize.sm,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },
  readMore: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    color: colors.primary.main,
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
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: `1px solid ${colors.neutral[200]}`,
  },
  filterLabel: {
    color: colors.neutral[700],
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
    mr: 1,
  },
  artistSelect: {
    minWidth: 200,
    '& .MuiOutlinedInput-root': {
      borderRadius: borderRadius.md,
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.primary.main,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.primary.main,
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: colors.primary.main,
    },
  },
  clearButton: {
    color: colors.neutral[600],
    borderColor: colors.neutral[400],
    textTransform: 'none',
    '&:hover': {
      borderColor: colors.neutral[600],
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
  resultsCount: {
    color: colors.neutral[600],
    fontSize: typography.fontSize.sm,
    ml: 'auto',
  },
  emptyState: {
    p: 6,
    textAlign: 'center',
    borderRadius: borderRadius.md,
  },
  emptyStateTitle: {
    color: colors.neutral[600],
    mb: 1,
  },
  emptyStateText: {
    color: colors.neutral[500],
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  loadingSpinner: {
    color: colors.primary.main,
  },
  loadingText: {
    mt: 2,
    color: colors.neutral[700],
  },
  errorAlert: {
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.accent.red}`,
    backgroundColor: colors.accent.redLight,
  },
};

// Helper function for date chip styles (needs to be a function for dynamic active state)
export const getDateChipStyles = (isActive: boolean) => ({
  backgroundColor: isActive ? colors.primary.main : 'transparent',
  color: isActive ? colors.primary.contrast : colors.primary.main,
  borderColor: colors.primary.main,
  fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.normal,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: isActive ? colors.primary.dark : 'rgba(45, 74, 54, 0.08)',
    transform: 'translateY(-1px)',
  },
});
