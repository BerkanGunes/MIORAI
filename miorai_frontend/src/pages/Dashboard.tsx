import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

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

        {/* Basit Bilgilendirme Kartı */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Nasıl Başlarım?
          </Typography>
          <Typography variant="body1" paragraph>
            1. Sol menüden "Dosya Yükle" seçeneğine tıklayın
          </Typography>
          <Typography variant="body1" paragraph>
            2. Karşılaştırmak istediğiniz dosyaları seçin
          </Typography>
          <Typography variant="body1" paragraph>
            3. Karşılaştırma sonuçlarını görüntüleyin
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