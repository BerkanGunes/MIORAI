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

const ImageMatchCard: React.FC<ImageMatchCardProps> = ({
  match,
  onSelectWinner,
  loading = false,
}) => {
  return (
    <Paper 
      elevation={8} 
      sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          🏆 MAÇIN KAZANANI SEÇİN
        </Typography>
        <Chip
          label={`Round ${match.round_number} - Maç ${match.match_index + 1}`}
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            color: 'white',
            fontWeight: 'bold',
          }}
        />
      </Box>

      {/* VS Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Image 1 */}
        <Box sx={{ flex: 1 }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 8px 25px rgba(255,215,0,0.4)',
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
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  color: 'white',
                  p: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {match.image1.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    size="small"
                    label={`Puan: ${match.image1.points}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    size="small"
                    label={`Tur: ${match.image1.rounds_played}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
              </Box>
            </Box>
            <CardContent sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                startIcon={<EmojiEvents />}
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWinner(match.image1.id);
                }}
                sx={{ 
                  fontWeight: 'bold',
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                BU KAZANDI!
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* VS Divider */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
          <Sports sx={{ fontSize: 48, color: 'gold', mb: 1 }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'gold' }}>
            VS
          </Typography>
          <PhotoCamera sx={{ fontSize: 48, color: 'gold', mt: 1 }} />
        </Box>

        {/* Image 2 */}
        <Box sx={{ flex: 1 }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 8px 25px rgba(255,215,0,0.4)',
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
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  color: 'white',
                  p: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {match.image2.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    size="small"
                    label={`Puan: ${match.image2.points}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    size="small"
                    label={`Tur: ${match.image2.rounds_played}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
              </Box>
            </Box>
            <CardContent sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                startIcon={<EmojiEvents />}
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWinner(match.image2.id);
                }}
                sx={{ 
                  fontWeight: 'bold',
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                BU KAZANDI!
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Instructions */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          🖱️ Kazananı seçmek için resme tıklayın veya "BU KAZANDI!" butonuna basın
        </Typography>
      </Box>
    </Paper>
  );
};

export default ImageMatchCard; 