import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  PhotoCamera,
  PlayArrow,
  EmojiEvents,
  RestartAlt,
} from '@mui/icons-material';
import { Tournament, Match, TournamentImage } from '../../types/tournament';
import tournamentService from '../../services/tournamentService';
import ImageUpload from './ImageUpload';
import ImageMatchCard from './ImageMatchCard';

const ImageTournament: React.FC = () => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingResult, setSubmittingResult] = useState(false);

  // Tournament state
  const [step, setStep] = useState(0); // 0: Setup, 1: Playing, 2: Completed

  useEffect(() => {
    initializeTournament();
  }, []);

  const initializeTournament = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mevcut tournament'ı getirmeye çalış
      try {
        const existingTournament = await tournamentService.getTournament();
        setTournament(existingTournament);
        
        if (existingTournament.is_completed) {
          setStep(2);
        } else if (existingTournament.matches.length > 0) {
          setStep(1);
          // Mevcut maçı getir
          const match = await tournamentService.getCurrentMatch();
          setCurrentMatch(match);
        } else {
          setStep(0);
        }
      } catch (error) {
        // Tournament yoksa yeni oluştur
        const newTournament = await tournamentService.createTournament({
          name: 'Resim Turnuvası',
        });
        setTournament(newTournament);
        setStep(0);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Tournament yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, name: string) => {
    try {
      await tournamentService.uploadImage({ image: file, name });
      const updatedTournament = await tournamentService.getTournament();
      setTournament(updatedTournament);
    } catch (err: any) {
      throw err;
    }
  };

  const handleImageDelete = async (imageId: number) => {
    try {
      await tournamentService.deleteImage(imageId);
      const updatedTournament = await tournamentService.getTournament();
      setTournament(updatedTournament);
    } catch (err: any) {
      throw err;
    }
  };

  const handleStartTournament = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!tournament || !tournament.images || tournament.images.length < 2) {
        setError('En az 2 resim gerekli.');
        return;
      }

      const updatedTournament = await tournamentService.startTournament();
      setTournament(updatedTournament);
      
      // İlk maçı getir
      const match = await tournamentService.getCurrentMatch();
      setCurrentMatch(match);
      setStep(1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Tournament başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchResult = async (winnerId: number) => {
    if (!currentMatch) return;

    try {
      setSubmittingResult(true);
      setError(null);

      const updatedTournament = await tournamentService.submitMatchResult(
        currentMatch.id,
        winnerId
      );
      setTournament(updatedTournament);

      if (updatedTournament.is_completed) {
        setStep(2);
        setCurrentMatch(null);
      } else {
        // Sonraki maçı getir
        const nextMatch = await tournamentService.getCurrentMatch();
        setCurrentMatch(nextMatch);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Maç sonucu gönderilemedi.');
    } finally {
      setSubmittingResult(false);
    }
  };

  const handleRestart = async () => {
    try {
      setLoading(true);
      setError(null);

      // Yeni tournament oluştur
      const newTournament = await tournamentService.createTournament({
        name: 'Resim Turnuvası',
      });
      setTournament(newTournament);
      setCurrentMatch(null);
      setStep(0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Yeniden başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Resim Yükleme', 'Turnuva Oynama', 'Sonuçlar'];

  if (loading && !tournament) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper 
        elevation={4} 
        sx={{ 
          p: 4, 
          mb: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          🏆 RESİM TURNUVASI
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Resimlerinizi yükleyin ve hangisinin en iyisi olduğunu belirleyin!
        </Typography>
      </Paper>

      {/* Stepper */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={step} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Step 0: Image Upload */}
      {step === 0 && tournament && (
        <Box>
          <ImageUpload
            images={tournament.images || []}
            onUpload={handleImageUpload}
            onDelete={handleImageDelete}
            loading={loading}
            tournamentStarted={false}
          />

          {/* Start Tournament Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleStartTournament}
              disabled={loading || !tournament.images || (tournament.images.length < 2)}
              sx={{ 
                px: 4, 
                py: 2, 
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              TURNUVAYI BAŞLAT
            </Button>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {!tournament.images || tournament.images.length < 2 
                ? `En az 2 resim gerekli (${tournament.images?.length || 0}/2)` 
                : `${tournament.images.length} resim hazır!`
              }
            </Typography>
          </Box>
        </Box>
      )}

      {/* Step 1: Playing Tournament */}
      {step === 1 && tournament && (
        <Box>
          {/* Tournament Info */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Typography variant="h6">Round {tournament.current_round}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  Toplam Resim: {tournament.images?.filter(img => !img.name.startsWith('BOŞ_')).length || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body1">
                  Oynanan Maç: {tournament.matches?.filter(m => m.winner).length || 0}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Current Match */}
          {currentMatch ? (
            <ImageMatchCard
              match={currentMatch}
              onSelectWinner={handleMatchResult}
              loading={submittingResult}
            />
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography>Sonraki maç hazırlanıyor...</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Step 2: Tournament Completed */}
      {step === 2 && tournament && (
        <Box>
          <Paper 
            elevation={4} 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              mb: 4,
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: 'white',
            }}
          >
            <EmojiEvents sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              🎉 TURNUVA TAMAMLANDI!
            </Typography>
            <Typography variant="h6">
              Kazananlar aşağıda sıralanmıştır
            </Typography>
          </Paper>

          {/* Results */}
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
            🏆 SONUÇLAR
          </Typography>

          <Grid container spacing={3}>
            {(tournament.images || [])
              .filter(img => !img.name.startsWith('BOŞ_'))
              .sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                return b.rounds_played - a.rounds_played;
              })
              .map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={image.id}>
                  <Card 
                    sx={{ 
                      position: 'relative',
                      ...(index === 0 && {
                        border: '3px solid gold',
                        boxShadow: '0 8px 25px rgba(255,215,0,0.4)',
                      }),
                      ...(index === 1 && {
                        border: '3px solid silver',
                      }),
                      ...(index === 2 && {
                        border: '3px solid #CD7F32',
                      }),
                    }}
                  >
                    {/* Rank Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -10,
                        left: -10,
                        zIndex: 10,
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : '#CD7F32',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                      }}
                    >
                      {index + 1}
                    </Box>

                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '75%',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={image.image_url}
                        alt={image.name}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {image.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={`Puan: ${image.points}`}
                          color={image.points > 0 ? 'success' : 'error'}
                          variant="filled"
                        />
                        <Chip
                          label={`Tur: ${image.rounds_played}`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>

          {/* Restart Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<RestartAlt />}
              onClick={handleRestart}
              disabled={loading}
              sx={{ 
                px: 4, 
                py: 2, 
                fontSize: '1.1rem',
                fontWeight: 'bold',
              }}
            >
              YENİ TURNUVA BAŞLAT
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ImageTournament; 