import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  Divider,
  useTheme,
} from '@mui/material';
import {
  EmojiEvents,
  PhotoCamera,
  Sports,
} from '@mui/icons-material';
import { Match, TournamentImage } from '../../types/tournament';

interface ImageMatchCardProps {
  match: Match;
  onSelectWinner: (winnerId: number) => void;
  loading?: boolean;
}

const getNameBeforeDot = (name: string) => {
  const idx = name.indexOf('.')
  return idx === -1 ? name : name.substring(0, idx)
}

const ImageMatchCard: React.FC<ImageMatchCardProps> = ({
  match,
  onSelectWinner,
  loading = false,
}) => {
  const theme = useTheme();

  return (
    <Paper 
      elevation={8} 
      sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        p: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        color: theme.palette.primary.main,
        border: `2px solid ${theme.palette.primary.main}`,
        boxShadow: `0 0 20px ${theme.palette.primary.main}, inset 0 0 20px ${theme.palette.primary.main}1A`,
        fontFamily: 'Poppins, sans-serif',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, transparent 30%, ${theme.palette.primary.main}1A 50%, transparent 70%)`,
          animation: 'shimmer 3s ease-in-out infinite',
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif',
            textShadow: `0 0 10px ${theme.palette.primary.main}`,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, #fff)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          �� MAÇIN KAZANANI SEÇİN
        </Typography>
        <Chip
          label={`Round ${match.round_number} - Maç ${match.match_index + 1}`}
          sx={{ 
            bgcolor: `${theme.palette.primary.main}1A`, 
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif',
            border: `1px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 10px ${theme.palette.primary.main}`,
            '&:hover': {
              boxShadow: `0 0 15px ${theme.palette.primary.main}`,
            },
          }}
        />
      </Box>

      {/* VS Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
        {/* Image 1 */}
        <Box sx={{ flex: 1 }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
              border: `2px solid ${theme.palette.primary.main}`,
              boxShadow: `0 0 15px ${theme.palette.primary.main}`,
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0 0 25px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main}4D`,
                border: '2px solid #fff',
              },
            }}
            onClick={() => !loading && onSelectWinner(match.image1.id)}
          >
            <Box
              sx={{
                position: 'relative',
                paddingTop: '100%', // 1:1 aspect ratio
                overflow: 'hidden',
              }}
            >
              <img
                src={match.image1.image_url}
                alt={match.image1.name}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: `linear-gradient(transparent, ${theme.palette.background.default}E6)`,
                  color: theme.palette.primary.main,
                  p: 2,
                  borderTop: `1px solid ${theme.palette.primary.main}`,
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 5px ${theme.palette.primary.main}`,
                  }}
                >
                  {match.image1.name}
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ textAlign: 'center', background: `${theme.palette.background.default}CC` }}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<EmojiEvents sx={{ color: theme.palette.primary.main }} />}
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWinner(match.image1.id);
                }}
                sx={{ 
                  fontWeight: 'bold',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontFamily: 'Poppins, sans-serif',
                  color: theme.palette.primary.main,
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                  background: `${theme.palette.primary.main}1A`,
                  '&:hover': {
                    background: `${theme.palette.primary.main}33`,
                    boxShadow: `0 0 20px ${theme.palette.primary.main}`,
                    border: '2px solid #fff',
                  },
                  '&:disabled': {
                    color: `${theme.palette.primary.main}80`,
                    border: `2px solid ${theme.palette.primary.main}80`,
                    boxShadow: 'none',
                  },
                }}
              >
                {getNameBeforeDot(match.image1.name)}
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* VS Divider */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
          <Sports sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1, filter: `drop-shadow(0 0 10px ${theme.palette.primary.main})` }} />
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold', 
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 15px ${theme.palette.primary.main}`,
            }}
          >
            VS
          </Typography>
          <PhotoCamera sx={{ fontSize: 48, color: theme.palette.primary.main, mt: 1, filter: `drop-shadow(0 0 10px ${theme.palette.primary.main})` }} />
        </Box>

        {/* Image 2 */}
        <Box sx={{ flex: 1 }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
              border: `2px solid ${theme.palette.primary.main}`,
              boxShadow: `0 0 15px ${theme.palette.primary.main}`,
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0 0 25px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main}4D`,
                border: '2px solid #fff',
              },
            }}
            onClick={() => !loading && onSelectWinner(match.image2.id)}
          >
            <Box
              sx={{
                position: 'relative',
                paddingTop: '100%', // 1:1 aspect ratio
                overflow: 'hidden',
              }}
            >
              <img
                src={match.image2.image_url}
                alt={match.image2.name}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: `linear-gradient(transparent, ${theme.palette.background.default}E6)`,
                  color: theme.palette.primary.main,
                  p: 2,
                  borderTop: `1px solid ${theme.palette.primary.main}`,
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 5px ${theme.palette.primary.main}`,
                  }}
                >
                  {match.image2.name}
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ textAlign: 'center', background: `${theme.palette.background.default}CC` }}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<EmojiEvents sx={{ color: theme.palette.primary.main }} />}
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWinner(match.image2.id);
                }}
                sx={{ 
                  fontWeight: 'bold',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontFamily: 'Poppins, sans-serif',
                  color: theme.palette.primary.main,
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                  background: `${theme.palette.primary.main}1A`,
                  '&:hover': {
                    background: `${theme.palette.primary.main}33`,
                    boxShadow: `0 0 20px ${theme.palette.primary.main}`,
                    border: '2px solid #fff',
                  },
                  '&:disabled': {
                    color: `${theme.palette.primary.main}80`,
                    border: `2px solid ${theme.palette.primary.main}80`,
                    boxShadow: 'none',
                  },
                }}
              >
                {getNameBeforeDot(match.image2.name)}
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Paper>
  );
};

export default ImageMatchCard; 