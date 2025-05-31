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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Basit Hoş Geldiniz Mesajı */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Hoş Geldiniz, {user?.firstName || 'Kullanıcı'}!
          </Typography>
          <Typography variant="body1" paragraph>
            Miorai'ye hoş geldiniz. Bu platform, dosya karşılaştırma ve analiz işlemlerinizi
            kolaylaştırmak için tasarlanmıştır.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {user?.email}
            {user?.emailVerified ? ' (✓ Doğrulanmış)' : ' (⚠ Doğrulanmamış)'}
          </Typography>
        </Paper>

        {/* Özellikler Grid */}
        <Grid container spacing={3} sx={{ mb: 3, justifyContent: 'center' }}>
          <Grid item xs={12} md={8} lg={6}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  🏆 Resim Turnuvası
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Resimlerinizi yükleyin ve hangisinin en iyisi olduğunu keşfedin!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Puan ve tur sistemli akıllı algoritma ile resimlerinizi karşılaştırın.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  variant="contained"
                  size="large" 
                  color="primary"
                  onClick={() => navigate('/tournament')}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                  }}
                >
                  🚀 Turnuvaya Başla
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Basit Bilgilendirme Kartı */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            🎯 Turnuva Nasıl Çalışır?
          </Typography>
          <Typography variant="body1" paragraph>
            1. "Turnuvaya Başla" butonuna tıklayın
          </Typography>
          <Typography variant="body1" paragraph>
            2. Resimlerinizi yükleyin (JPG, PNG - max 16MB)
          </Typography>
          <Typography variant="body1" paragraph>
            3. Turnuvayı başlatın ve maçlarda tercih ettiğiniz resmi seçin
          </Typography>
          <Typography variant="body1" paragraph>
            4. Akıllı algoritma ile kazananları görün! 🏆
          </Typography>
        </Paper>

        {/* Çıkış Butonu */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleLogout}
          >
            Çıkış Yap
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 