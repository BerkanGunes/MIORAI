import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PlayArrow, Person, EmojiEvents, Search } from '@mui/icons-material';
import tournamentService from '../services/tournamentService';
import { getCategoryColor } from '../utils/categoryColors';

interface PublicTournament {
  id: number;
  name: string;
  category: string;
  category_display: string;
  user_name: string;
  play_count: number;
  created_at: string;
  first_image: {
    id: number;
    name: string;
    image_url: string;
  } | null;
  images: any[];
}

interface Category {
  value: string;
  label: string;
}

const PublicTournaments: React.FC = () => {
  const theme = useTheme();
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<PublicTournament[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningTournament, setJoiningTournament] = useState<number | null>(null);
  
  // Filtreleme state'leri
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity');
  
  const navigate = useNavigate();

  useEffect(() => {
    loadPublicTournaments();
    loadCategories();
  }, []);

  const loadPublicTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tournamentService.getPublicTournaments();
      setTournaments(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Turnuvalar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await tournamentService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...tournaments];

    // Kategori filtresi
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sıralama
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => b.play_count - a.play_count);
        break;
    }

    setFilteredTournaments(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [tournaments, selectedCategory, searchTerm, sortBy]);

  const handleJoinTournament = async (tournamentId: number) => {
    try {
      setJoiningTournament(tournamentId);
      setError(null);
      
      await tournamentService.createFromPublicTournament(tournamentId);
      navigate('/tournament');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Turnuvaya katılırken hata oluştu.');
    } finally {
      setJoiningTournament(null);
    }
  };

  if (loading) {
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
          🎯 PUBLIC TURNUVALAR
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
          Diğer kullanıcıların oluşturduğu turnuvalara katılın!
        </Typography>
      </Paper>

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

      {/* Filtreleme Arayüzü */}
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
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            color: theme.palette.primary.main,
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          🔍 Filtreleme ve Arama
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Arama"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Turnuva adı veya kullanıcı ara..."
              InputProps={{
                startAdornment: <Search sx={{ color: theme.palette.primary.main, mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  border: `1px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    border: `2px solid ${theme.palette.primary.main}`,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.primary.main,
                  fontFamily: 'Poppins, sans-serif',
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: theme.palette.primary.main, fontFamily: 'Poppins, sans-serif' }}>
                Kategori
              </InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Kategori"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    border: `1px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      border: `2px solid ${theme.palette.primary.main}`,
                    },
                  },
                  '& .MuiSelect-select': {
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                  },
                }}
              >
                <MenuItem value="">Tüm Kategoriler</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: theme.palette.primary.main, fontFamily: 'Poppins, sans-serif' }}>
                Sıralama
              </InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sıralama"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    border: `1px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      border: `2px solid ${theme.palette.primary.main}`,
                    },
                  },
                  '& .MuiSelect-select': {
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                  },
                }}
              >
                <MenuItem value="popularity">Popülerlik</MenuItem>
                <MenuItem value="date">Tarih</MenuItem>
                <MenuItem value="category">Kategori</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Poppins, sans-serif' }}>
            {filteredTournaments.length} turnuva bulundu
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
            sx={{
              color: theme.palette.primary.main,
              border: `1px solid ${theme.palette.primary.main}`,
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                background: `${theme.palette.primary.main}1A`,
                border: `1px solid #fff`,
              },
            }}
          >
            ← Ana Sayfaya Dön
          </Button>
        </Box>
      </Paper>

      {filteredTournaments.length === 0 ? (
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
          <Typography 
            variant="h6"
            sx={{ 
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              textShadow: `0 0 5px ${theme.palette.primary.main}`,
            }}
          >
            Henüz public turnuva bulunmuyor.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredTournaments.map((tournament) => (
            <Grid item xs={12} md={6} lg={4} key={tournament.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                  fontFamily: 'Poppins, sans-serif',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 0 25px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main}4D`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {tournament.first_image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={tournament.first_image.image_url}
                    alt={tournament.first_image.name}
                    sx={{
                      objectFit: 'cover',
                      border: `1px solid ${theme.palette.primary.main}`,
                    }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1, background: `${theme.palette.background.default}CC` }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      color: theme.palette.primary.main,
                      fontFamily: 'Poppins, sans-serif',
                      textShadow: `0 0 5px ${theme.palette.primary.main}`,
                    }}
                  >
                    {tournament.name}
                  </Typography>

                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: `${theme.palette.primary.main}CC`,
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      {tournament.user_name}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEvents sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: `${theme.palette.primary.main}CC`,
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      {tournament.images.length} resim
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={tournament.category_display}
                      size="small"
                      sx={{
                        backgroundColor: getCategoryColor(tournament.category),
                        color: 'white',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 'bold',
                        boxShadow: `0 0 8px ${getCategoryColor(tournament.category)}`,
                        '&:hover': {
                          boxShadow: `0 0 12px ${getCategoryColor(tournament.category)}`,
                        },
                      }}
                    />
                    <Chip
                      label={`${tournament.play_count} kez oynandı`}
                      size="small"
                      sx={{
                        backgroundColor: `${theme.palette.primary.main}1A`,
                        color: theme.palette.primary.main,
                        border: `1px solid ${theme.palette.primary.main}`,
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    />
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PlayArrow />}
                    onClick={() => handleJoinTournament(tournament.id)}
                    disabled={joiningTournament === tournament.id}
                    sx={{
                      mt: 'auto',
                      py: 1,
                      fontWeight: 'bold',
                      fontFamily: 'Poppins, sans-serif',
                      color: theme.palette.primary.main,
                      border: `2px solid ${theme.palette.primary.main}`,
                      boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                      background: `${theme.palette.primary.main}1A`,
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
                  >
                    {joiningTournament === tournament.id ? (
                      <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />
                    ) : (
                      'Turnuvaya Katıl'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default PublicTournaments;
