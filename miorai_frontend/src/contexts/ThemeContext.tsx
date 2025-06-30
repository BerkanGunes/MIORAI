import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { themes, DEFAULT_THEME_NAME, AppThemeName } from '../themes';

interface ThemeContextValue {
  themeName: AppThemeName;
  setThemeName: (name: AppThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeName: DEFAULT_THEME_NAME,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setThemeName: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

interface Props {
  children: React.ReactNode;
}

export const CustomThemeProvider: React.FC<Props> = ({ children }) => {
  const [themeName, setThemeName] = useState<AppThemeName>(() => {
    const persisted = localStorage.getItem('miorai-theme');
    if (persisted === 'nightPetrol' || persisted === 'blackCobalt') return persisted;
    return DEFAULT_THEME_NAME;
  });

  useEffect(() => {
    localStorage.setItem('miorai-theme', themeName);
  }, [themeName]);

  const value = useMemo(() => ({ themeName, setThemeName }), [themeName]);

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={themes[themeName]}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}; 