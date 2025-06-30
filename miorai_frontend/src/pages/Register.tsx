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
import Grid from '@mui/material/Unstable_Grid2';
import { useAuth } from '../contexts/AuthContext';
import { validateRegisterForm, ValidationErrors } from '../utils/validation';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, error: authError, clearError } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    const validationErrors = validateRegisterForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      navigate('/login');
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
            Kayıt Ol
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

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="Ad"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
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
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Soyad"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
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
              </Grid>
              <Grid xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="E-posta Adresi"
                  name="email"
                  autoComplete="email"
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
              </Grid>
              <Grid xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Şifre"
                  type="password"
                  id="password"
                  autoComplete="new-password"
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
              </Grid>
              <Grid xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Şifre Tekrar"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
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
              </Grid>
            </Grid>
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
              {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
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
                Zaten hesabınız var mı? Giriş yapın
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 