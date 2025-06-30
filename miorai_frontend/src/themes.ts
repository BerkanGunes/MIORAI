import { createTheme } from '@mui/material/styles';

/*
 * Theme definitions created according to the color sets provided by the product owner.
 * 1. Night Navy – Dark Petrol Green (Gece Mavisi – Koyu Petrol Yeşili)
 * 2. Black – Dark Cobalt Blue (Siyah – Koyu Kobalt Mavisi)
 */

export type AppThemeName = 'nightPetrol' | 'blackCobalt';

export const themes = {
  nightPetrol: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#00D4AA', // Bright Teal/Turquoise for better visibility
      },
      secondary: {
        main: '#0B1524', // Night Navy
      },
      background: {
        default: '#0B1524',
        paper: '#05403E',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#E0E0E0',
      },
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
    },
  }),

  blackCobalt: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#5AA3F0', // Even brighter Cobalt Blue for better visibility
      },
      secondary: {
        main: '#0F2C59', // Slightly darker cobalt shade
      },
      background: {
        default: '#0D0D0D', // Black
        paper: '#153E7E',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#E0E0E0',
      },
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
    },
  }),
} as const;

export const DEFAULT_THEME_NAME: AppThemeName = 'nightPetrol'; 