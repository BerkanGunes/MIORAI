import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Email,
  GitHub,
  LinkedIn,
  Phone,
} from '@mui/icons-material';

const Contact: React.FC = () => {
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
          📞 İletişim
        </Typography>

        <Typography 
          variant="body1" 
          paragraph
          sx={{ 
            color: theme.palette.primary.main,
            fontFamily: 'Poppins, sans-serif',
            textShadow: `0 0 3px ${theme.palette.primary.main}`,
            textAlign: 'center',
            mb: 4,
          }}
        >
          Bizimle iletişime geçmek için aşağıdaki kanalları kullanabilirsiniz:
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                border: `1px solid ${theme.palette.primary.main}`,
                boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Email sx={{ 
                  fontSize: 48, 
                  color: theme.palette.primary.main, 
                  mb: 2, 
                  filter: `drop-shadow(0 0 15px ${theme.palette.primary.main}) drop-shadow(0 0 20px ${theme.palette.primary.main})` 
                }} />
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
                  E-posta
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: `${theme.palette.primary.main}CC`,
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 2px ${theme.palette.primary.main}`,
                  }}
                >
                  info@miorai.com
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card
              sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                border: `1px solid ${theme.palette.primary.main}`,
                boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <GitHub sx={{ 
                  fontSize: 48, 
                  color: theme.palette.primary.main, 
                  mb: 2, 
                  filter: `drop-shadow(0 0 15px ${theme.palette.primary.main}) drop-shadow(0 0 20px ${theme.palette.primary.main})` 
                }} />
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
                  GitHub
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: `${theme.palette.primary.main}CC`,
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 2px ${theme.palette.primary.main}`,
                  }}
                >
                  github.com/miorai
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
            💬 Geri bildirimlerinizi bekliyoruz!
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Contact; 