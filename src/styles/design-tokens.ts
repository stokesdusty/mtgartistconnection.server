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
    orange: '#c8731a',        // Burnt amber — collector-action moments (signing, live events)
    orangeLight: '#fdf0e0',  // Light amber tint for chip/badge backgrounds
    orangeDark: '#9e5a12',   // Deep amber for hover states
    orangeOnDark: '#e8a060', // Readable amber for text on dark backgrounds
    blue: '#3498db',        // Info states
    blueDark: '#2980b9',    // Info hover states
    red: '#e74c3c',         // Error states
    redLight: '#fef5f5',    // Light red background for error states
    green: '#27ae60',       // Success states
    greenLight: '#eafaf1',  // Light green tint for chip/badge backgrounds
    greenRow: '#e4f2ea',    // Alternating row background
    greenRowHover: '#d4eadd', // Alternating row hover background
    greenDark: '#1e8449',  // Dark green for hover states
    greenOnDark: '#6fcf97', // Readable green for text on dark backgrounds
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

// CSS var references — values flip when html[data-dark] is toggled.
// Use these instead of `colors` for any token that differs between modes.
export const themeColors = {
  background: {
    default: 'var(--c-bg-default)',
    paper:   'var(--c-bg-paper)',
    dark:    'var(--c-bg-dark)',
  },
  text: {
    primary:   'var(--c-text-primary)',
    secondary: 'var(--c-text-secondary)',
    disabled:  'var(--c-text-disabled)',
    hint:      'var(--c-text-hint)',
  },
  neutral: {
    ...colors.neutral,
    white: 'var(--c-neutral-white)',
    50:    'var(--c-neutral-50)',
    100:   'var(--c-neutral-100)',
    200:   'var(--c-neutral-200)',
    300:   'var(--c-neutral-300)',
  },
  primary: {
    ...colors.primary,
    main:    'var(--c-primary-main)',
    lighter: 'var(--c-primary-lighter)',
  },
  accent: colors.accent,
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
  // Geist for all UI and headings, Geist Mono for eyebrows, counts and metadata.
  // Loaded in public/index.html. primary/display/heading are kept as aliases.
  fontFamily: {
    primary: '"Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: '"Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    heading: '"Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '2rem',     // 32px
    '4xl': '2.75rem',  // 44px
    '5xl': '3.75rem',  // 60px
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

// ─── Vault redesign tokens ───────────────────────────────────────────────────
// Single source of truth for the "Vault" palettes. ColorModeContext turns these
// into CSS custom properties on <html> (switched by html[data-dark]) and builds
// the MUI theme from the same values. Use `vault` (var refs) in sx/styles.

export type ColorMode = 'light' | 'dark';

export interface VaultPalette {
  bg: string;
  surface: string;
  slab1: string;
  slab2: string;
  line: string;
  lineStrong: string;
  fg: string;
  muted: string;
  faint: string;
  chip: string;
  chipStrong: string;
  stripe1: string;
  stripe2: string;
  shadow: string;
  ok: string;
  okBg: string;
}

export interface VaultAccent {
  accent: string;
  accentText: string;
  onAccent: string;
  glow: string;
  glowStrong: string;
}

export const vaultPalettes: Record<ColorMode, VaultPalette> = {
  dark: {
    bg: '#0f0e0d',
    surface: '#1a1816',
    slab1: '#2b2825',
    slab2: '#151312',
    line: 'rgba(255,255,255,.07)',
    lineStrong: 'rgba(255,255,255,.12)',
    fg: '#f3efe9',
    muted: '#a39d95',
    faint: '#7d776f',
    chip: 'rgba(255,255,255,.04)',
    chipStrong: 'rgba(255,255,255,.10)',
    stripe1: '#1d1b19',
    stripe2: '#252220',
    shadow: 'rgba(0,0,0,.45)',
    ok: '#6fd39a',
    okBg: 'rgba(111,211,154,.1)',
  },
  light: {
    bg: '#f5f2ed',
    surface: '#ffffff',
    slab1: '#ffffff',
    slab2: '#ebe6de',
    line: 'rgba(30,22,14,.09)',
    lineStrong: 'rgba(30,22,14,.15)',
    fg: '#1a1714',
    muted: '#5f5850',
    faint: '#8a8279',
    chip: 'rgba(30,22,14,.04)',
    chipStrong: 'rgba(30,22,14,.09)',
    stripe1: '#e9e4dc',
    stripe2: '#f1ede7',
    shadow: 'rgba(70,50,25,.10)',
    ok: '#1f7a47',
    okBg: 'rgba(31,122,71,.08)',
  },
};

export const vaultAccents: Record<'emerald' | 'amber' | 'violet', Record<ColorMode, VaultAccent>> = {
  emerald: {
    dark:  { accent: '#5fc08a', accentText: '#7fd4a3', onAccent: '#06170d', glow: 'rgba(95,192,138,.12)', glowStrong: 'rgba(95,192,138,.28)' },
    light: { accent: '#2d6a46', accentText: '#245638', onAccent: '#ffffff', glow: 'rgba(45,106,70,.08)', glowStrong: 'rgba(45,106,70,.2)' },
  },
  amber: {
    dark:  { accent: '#e8a060', accentText: '#f0b47c', onAccent: '#1a1208', glow: 'rgba(232,160,96,.12)', glowStrong: 'rgba(232,160,96,.28)' },
    light: { accent: '#c27026', accentText: '#9a520f', onAccent: '#ffffff', glow: 'rgba(194,112,38,.09)', glowStrong: 'rgba(194,112,38,.22)' },
  },
  violet: {
    dark:  { accent: '#a98bf0', accentText: '#c0a9f7', onAccent: '#140b28', glow: 'rgba(169,139,240,.13)', glowStrong: 'rgba(169,139,240,.3)' },
    light: { accent: '#6b4fc4', accentText: '#553aa8', onAccent: '#ffffff', glow: 'rgba(107,79,196,.08)', glowStrong: 'rgba(107,79,196,.2)' },
  },
};

export const VAULT_ACCENT = vaultAccents.emerald;

// Workflow status tones (signing tracker chips, error text). Not in the handoff;
// tuned to read on `surface` in both modes, mirroring the accent's fg/bg pairing.
export interface VaultStatusPalette {
  info: string;
  infoBg: string;
  warn: string;
  warnBg: string;
  danger: string;
  dangerBg: string;
  violet: string;
  violetBg: string;
}

export const vaultStatusPalettes: Record<ColorMode, VaultStatusPalette> = {
  dark: {
    info: '#8dbbea',
    infoBg: 'rgba(127,178,229,.12)',
    warn: '#f0b47c',
    warnBg: 'rgba(232,160,96,.12)',
    danger: '#f39a8f',
    dangerBg: 'rgba(240,138,126,.12)',
    violet: '#c0a9f7',
    violetBg: 'rgba(169,139,240,.13)',
  },
  light: {
    info: '#2f6497',
    infoBg: 'rgba(47,100,151,.08)',
    warn: '#9a520f',
    warnBg: 'rgba(194,112,38,.09)',
    danger: '#b3362a',
    dangerBg: 'rgba(179,54,42,.08)',
    violet: '#553aa8',
    violetBg: 'rgba(107,79,196,.08)',
  },
};

// Badges and text sitting on top of artwork always use the dark treatment.
export const onArt = {
  badgeBg: 'rgba(15,14,13,.78)',
  badgeBlur: 'blur(8px)',
  text: '#f3efe9',
  textSecondary: '#c9c3bb',
  scrim: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(10,9,8,.88) 100%)',
};

// Legacy --c-* variables, remapped onto the Vault palettes so screens that
// still use `themeColors` pick up the new look until they are restyled.
const legacyVars: Record<ColorMode, Record<string, string>> = {
  dark: {
    '--c-bg-default': '#0f0e0d',
    '--c-bg-paper': '#1a1816',
    '--c-bg-dark': '#221f1d',
    '--c-text-primary': '#f3efe9',
    '--c-text-secondary': '#a39d95',
    '--c-text-disabled': '#5a554f',
    '--c-text-hint': '#7d776f',
    '--c-neutral-white': '#0f0e0d',
    '--c-neutral-50': '#1a1816',
    '--c-neutral-100': '#221f1d',
    '--c-neutral-200': '#2e2b28',
    '--c-neutral-300': '#3d3935',
    '--c-primary-main': '#5fc08a',
    '--c-primary-lighter': '#16291e',
    '--c-primary-main-rgb': '95, 192, 138',
  },
  light: {
    '--c-bg-default': '#f5f2ed',
    '--c-bg-paper': '#ffffff',
    '--c-bg-dark': '#ebe6de',
    '--c-text-primary': '#1a1714',
    '--c-text-secondary': '#5f5850',
    '--c-text-disabled': '#b5aea5',
    '--c-text-hint': '#8a8279',
    '--c-neutral-white': '#ffffff',
    '--c-neutral-50': '#faf8f4',
    '--c-neutral-100': '#efebe5',
    '--c-neutral-200': '#e4dfd7',
    '--c-neutral-300': '#d6d0c6',
    '--c-primary-main': '#2d6a46',
    '--c-primary-lighter': '#eaf3ee',
    '--c-primary-main-rgb': '45, 106, 70',
  },
};

const toKebab = (key: string) => key.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();

/** CSS custom properties for one mode, e.g. { '--bg': '#0f0e0d', '--slab-1': … }. */
export const vaultCssVars = (mode: ColorMode): Record<string, string> => {
  const vars: Record<string, string> = { ...legacyVars[mode] };
  const tokens = { ...vaultPalettes[mode], ...VAULT_ACCENT[mode], ...vaultStatusPalettes[mode] };
  Object.entries(tokens).forEach(([key, value]) => {
    vars[`--${toKebab(key)}`] = value;
  });
  return vars;
};

// var() references for use in sx / style objects. Values flip with the mode.
export const vault = {
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  slab1: 'var(--slab-1)',
  slab2: 'var(--slab-2)',
  line: 'var(--line)',
  lineStrong: 'var(--line-strong)',
  fg: 'var(--fg)',
  muted: 'var(--muted)',
  faint: 'var(--faint)',
  chip: 'var(--chip)',
  chipStrong: 'var(--chip-strong)',
  stripe1: 'var(--stripe-1)',
  stripe2: 'var(--stripe-2)',
  shadow: 'var(--shadow)',
  ok: 'var(--ok)',
  okBg: 'var(--ok-bg)',
  accent: 'var(--accent)',
  accentText: 'var(--accent-text)',
  onAccent: 'var(--on-accent)',
  glow: 'var(--glow)',
  glowStrong: 'var(--glow-strong)',
  info: 'var(--info)',
  infoBg: 'var(--info-bg)',
  warn: 'var(--warn)',
  warnBg: 'var(--warn-bg)',
  danger: 'var(--danger)',
  dangerBg: 'var(--danger-bg)',
  violet: 'var(--violet)',
  violetBg: 'var(--violet-bg)',
};

export const vaultRadii = {
  pill: '999px',
  slab: '14px',
  slabSignature: '16px',
  slabInner: '10px',
  card: '12px',
  panel: '14px',
  input: '8px',
  search: '14px',
  segmented: '10px',
  segmentedInner: '7px',
};

export const vaultEffects = {
  slabFrame: `linear-gradient(160deg, ${vault.slab1}, ${vault.slab2})`,
  slabShadow: `0 12px 30px ${vault.shadow}`,
  slabHoverShadow: `0 18px 50px ${vault.glowStrong}`,
  searchShadow: `0 0 0 4px ${vault.glow}, 0 20px 60px ${vault.shadow}`,
  heroGlow: `radial-gradient(ellipse 60% 70% at 50% 0%, ${vault.glow}, transparent 70%)`,
  heroGlowLeft: `radial-gradient(ellipse 60% 70% at 0% 0%, ${vault.glow}, transparent 70%)`,
  liveDotShadow: `0 0 8px ${vault.accent}`,
  stripes: `repeating-linear-gradient(135deg, ${vault.stripe1} 0 8px, ${vault.stripe2} 8px 16px)`,
  transition: '.25s ease',
};

// Gutter is 40px on desktop, 18px at ≤600px (mobile spec).
export const vaultLayout = {
  gutter: '40px',
  gutterMobile: '18px',
  tapTarget: '40px',
  mobileMax: 600,
  tabletMax: 1100,
};

// Media queries for sx objects, e.g. { [vaultMedia.mobile]: { padding: 4 } }.
export const vaultMedia = {
  mobile: '@media (max-width: 600px)',
  tablet: '@media (max-width: 1100px)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
};

// The on-art treatment always uses the dark accent, regardless of mode.
export const onArtAccent = {
  border: 'rgba(95,192,138,.5)',
  text: VAULT_ACCENT.dark.accentText,
  dot: VAULT_ACCENT.dark.accent,
};
