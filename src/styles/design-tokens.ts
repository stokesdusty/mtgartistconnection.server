/**
 * Design Tokens - Minimalist Design System
 * Clean, modern aesthetic with darker green accents
 */

export const colors = {
  // Primary Palette - Darker greens for minimalist accent
  primary: {
    main: '#2d4a36',      // Dark forest green - main accent
    dark: '#1a2d21',      // Deeper green for hover states
    light: '#3c5c48',     // Slightly lighter for subtle variations
    contrast: '#ffffff',  // White text on dark green
  },

  // Neutral Palette - Clean minimalist grays
  neutral: {
    white: '#ffffff',
    50: '#fafafa',        // Lightest backgrounds
    100: '#f5f5f5',       // Card backgrounds
    200: '#eeeeee',       // Subtle borders
    300: '#e0e0e0',       // Dividers
    400: '#bdbdbd',       // Disabled states
    500: '#9e9e9e',       // Secondary text
    600: '#757575',       // Primary text light
    700: '#616161',       // Primary text
    800: '#424242',       // Dark text
    900: '#212121',       // Darkest text/backgrounds
    black: '#000000',
  },

  // Accent Colors - Minimal use
  accent: {
    orange: '#e67e22',    // Warmer, more muted orange for CTAs
    blue: '#3498db',      // Info states
    red: '#e74c3c',       // Error states
    green: '#27ae60',     // Success states
  },

  // Background
  background: {
    default: '#ffffff',   // Main page background
    paper: '#fafafa',     // Card/Paper background
    dark: '#f5f5f5',      // Subtle section backgrounds
  },

  // Text
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
    hint: '#9e9e9e',
  },
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  xxl: '3rem',      // 48px
  xxxl: '4rem',     // 64px
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  verySlow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const breakpoints = {
  xs: '0px',
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px',
};

// Helper function to create consistent hover effects
export const hoverEffect = {
  subtle: {
    transition: transitions.fast,
    '&:hover': {
      backgroundColor: colors.neutral[50],
    },
  },
  lift: {
    transition: transitions.base,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: shadows.lg,
    },
  },
  scale: {
    transition: transitions.base,
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
};

// Border utilities
export const borders = {
  thin: `1px solid ${colors.neutral[200]}`,
  medium: `2px solid ${colors.neutral[300]}`,
  thick: `3px solid ${colors.neutral[400]}`,
  primary: `2px solid ${colors.primary.main}`,
};
