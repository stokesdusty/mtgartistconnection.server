import { SxProps, Theme } from '@mui/material';
import { colors, spacing, shadows, typography, transitions, borderRadius } from './design-tokens';

export const allCardsStyles: Record<string, SxProps<Theme>> = {
  container: {
    backgroundColor: colors.background.default,
    minHeight: '100vh',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  wrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: { xs: spacing.lg, md: spacing.xxl },
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    boxShadow: shadows.sm,
  },
  bannerContainer: {
    width: '100%',
    height: { xs: '200px', md: '300px' },
    overflow: 'hidden',
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: transitions.base,
    },
  },
  artistName: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: { xs: typography.fontSize['3xl'], md: typography.fontSize['4xl'] },
    marginBottom: spacing.lg,
    textAlign: 'center',
    letterSpacing: '-0.02em',
    lineHeight: typography.lineHeight.tight,
    fontFamily: typography.fontFamily.display,
  },
  controlsSection: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    border: `1px solid ${colors.neutral[200]}`,
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: { xs: 'flex-start', md: 'center' },
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardCount: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.display,
  },
  checkbox: {
    color: colors.primary.main,
    '&.Mui-checked': {
      color: colors.primary.main,
    },
  },
  checkboxLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.primary,
  },
  expandButton: {
    backgroundColor: colors.primary.main,
    color: colors.neutral.white,
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    transition: transitions.base,
    '&:hover': {
      backgroundColor: colors.primary.dark,
      boxShadow: shadows.md,
    },
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(auto-fill, minmax(200px, 1fr))',
      sm: 'repeat(auto-fill, minmax(220px, 1fr))',
      md: 'repeat(auto-fill, minmax(240px, 1fr))',
    },
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  cardImage: {
    width: '100%',
    height: 'auto',
    borderRadius: borderRadius.md,
    boxShadow: shadows.md,
    transition: transitions.base,
    border: `1px solid ${colors.neutral[200]}`,
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: shadows.lg,
    },
  },
  loadingContainer: {
    backgroundColor: colors.background.default,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
  },
  loadingSpinner: {
    color: colors.primary.main,
  },
  noCards: {
    textAlign: 'center',
    padding: spacing.xxxl,
    color: colors.text.secondary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
};
