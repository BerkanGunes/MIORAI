import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';

const About: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ py: 4, fontFamily: 'Poppins, sans-serif' }}>
      <Paper 
        sx={{ 
          p: 4,
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
          border: `2px solid ${theme.palette.primary.main}`,
          boxShadow: `0 0 20px ${theme.palette.primary.main}, inset 0 0 20px ${theme.palette.primary.main}1A`,
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <Typography 
          variant="h3" 
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
            textAlign: 'center',
            mb: 4,
          }}
        >
          🏆 MIORAI Hakkında
        </Typography>

        <Typography 
          variant="h6" 
          paragraph
          sx={{ 
            color: theme.palette.primary.main,
            fontFamily: 'Poppins, sans-serif',
            textShadow: `0 0 5px ${theme.palette.primary.main}`,
            fontWeight: 'bold',
            mb: 3,
          }}
        >
          MIORAI Nedir?
        </Typography>

        <Typography 
          variant="body1" 
          paragraph
          sx={{ 
            color: theme.palette.primary.main,
            fontFamily: 'Poppins, sans-serif',
            textShadow: `0 0 3px ${theme.palette.primary.main}`,
            lineHeight: 1.8,
          }}
        >
          MIORAI, resimlerinizi karşılaştırarak en iyisini belirlemenize yardımcı olan 
          gelişmiş bir turnuva platformudur. Akıllı algoritma sistemi ile resimlerinizi 
          eşleştirip, adil bir turnuva formatında yarıştırır.
        </Typography>

        <Typography 
          variant="body1" 
          paragraph
          sx={{ 
            color: theme.palette.primary.main,
            fontFamily: 'Poppins, sans-serif',
            textShadow: `0 0 3px ${theme.palette.primary.main}`,
            lineHeight: 1.8,
          }}
        >
          Puan ve tur sistemli algoritmamız sayesinde, her resim adil bir şekilde 
          değerlendirilir ve gerçek bir kazanan belirlenir.
        </Typography>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 5px ${theme.palette.primary.main}`,
              fontWeight: 'bold',
            }}
          >
            ✨ Yakında daha fazla özellik gelecek! ✨
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default About; 