import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { CheckCircle, Email } from '@mui/icons-material';
import authService from '../services/authService';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      await authService.verifyEmail(token);
      setVerified(true);
    } catch (err: any) {
      console.error('Email verification error:', err);
      setError(err.response?.data?.detail || 'Email doğrulama başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Container 
      component="main" 
      maxWidth="sm"
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
          {loading ? (
            <>
              <CircularProgress 
                size={60} 
                sx={{ 
                  color: theme.palette.primary.main,
                  mb: 2 
                }} 
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontFamily: 'Poppins, sans-serif',
                  textAlign: 'center'
                }}
              >
                Email doğrulanıyor...
              </Typography>
            </>
          ) : verified ? (
            <>
              <CheckCircle 
                sx={{ 
                  fontSize: 60, 
                  color: '#4caf50',
                  mb: 2 
                }} 
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#4caf50',
                  fontFamily: 'Poppins, sans-serif',
                  textAlign: 'center',
                  mb: 2
                }}
              >
                Email Başarıyla Doğrulandı!
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.primary,
                  fontFamily: 'Poppins, sans-serif',
                  textAlign: 'center',
                  mb: 3
                }}
              >
                Hesabınız artık aktif. Giriş yaparak turnuvalarınızı oluşturmaya başlayabilirsiniz.
              </Typography>
              <Button
                variant="contained"
                onClick={handleLogin}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, #fff)`,
                  color: '#000',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: `linear-gradient(45deg, #fff, ${theme.palette.primary.main})`,
                    transform: 'scale(1.05)',
                  },
                }}
              >
                Giriş Yap
              </Button>
            </>
          ) : (
            <>
              <Email 
                sx={{ 
                  fontSize: 60, 
                  color: theme.palette.primary.main,
                  mb: 2 
                }} 
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontFamily: 'Poppins, sans-serif',
                  textAlign: 'center',
                  mb: 2
                }}
              >
                Email Doğrulama
              </Typography>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    width: '100%', 
                    mb: 2,
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
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.primary,
                  fontFamily: 'Poppins, sans-serif',
                  textAlign: 'center',
                  mb: 3
                }}
              >
                Email doğrulama işlemi başarısız oldu. Lütfen tekrar deneyin veya giriş sayfasına dönün.
              </Typography>
              <Button
                variant="contained"
                onClick={handleLogin}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, #fff)`,
                  color: '#000',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: `linear-gradient(45deg, #fff, ${theme.palette.primary.main})`,
                    transform: 'scale(1.05)',
                  },
                }}
              >
                Giriş Sayfasına Dön
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmail; 