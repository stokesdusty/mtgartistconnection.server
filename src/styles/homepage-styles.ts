import { SxProps, Theme } from '@mui/material';
import { colors, spacing, shadows, typography, transitions, borderRadius } from './design-tokens';

export type Styles = {
    [key:string]: SxProps;
};

export const homepageStyles: Record<string, SxProps<Theme>> = {
  container: {
    backgroundColor: colors.background.default,
    minHeight: '100vh',
    paddingTop: { xs: spacing.xl, md: spacing.md },
    paddingBottom: spacing.xxxl,
  },
  wrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: { xs: spacing.lg, md: spacing.xxl },
  },
  headerSection: {
    textAlign: 'center',
    marginBottom: { xs: spacing.xxxl, md: spacing.xl },
    maxWidth: '900px',
    margin: '0 auto',
    paddingBottom: { xs: spacing.xxl, md: spacing.lg },
  },
  headerText: {
    fontWeight: typography.fontWeight.bold,
    fontSize: { xs: typography.fontSize['3xl'], md: typography.fontSize['4xl'], lg: typography.fontSize['5xl'] },
    marginBottom: { xs: spacing.lg, md: spacing.md },
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
    letterSpacing: '-0.02em',
    lineHeight: typography.lineHeight.tight,
  },
  description: {
    fontSize: { xs: typography.fontSize.base, md: typography.fontSize.lg },
    color: colors.text.secondary,
    lineHeight: { xs: typography.lineHeight.relaxed, md: typography.lineHeight.normal },
    marginBottom: { xs: spacing.md, md: spacing.sm },
    fontFamily: typography.fontFamily.primary,
    maxWidth: '800px',
    margin: { xs: `${spacing.md} auto`, md: `${spacing.sm} auto` },
  },
  descriptionList: {
    fontSize: { xs: typography.fontSize.sm, md: typography.fontSize.base },
    color: colors.text.secondary,
    lineHeight: { xs: typography.lineHeight.relaxed, md: typography.lineHeight.normal },
    marginBottom: { xs: spacing.sm, md: spacing.xs },
    maxWidth: '800px',
    margin: { xs: `${spacing.sm} auto`, md: `${spacing.xs} auto` },
    '& b': {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.semibold,
    },
  },
  count: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    color: colors.neutral.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    padding: `${spacing.sm} ${spacing.xl}`,
    borderRadius: borderRadius.full,
    textAlign: 'center',
    margin: { xs: `${spacing.xxl} auto ${spacing.xl}`, md: `${spacing.lg} auto ${spacing.md}` },
    boxShadow: shadows.sm,
    fontFamily: typography.fontFamily.display,
    transition: transitions.base,
    '&:hover': {
      backgroundColor: colors.primary.dark,
      boxShadow: shadows.md,
    },
  },
  filtersSection: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: { xs: spacing.lg, md: spacing.xl },
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
    border: `1px solid ${colors.neutral[200]}`,
    boxShadow: shadows.sm,
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '2fr 1.5fr 1.5fr' },
    gap: spacing.lg,
    alignItems: 'start',
  },
  textField: {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: borderRadius.lg,
      backgroundColor: colors.neutral.white,
      transition: transitions.base,
      '&:hover fieldset': {
        borderColor: colors.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary.main,
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root': {
      '&.Mui-focused': {
        color: colors.primary.main,
      },
    },
  },
  locationSelect: {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: borderRadius.lg,
      backgroundColor: colors.neutral.white,
      transition: transitions.base,
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.primary.main,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.primary.main,
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root': {
      '&.Mui-focused': {
        color: colors.primary.main,
      },
    },
  },
  checkboxContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    border: `1px solid ${colors.neutral[200]}`,
  },
  checkboxesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  signingAgentLabel: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: typography.fontFamily.display,
  },
  checkbox: {
    color: colors.primary.main,
    '&.Mui-checked': {
      color: colors.primary.main,
    },
  },
  artistsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(3, 1fr)',
      lg: 'repeat(4, 1fr)',
      xl: 'repeat(5, 1fr)'
    },
    gap: { xs: spacing.lg, md: spacing.xl },
    marginTop: spacing.xl,
  },
  loadingContainer: {
    backgroundColor: colors.background.default,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  loadingSpinner: {
    color: colors.primary.main,
  },
  errorMessage: {
    color: colors.accent.red,
    textAlign: 'center',
    padding: spacing.xl,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.accent.red}`,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
  noResults: {
    textAlign: 'center',
    padding: spacing.xxxl,
    color: colors.text.secondary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    gridColumn: '1 / -1',
  },
};
