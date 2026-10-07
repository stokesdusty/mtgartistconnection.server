import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { GlobalStyles, ThemeProvider } from '@mui/material';
import { ColorMode, vaultCssVars, vaultPalettes } from './styles/design-tokens';
import { buildMuiTheme } from './styles/mui-theme';

interface ColorModeContextValue {
  mode: ColorMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'dark',
  toggleColorMode: () => {},
});

// Dark is the default; only an explicit stored 'light' opts out.
// Keep in sync with the inline script in public/index.html.
const readStoredMode = (): ColorMode => {
  try {
    return localStorage.getItem('color-mode') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

const tokenStyles = {
  ':root': { ...vaultCssVars('light'), colorScheme: 'light' },
  'html[data-dark]': { ...vaultCssVars('dark'), colorScheme: 'dark' },
};

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ColorMode>(readStoredMode);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.dataset.dark = '';
    } else {
      delete document.documentElement.dataset.dark;
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', vaultPalettes[mode].bg);
    try {
      localStorage.setItem('color-mode', mode);
    } catch {
      // Storage unavailable (private mode) — the toggle still works for this visit.
    }
  }, [mode]);

  const toggleColorMode = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  const theme = useMemo(() => buildMuiTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <GlobalStyles styles={tokenStyles} />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => useContext(ColorModeContext);
