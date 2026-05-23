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
    lighter: '#f0f9f4',   // Very light green tint for backgrounds
    contrast: '#ffffff',  // White text on dark green
  },

  // Neutral Palette - Warm paper-biased scale (~35° hue, 3-5% saturation)
  neutral: {
    white: '#ffffff',
    50: '#faf9f7',        // Warm paper white
    100: '#f5f3f0',       // Warm card backgrounds
    200: '#ebe8e3',       // Warm subtle borders
    300: '#dedad4',       // Warm dividers
    400: '#b9b4ae',       // Warm disabled states
    500: '#9c9690',       // Warm hint text
    600: '#736d67',       // Warm secondary text  (4.93:1 on white)
    700: '#5f5a54',       // Warm primary text light (6.73:1 on white)
    800: '#3e3b38',       // Warm dark text
    900: '#201e1b',       // Warm darkest          (16.9:1 on white)
    black: '#000000',
  },

  // Accent Colors - Minimal use
  accent: {
    orange: '#c8731a',      // Burnt amber — collector-action moments (signing, live events)
    orangeLight: '#fdf0e0', // Light amber tint for chip/badge backgrounds
    orangeDark: '#9e5a12',  // Deep amber for hover states
    blue: '#3498db',        // Info states
    blueDark: '#2980b9',    // Info hover states
    red: '#e74c3c',         // Error states
    redLight: '#fef5f5',    // Light red background for error states
    green: '#27ae60',       // Success states
    greenDark: '#1e8449',  // Dark green for hover states
  },

  // Background
  background: {
    default: '#ffffff',   // Main page background
    paper: '#faf9f7',     // Warm card/paper background
    dark: '#f5f3f0',      // Warm subtle section backgrounds
  },

  // Text
  text: {
    primary: '#201e1b',
    secondary: '#736d67',
    disabled: '#b9b4ae',
    hint: '#9c9690',
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
    heading: '"Fraunces", Georgia, serif',
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

// Social platform brand colors
export const platformColors: { [key: string]: string } = {
  twitter: '#1DA1F2',
  instagram: '#E4405F',
  bluesky: '#0085FF',
  facebook: '#1877F2',
  patreon: '#FF424D',
  other: '#757575',
};

// Status chip colors — semantic colors used in status/payment badges that
// fall outside the core palette (e.g. sent-blue, shipped-purple, complete-green).
export const statusColors = {
  sent:        { text: '#1565c0', bg: '#e3f2fd' },
  shippedBack: { text: '#6a1b9a', bg: '#f3e5f5' },
  complete:    { text: '#1b5e20', bg: '#e8f5e9' },
  unpaidText:  '#c62828',
  primaryMutedBorder: '#b5ceba',
};
