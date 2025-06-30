import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
import { useAuth } from '../contexts/AuthContext';
import { validateLoginForm, ValidationErrors } from '../utils/validation';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, error: authError, clearError } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (authError) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate form
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      // Error is handled by auth context
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
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 10px ${theme.palette.primary.main}`,
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, #fff)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Giriş Yap
          </Typography>

          {authError && (
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
              {authError}
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
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifre"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
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
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Link 
                component={RouterLink} 
                to="/forgot-password" 
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
                Şifremi Unuttum
              </Link>
              <Link 
                component={RouterLink} 
                to="/register" 
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
                Hesabınız yok mu? Kayıt olun
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 