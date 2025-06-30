import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  useTheme,
} from '@mui/material';
import authService from '../services/authService';

const ForgotPassword: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.resetPassword(email);
      setSuccess('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Şifre sıfırlama işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      component="main" 
      maxWidth="xs"
      sx={{ 
        fontFamily: 'Poppins, sans-serif',
        py: 8,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
            border: `2px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 20px ${theme.palette.primary.main}, inset 0 0 20px ${theme.palette.primary.main}1A`,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <Typography 
            component="h1" 
            variant="h5"
            sx={{ 
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 20px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main}, 2px 2px 4px rgba(0,0,0,0.8)`,
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, #FFFFFF)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Şifremi Unuttum
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2, 
              textAlign: 'center',
              color: '#F0F0F0',
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 12px ${theme.palette.primary.main}, 0 0 18px ${theme.palette.primary.main}80, 1px 1px 2px rgba(0,0,0,0.6)`,
              fontWeight: 500,
              fontSize: '1rem',
            }}
          >
            E-posta adresinizi girin. Size şifre sıfırlama bağlantısı göndereceğiz.
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mt: 2,
                background: `${theme.palette.background.default}E6`,
                border: '1px solid #ff4444',
                boxShadow: '0 0 10px #ff4444',
                color: '#ff4444',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                width: '100%', 
                mt: 2,
                background: `${theme.palette.background.default}E6`,
                border: `1px solid ${theme.palette.primary.main}`,
                boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                color: theme.palette.primary.main,
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-posta Adresi"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: theme.palette.primary.main,
                  fontFamily: 'Poppins, sans-serif',
                  '& fieldset': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 5px ${theme.palette.primary.main}`,
                  },
                  '&:hover fieldset': {
                    borderColor: '#fff',
                    boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#fff',
                    boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                  },
                  '&.Mui-error fieldset': {
                    borderColor: '#ff4444',
                    boxShadow: '0 0 5px #ff4444',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.primary.main,
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: `0 0 3px ${theme.palette.primary.main}`,
                  '&.Mui-focused': {
                    color: '#fff',
                  },
                  '&.Mui-error': {
                    color: '#ff4444',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff4444',
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: '0 0 2px #ff4444',
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="outlined"
              sx={{ 
                mt: 3, 
                mb: 2,
                color: theme.palette.primary.main,
                border: `2px solid ${theme.palette.primary.main}`,
                boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                background: `${theme.palette.primary.main}1A`,
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 'bold',
                '&:hover': {
                  background: `${theme.palette.primary.main}33`,
                  boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                  border: '2px solid #fff',
                },
                '&:disabled': {
                  color: `${theme.palette.primary.main}80`,
                  border: `2px solid ${theme.palette.primary.main}80`,
                  boxShadow: 'none',
                },
              }}
              disabled={loading}
            >
              {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link 
                component={RouterLink} 
                to="/login" 
                variant="body2"
                sx={{ 
                  color: theme.palette.primary.main,
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: `0 0 3px ${theme.palette.primary.main}`,
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#fff',
                    textShadow: `0 0 5px ${theme.palette.primary.main}`,
                  },
                }}
              >
                Giriş sayfasına dön
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 