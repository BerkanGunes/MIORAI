import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  useTheme,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ fontFamily: 'Poppins, sans-serif' }}>
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Basit Hoş Geldiniz Mesajı */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
            border: `2px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 20px ${theme.palette.primary.main}, inset 0 0 20px ${theme.palette.primary.main}1A`,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
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
            Hoş Geldiniz, {user?.firstName || 'Kullanıcı'}!
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 3px ${theme.palette.primary.main}`,
            }}
          >
            Miorai'ye hoş geldiniz. Bu platform, dosya karşılaştırma ve analiz işlemlerinizi
            kolaylaştırmak için tasarlanmıştır.
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: `${theme.palette.primary.main}CC`,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 2px ${theme.palette.primary.main}`,
            }}
          >
            Email: {user?.email}
            {user?.emailVerified ? ' (✓ Doğrulanmış)' : ' (⚠ Doğrulanmamış)'}
          </Typography>
        </Paper>

        {/* Ana Seçenekler */}
        <Grid container spacing={4} sx={{ mb: 4, justifyContent: 'center' }}>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                textAlign: 'center',
                background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                border: `2px solid ${theme.palette.primary.main}`,
                boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 0 25px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main}4D`,
                  transform: 'translateY(-2px)',
                },
                height: '100%',
              }}
            >
              <CardContent sx={{ background: `${theme.palette.background.default}CC`, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 10px ${theme.palette.primary.main}`,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, #fff)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  🎯 Turnuvaya Katıl
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 2,
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 3px ${theme.palette.primary.main}`,
                    flexGrow: 1,
                  }}
                >
                  Diğer kullanıcıların oluşturduğu turnuvalara katılın ve onların resimlerini karşılaştırın!
                </Typography>
                <Button 
                  variant="outlined"
                  size="large" 
                  onClick={() => navigate('/public-tournaments')}
                  sx={{ 
                    mt: 'auto',
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    fontFamily: 'Poppins, sans-serif',
                    color: theme.palette.primary.main,
                    border: `2px solid ${theme.palette.primary.main}`,
                    boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                    background: `${theme.palette.primary.main}1A`,
                    '&:hover': {
                      background: `${theme.palette.primary.main}33`,
                      boxShadow: `0 0 25px ${theme.palette.primary.main}`,
                      border: '2px solid #fff',
                    },
                  }}
                >
                  🚀 Turnuvaya Katıl
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                textAlign: 'center',
                background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                border: `2px solid ${theme.palette.primary.main}`,
                boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 0 25px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main}4D`,
                  transform: 'translateY(-2px)',
                },
                height: '100%',
              }}
            >
              <CardContent sx={{ background: `${theme.palette.background.default}CC`, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 10px ${theme.palette.primary.main}`,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, #fff)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  🏆 Kendi Turnuvanı Yarat
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 2,
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 3px ${theme.palette.primary.main}`,
                    flexGrow: 1,
                  }}
                >
                  Kendi resimlerinizi yükleyin ve hangisinin en iyisi olduğunu keşfedin!
                </Typography>
                <Button 
                  variant="outlined"
                  size="large" 
                  onClick={() => navigate('/tournament')}
                  sx={{ 
                    mt: 'auto',
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    fontFamily: 'Poppins, sans-serif',
                    color: theme.palette.primary.main,
                    border: `2px solid ${theme.palette.primary.main}`,
                    boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                    background: `${theme.palette.primary.main}1A`,
                    '&:hover': {
                      background: `${theme.palette.primary.main}33`,
                      boxShadow: `0 0 25px ${theme.palette.primary.main}`,
                      border: '2px solid #fff',
                    },
                  }}
                >
                  ✨ Turnuva Yarat
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Basit Bilgilendirme Kartı */}
        <Paper 
          sx={{ 
            p: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
            border: `1px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 10px ${theme.palette.primary.main}`,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 5px ${theme.palette.primary.main}`,
              fontWeight: 'bold',
            }}
          >
            🎯 Turnuva Nasıl Çalışır?
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 3px ${theme.palette.primary.main}`,
            }}
          >
            1. "Turnuvaya Başla" butonuna tıklayın
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 3px ${theme.palette.primary.main}`,
            }}
          >
            2. Resimlerinizi yükleyin (JPG, PNG - max 16MB)
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 3px ${theme.palette.primary.main}`,
            }}
          >
            3. Turnuvayı başlatın ve maçlarda tercih ettiğiniz resmi seçin
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 3px ${theme.palette.primary.main}`,
            }}
          >
            4. Akıllı algoritma ile kazananları görün! 🏆
          </Typography>
        </Paper>

        {/* Çıkış Butonu */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{ 
              color: theme.palette.primary.main,
              border: `2px solid ${theme.palette.primary.main}`,
              boxShadow: `0 0 10px ${theme.palette.primary.main}`,
              background: `${theme.palette.primary.main}1A`,
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                background: `${theme.palette.primary.main}33`,
                boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                border: '2px solid #fff',
              },
            }}
          >
            Çıkış Yap
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 