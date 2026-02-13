import { CSSProperties } from "react";
import { colors, spacing, shadows, typography, transitions, borderRadius } from './design-tokens';
import { Styles } from './homepage-styles';

export const artistGridStyles: Styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    aspectRatio: '1',
    transition: transitions.base,
  },
  imageBox: {
    width: '100%',
    aspectRatio: '1',
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
    border: `1px solid ${colors.neutral[200]}`,
    transition: transitions.base,
  },
  link: {
    textDecoration: 'none',
    color: colors.text.primary,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    height: '100%',
    transition: transitions.base,
    '&:hover': {
      '& .artist-image-box': {
        borderColor: colors.primary.main,
        boxShadow: shadows.md,
      },
      '& .artist-name': {
        color: colors.primary.main,
      },
    },
  },
  text: {
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
    fontSize: { xs: typography.fontSize.xs, sm: typography.fontSize.sm },
    color: colors.text.primary,
    transition: transitions.fast,
    fontFamily: typography.fontFamily.display,
  }
};

export const gridHtmlElementStyles: { [key: string]: CSSProperties } = {
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
