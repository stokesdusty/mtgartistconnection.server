import { createTheme, Theme } from '@mui/material/styles';
import { ColorMode, typography, VAULT_ACCENT, vaultPalettes, vaultRadii } from './design-tokens';

// MUI needs literal colors (it derives light/dark/contrast shades), so the
// theme reads the same palette objects that generate the CSS custom properties.
export const buildMuiTheme = (mode: ColorMode): Theme => {
  const p = vaultPalettes[mode];
  const a = VAULT_ACCENT[mode];

  return createTheme({
    palette: {
      mode,
      primary: { main: a.accent, contrastText: a.onAccent },
      success: { main: p.ok },
      background: { default: p.bg, paper: p.surface },
      text: { primary: p.fg, secondary: p.muted, disabled: p.faint },
      divider: p.line,
      action: { hover: p.chip, selected: p.chipStrong },
    },
    // Geist everywhere; headings are 600 with tight tracking. Sizes stay per-screen.
    typography: {
      fontFamily: typography.fontFamily.primary,
      h1: { fontWeight: 600, letterSpacing: '-0.035em' },
      h2: { fontWeight: 600, letterSpacing: '-0.03em' },
      h3: { fontWeight: 600, letterSpacing: '-0.03em' },
      h4: { fontWeight: 600, letterSpacing: '-0.02em' },
      h5: { fontWeight: 600, letterSpacing: '-0.02em' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    },
    shape: { borderRadius: 8 },
    components: {
      // Dark-mode Paper otherwise gets a white elevation overlay that fights the palette.
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { border: `1px solid ${p.line}`, borderRadius: vaultRadii.card },
        },
      },
    },
  });
};
