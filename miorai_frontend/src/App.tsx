import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, useTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import TournamentPage from './pages/TournamentPage';
import PublicTournaments from './pages/PublicTournaments';
import About from './pages/About';
import Contact from './pages/Contact';
import VerifyEmail from './pages/VerifyEmail';

const AppContent: React.FC = () => {
  const theme = useTheme();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Box 
          sx={{ 
            minHeight: '100vh', 
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)` 
          }}
        >
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Default route - redirect based on auth status */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournament"
              element={
                <ProtectedRoute>
                  <TournamentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/public-tournaments"
              element={
                <ProtectedRoute>
                  <PublicTournaments />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
      </AuthProvider>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <AppContent />
    </CustomThemeProvider>
  );
};

export default App;
