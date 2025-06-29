import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

// Test için basit tema
const theme = createTheme();

// Test wrapper bileşeni
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
  });

  test('redirects to login when not authenticated', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Login sayfasına yönlendirildiğini kontrol et
    expect(window.location.pathname).toBe('/login');
  });
});
