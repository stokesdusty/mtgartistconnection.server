import { CSSProperties } from "react";
import { colors, themeColors, spacing, shadows, typography, transitions, borderRadius } from './design-tokens';
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
    position: 'relative',
    width: '100%',
    aspectRatio: '1',
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    backgroundColor: themeColors.neutral[100],
    border: `1px solid ${themeColors.neutral[200]}`,
    transition: transitions.base,
  },
  eventDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: colors.accent.orange,
    border: `2px solid ${colors.neutral.white}`,
    zIndex: 1,
  },
  link: {
    textDecoration: 'none',
    color: themeColors.text.primary,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    height: '100%',
    transition: transitions.base,
    '&:hover': {
      '& .artist-image-box': {
        borderColor: themeColors.primary.main,
        boxShadow: shadows.md,
      },
      '& .artist-name': {
        color: themeColors.primary.main,
      },
    },
  },
  text: {
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
    fontSize: { xs: typography.fontSize.xs, sm: typography.fontSize.sm },
    color: themeColors.text.primary,
    transition: transitions.fast,
    fontFamily: typography.fontFamily.display,
  }
};

export const artistCompactStyles: Styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  imageBox: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1',
    overflow: 'hidden',
    borderRadius: borderRadius.md,
    backgroundColor: themeColors.neutral[100],
    border: `1px solid ${themeColors.neutral[200]}`,
    transition: transitions.base,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)',
    display: 'flex',
    alignItems: 'flex-end',
    padding: `${spacing.xs} ${spacing.sm}`,
    pointerEvents: 'none',
  },
  overlayName: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.display,
    lineHeight: typography.lineHeight.tight,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  } as any,
  link: {
    textDecoration: 'none',
    display: 'block',
    transition: transitions.base,
    '&:hover': {
      '& .artist-image-box': {
        borderColor: themeColors.primary.main,
        boxShadow: shadows.md,
      },
    },
  },
};

export const artistGalleryStyles: Styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  imageBox: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    backgroundColor: themeColors.neutral[100],
    border: `1px solid ${themeColors.neutral[200]}`,
    transition: transitions.base,
    '&:hover': {
      borderColor: themeColors.primary.main,
      boxShadow: shadows.md,
    },
    '&:hover .gallery-overlay': {
      opacity: 1,
    },
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 45%, transparent 70%)',
    opacity: 0,
    transition: transitions.base,
    display: 'flex',
    alignItems: 'flex-end',
    padding: spacing.md,
    pointerEvents: 'none',
  },
  overlayName: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.display,
    lineHeight: typography.lineHeight.tight,
  },
  link: {
    textDecoration: 'none',
    display: 'block',
    transition: transitions.base,
  },
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
