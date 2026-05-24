import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ColorMode = 'light' | 'dark';

interface ColorModeContextValue {
  mode: ColorMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'light',
  toggleColorMode: () => {},
});

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ColorMode>(() =>
    localStorage.getItem('color-mode') === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.dataset.dark = '';
    } else {
      delete document.documentElement.dataset.dark;
    }
    localStorage.setItem('color-mode', mode);
  }, [mode]);

  const toggleColorMode = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => useContext(ColorModeContext);
