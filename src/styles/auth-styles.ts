import { SxProps, Theme } from '@mui/material';
import { colors, typography, shadows, borderRadius, transitions } from './design-tokens';

export const authStyles: Record<string, SxProps<Theme>> = {
  container: {
    backgroundColor: colors.neutral[50],
    minHeight: '100vh',
    padding: { xs: 2, md: 4 },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    maxWidth: 500,
    width: '100%',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.neutral[200]}`,
    overflow: 'hidden',
  },
  header: {
    padding: { xs: 3, md: 4 },
    paddingBottom: 2,
  },
  title: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: { xs: '1.5rem', md: typography.fontSize['3xl'] },
    textAlign: 'center',
    marginBottom: 1,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  tabs: {
    borderBottom: `1px solid ${colors.neutral[200]}`,
    '& .MuiTabs-indicator': {
      backgroundColor: colors.primary.main,
      height: 2,
    },
  },
  tab: {
    textTransform: 'none',
    fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    '&.Mui-selected': {
      color: colors.primary.main,
      fontWeight: typography.fontWeight.semibold,
    },
  },
  form: {
    padding: { xs: 3, md: 4 },
  },
  textField: {
    marginBottom: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: borderRadius.md,
      '&:hover fieldset': { borderColor: colors.primary.main },
      '&.Mui-focused fieldset': { borderColor: colors.primary.main },
    },
    '& .MuiInputLabel-root': {
      '&.Mui-focused': { color: colors.primary.main },
    },
  },
  submitButton: {
    backgroundColor: colors.primary.main,
    color: colors.primary.contrast,
    marginTop: 2,
    padding: '12px',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    borderRadius: borderRadius.sm,
    textTransform: 'none',
    transition: transitions.base,
    '&:hover': { backgroundColor: colors.primary.dark },
    '&:disabled': { backgroundColor: colors.neutral[400] },
  },
  errorAlert: {
    marginBottom: 2,
    borderRadius: borderRadius.md,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: 2,
  },
  signupInfoBox: {
    backgroundColor: colors.neutral[50],
    padding: 2,
    borderRadius: borderRadius.md,
    marginBottom: 3,
    border: `1px solid ${colors.neutral[200]}`,
  },
  signupInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: 1.6,
    marginBottom: 1.5,
  },
  signupInfoList: {
    margin: 0,
    paddingLeft: 2.5,
    '& li': {
      fontSize: typography.fontSize.sm,
      color: colors.neutral[700],
      lineHeight: 1.6,
      marginBottom: 0.5,
    },
  },
  signupInfoFootnote: {
    fontSize: '0.8rem',
    color: colors.text.secondary,
    marginTop: 1.5,
    fontStyle: 'italic',
  },
  spinner: {
    color: colors.primary.main,
  },
};