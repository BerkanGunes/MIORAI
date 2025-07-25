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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
} from '@mui/material';
import {
  PlayArrow,
  EmojiEvents,
  RestartAlt,
} from '@mui/icons-material';
import { Tournament, Match } from '../../types/tournament';
import tournamentService from '../../services/tournamentService';
import ImageUpload from './ImageUpload';
import ImageMatchCard from './ImageMatchCard';
import CategorySelector from './CategorySelector';

const ImageTournament: React.FC = () => {
  const theme = useTheme();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingResult, setSubmittingResult] = useState(false);
  
  // Public modal states
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  const [makingPublic, setMakingPublic] = useState(false);

  // Tournament state
  const [step, setStep] = useState(0); // 0: Setup, 1: Playing, 2: Completed
  
  // Kategori state
  const [selectedCategory, setSelectedCategory] = useState('general');

  // Tahmin state
  const [matchPrediction, setMatchPrediction] = useState<string | null>(null);

  useEffect(() => {
    initializeTournament();
  }, [selectedCategory]);

  useEffect(() => {
    if (tournament && step === 1) {
      console.log('Tournament değişti, tahmin hesaplanıyor...');
      calculateMatchPrediction();
    }
  }, [tournament, step]);

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
        } else if (existingTournament.matches && existingTournament.matches.length > 0) {
          setStep(1);
          const match = await tournamentService.getCurrentMatch();
          setCurrentMatch(match);
          // Turnuva zaten başlamışsa tahmin hesapla
          await calculateMatchPrediction();
        } else {
          setStep(0);
        }
      } catch (error) {
        // Tournament yoksa yeni oluştur
        const newTournament = await tournamentService.createTournament({
          name: 'Resim Turnuvası',
          category: selectedCategory,
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

  const handleImageUpdateName = async (imageId: number, name: string) => {
    try {
      await tournamentService.updateImageName(imageId, name);
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

      // Tahmin hesapla
      await calculateMatchPrediction();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Tournament başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchPrediction = async () => {
    try {
      console.log('calculateMatchPrediction çağrıldı');
      console.log('Tournament state:', tournament);
      
      if (!tournament || !tournament.images) {
        console.log('Tournament veya images yok');
        return;
      }
      
      const imageCount = tournament.images.filter(img => !img.name.startsWith('BOŞ_')).length;
      console.log('Image count:', imageCount);
      if (imageCount < 2) {
        console.log('Image count 2\'den az');
        return;
      }

      console.log('ML API çağrısı yapılıyor...');
      console.log('Token:', localStorage.getItem('token'));
      
      // ML API'den tahmin al
      const response = await fetch('http://localhost:8000/api/ml/predict-matches/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ n_images: imageCount }),
      });

      console.log('API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        if (data.prediction && data.prediction.confidence_interval) {
          const [lower, upper] = data.prediction.confidence_interval;
          const estimated = data.prediction.estimated_matches;
          
          // Yuvarlama: küçük değer aşağı, büyük değer yukarı
          const lowerBound = Math.floor(lower);
          const upperBound = Math.ceil(upper);
          
          // Format: "tahmini maç sayısı~lowerboundmin-upperboundmax"
          const predictionText = `${Math.round(estimated)}~${lowerBound}-${upperBound}`;
          console.log('Prediction text:', predictionText);
          setMatchPrediction(predictionText);
        }
      } else {
        const errorText = await response.text();
        console.error('API error:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      console.error('Tahmin hesaplama hatası:', error);
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
        // Sadece yeni oluşturulan turnuvalar için public yapma modal'ını göster
        if (!updatedTournament.is_from_public) {
          setTournamentName(updatedTournament.name);
          setShowPublicModal(true);
        }
      } else {
        const nextMatch = await tournamentService.getCurrentMatch();
        setCurrentMatch(nextMatch);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Maç sonucu gönderilemedi.');
    } finally {
      setSubmittingResult(false);
    }
  };

  const handleMakePublic = async () => {
    try {
      setMakingPublic(true);
      setError(null);
      
      await tournamentService.makeTournamentPublic(tournamentName);
      setShowPublicModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Turnuva public yapılırken hata oluştu.');
    } finally {
      setMakingPublic(false);
    }
  };

  const handleDeleteTournament = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await tournamentService.deleteTournament();
      setShowPublicModal(false);
      
      // Yeni tournament oluştur
      const newTournament = await tournamentService.createTournament({
        name: 'Resim Turnuvası',
        category: selectedCategory,
      });
      setTournament(newTournament);
      setCurrentMatch(null);
      setStep(0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'İşlem gerçekleştirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async () => {
    try {
      setLoading(true);
      setError(null);

      // Yeni tournament oluştur
      const newTournament = await tournamentService.createTournament({
        name: 'Resim Turnuvası',
        category: selectedCategory,
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
        <CircularProgress 
          size={60} 
          sx={{ 
            color: theme.palette.primary.main,
            filter: `drop-shadow(0 0 10px ${theme.palette.primary.main})`,
          }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <Paper 
        elevation={4} 
        sx={{ 
          p: 4, 
          mb: 4, 
          textAlign: 'center',
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
          color: theme.palette.primary.main,
          border: `2px solid ${theme.palette.primary.main}`,
          boxShadow: `0 0 20px ${theme.palette.primary.main}, inset 0 0 20px ${theme.palette.primary.main}1A`,
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <Typography 
          variant="h3" 
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
          🏆 RESİM TURNUVASI
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            opacity: 0.9,
            fontFamily: 'Poppins, sans-serif',
            color: theme.palette.primary.main,
            textShadow: `0 0 5px ${theme.palette.primary.main}`,
          }}
        >
          Resimlerinizi yükleyin ve hangisinin en iyisi olduğunu belirleyin!
        </Typography>
      </Paper>

      {/* Stepper */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
          border: `1px solid ${theme.palette.primary.main}`,
          boxShadow: `0 0 10px ${theme.palette.primary.main}`,
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <Stepper activeStep={step} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                sx={{ 
                  '& .MuiStepLabel-label': {
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 5px ${theme.palette.primary.main}`,
                  },
                  '& .MuiStepLabel-iconContainer': {
                    '& .MuiStepIcon-root': {
                      color: index <= step ? theme.palette.primary.main : `${theme.palette.primary.main}4D`,
                      filter: index <= step ? `drop-shadow(0 0 5px ${theme.palette.primary.main})` : 'none',
                    },
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            background: `${theme.palette.background.default}E6`,
            border: '1px solid #ff4444',
            boxShadow: '0 0 10px #ff4444',
            color: '#ff4444',
            fontFamily: 'Poppins, sans-serif',
          }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Step 0: Image Upload */}
      {step === 0 && tournament && (
        <Box>
          {/* Turnuva adı düzenleme alanı */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <TextField
              label="Turnuva Adı"
              value={tournament.name}
              onChange={async (e) => {
                const newName = e.target.value;
                setTournament((prev) => prev ? { ...prev, name: newName } : prev);
                // Backend'e güncelle
                try {
                  await tournamentService.updateTournamentName(newName);
                } catch {}
              }}
              variant="outlined"
              sx={{
                input: { color: theme.palette.primary.main, fontFamily: 'Poppins, sans-serif' },
                label: { color: theme.palette.primary.main, fontFamily: 'Poppins, sans-serif' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: theme.palette.primary.main },
                  '&:hover fieldset': { borderColor: '#fff' },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                },
              }}
            />
          </Box>

          {/* Kategori Seçici */}
          <CategorySelector
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            disabled={false}
          />

          {/* ML Tahmin Sistemi */}
          {/* MatchPrediction component was removed */}
          <ImageUpload
            images={tournament.images || []}
            onUpload={handleImageUpload}
            onDelete={handleImageDelete}
            onUpdateName={handleImageUpdateName}
            loading={loading}
            tournamentStarted={false}
          />

          {/* Start Tournament Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<PlayArrow sx={{ color: theme.palette.primary.main }} />}
              onClick={handleStartTournament}
              disabled={loading || !tournament.images || (tournament.images.length < 2)}
              sx={{ 
                px: 4, 
                py: 2, 
                fontSize: '1.2rem',
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
                '&:disabled': {
                  color: `${theme.palette.primary.main}80`,
                  border: `2px solid ${theme.palette.primary.main}80`,
                  boxShadow: 'none',
                },
              }}
            >
              TURNUVAYI BAŞLAT
            </Button>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1, 
                color: theme.palette.primary.main,
                fontFamily: 'Poppins, sans-serif',
                textShadow: `0 0 3px ${theme.palette.primary.main}`,
              }}
            >
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
          {/* Kalan Maç Sayısı Göstergesi */}
          {/* RemainingMatches component was removed */}

          {/* Tournament Info */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mb: 4,
              background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
              border: `1px solid ${theme.palette.primary.main}`,
              boxShadow: `0 0 10px ${theme.palette.primary.main}`,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Typography 
                  variant="h6"
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 5px ${theme.palette.primary.main}`,
                  }}
                >
                  Round {tournament.current_round}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 3px ${theme.palette.primary.main}`,
                  }}
                >
                  Toplam Resim: {tournament.images?.filter(img => !img.name.startsWith('BOŞ_')).length || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 3px ${theme.palette.primary.main}`,
                  }}
                >
                  Oynanan Maç: {tournament.matches?.filter(m => m.winner).length || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: theme.palette.secondary.main,
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: `0 0 3px ${theme.palette.secondary.main}`,
                    fontWeight: 'bold',
                  }}
                >
                  Tahmin: {matchPrediction || 'Hesaplanıyor...'}
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
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                border: `1px solid ${theme.palette.primary.main}`,
                boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              <CircularProgress 
                sx={{ 
                  mb: 2,
                  color: theme.palette.primary.main,
                  filter: `drop-shadow(0 0 10px ${theme.palette.primary.main})`,
                }} 
              />
              <Typography 
                variant="h6"
                sx={{ 
                  color: theme.palette.primary.main,
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: `0 0 5px ${theme.palette.primary.main}`,
                }}
              >
                Sonraki maç hazırlanıyor...
              </Typography>
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
              background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
              color: theme.palette.primary.main,
              border: `2px solid ${theme.palette.primary.main}`,
              boxShadow: `0 0 20px ${theme.palette.primary.main}, inset 0 0 20px ${theme.palette.primary.main}1A`,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            <EmojiEvents sx={{ fontSize: 80, mb: 2, color: theme.palette.primary.main, filter: `drop-shadow(0 0 15px ${theme.palette.primary.main})` }} />
            <Typography 
              variant="h3" 
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
              🎉 TURNUVA TAMAMLANDI!
            </Typography>
            <Typography 
              variant="h6"
              sx={{ 
                color: theme.palette.primary.main,
                fontFamily: 'Poppins, sans-serif',
                textShadow: `0 0 5px ${theme.palette.primary.main}`,
              }}
            >
              {tournament.is_from_public 
                ? 'Bu turnuvayı başarıyla tamamladınız! Sonuçlar aşağıda sıralanmıştır.'
                : 'Kazananlar aşağıda sıralanmıştır'
              }
            </Typography>
          </Paper>

          {/* Results */}
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              textAlign: 'center', 
              mb: 4,
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 10px ${theme.palette.primary.main}`,
              fontWeight: 'bold',
            }}
          >
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
                      background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                      border: `2px solid ${theme.palette.primary.main}`,
                      boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                      fontFamily: 'Poppins, sans-serif',
                      ...(index === 0 && {
                        border: '3px solid #0ef',
                        boxShadow: '0 0 25px #0ef, 0 0 35px rgba(14, 255, 255, 0.3)',
                      }),
                      ...(index === 1 && {
                        border: '3px solid rgba(14, 255, 255, 0.7)',
                        boxShadow: '0 0 20px rgba(14, 255, 255, 0.7)',
                      }),
                      ...(index === 2 && {
                        border: '3px solid rgba(14, 255, 255, 0.5)',
                        boxShadow: '0 0 15px rgba(14, 255, 255, 0.5)',
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
                        bgcolor: index === 0 ? '#0ef' : index === 1 ? 'rgba(14, 255, 255, 0.7)' : 'rgba(14, 255, 255, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1f293a',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        fontFamily: 'Poppins, sans-serif',
                        boxShadow: '0 0 10px #0ef',
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
                    <CardContent sx={{ background: 'rgba(31, 41, 58, 0.8)' }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ 
                          color: theme.palette.primary.main,
                          fontFamily: 'Poppins, sans-serif',
                          textShadow: `0 0 5px ${theme.palette.primary.main}`,
                        }}
                      >
                        {image.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={`Puan: ${image.points}`}
                          color={image.points > 0 ? 'success' : 'error'}
                          variant="outlined"
                          sx={{ 
                            color: '#0ef',
                            borderColor: '#0ef',
                            fontFamily: 'Poppins, sans-serif',
                            boxShadow: '0 0 5px #0ef',
                          }}
                        />
                        <Chip
                          label={`Tur: ${image.rounds_played}`}
                          color="primary"
                          variant="outlined"
                          sx={{ 
                            color: '#0ef',
                            borderColor: '#0ef',
                            fontFamily: 'Poppins, sans-serif',
                            boxShadow: '0 0 5px #0ef',
                          }}
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
              variant="outlined"
              size="large"
              startIcon={<RestartAlt sx={{ color: '#0ef' }} />}
              onClick={handleRestart}
              disabled={loading}
              sx={{ 
                px: 4, 
                py: 2, 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif',
                color: '#0ef',
                border: '2px solid #0ef',
                boxShadow: '0 0 15px #0ef',
                background: 'rgba(14, 255, 255, 0.1)',
                '&:hover': {
                  background: 'rgba(14, 255, 255, 0.2)',
                  boxShadow: '0 0 25px #0ef',
                  border: '2px solid #fff',
                },
                '&:disabled': {
                  color: 'rgba(14, 255, 255, 0.5)',
                  border: '2px solid rgba(14, 255, 255, 0.5)',
                  boxShadow: 'none',
                },
              }}
            >
              YENİ TURNUVA BAŞLAT
            </Button>
          </Box>
        </Box>
      )}

      {/* Public Tournament Modal */}
      <Dialog
        open={showPublicModal}
        onClose={() => !makingPublic && setShowPublicModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
            border: `2px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 20px ${theme.palette.primary.main}`,
            fontFamily: 'Poppins, sans-serif',
          }
        }}
      >
        <DialogTitle
          sx={{
            color: theme.palette.primary.main,
            fontFamily: 'Poppins, sans-serif',
            textShadow: `0 0 10px ${theme.palette.primary.main}`,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          🎉 Turnuva Tamamlandı!
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 3px ${theme.palette.primary.main}`,
              mb: 3,
              textAlign: 'center',
            }}
          >
            Turnuvanızı diğer kullanıcıların oynayabilmesi için public yapmak ister misiniz?
          </Typography>
          <TextField
            fullWidth
            label="Turnuva İsmi"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: theme.palette.primary.main,
                fontFamily: 'Poppins, sans-serif',
                '& fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&:hover fieldset': {
                  borderColor: '#fff',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.primary.main,
                fontFamily: 'Poppins, sans-serif',
                '&.Mui-focused': {
                  color: theme.palette.primary.main,
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleDeleteTournament}
            disabled={makingPublic}
            sx={{
              color: '#ff4444',
              border: '1px solid #ff4444',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                background: 'rgba(255, 68, 68, 0.1)',
                border: '1px solid #ff6666',
              },
            }}
          >
            Hayır, Sil
          </Button>
          <Button
            onClick={handleMakePublic}
            disabled={makingPublic || !tournamentName.trim()}
            variant="outlined"
            sx={{
              color: '#0ef',
              border: '2px solid #0ef',
              boxShadow: '0 0 10px #0ef',
              background: 'rgba(14, 255, 255, 0.1)',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                background: 'rgba(14, 255, 255, 0.2)',
                boxShadow: '0 0 15px #0ef',
                border: '2px solid #fff',
              },
              '&:disabled': {
                color: 'rgba(14, 255, 255, 0.5)',
                border: '2px solid rgba(14, 255, 255, 0.5)',
                boxShadow: 'none',
              },
            }}
          >
            {makingPublic ? (
              <CircularProgress size={20} sx={{ color: '#0ef' }} />
            ) : (
              'Evet, Public Yap'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ImageTournament; 