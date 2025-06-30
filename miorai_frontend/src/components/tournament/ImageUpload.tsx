import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  IconButton,
  Alert,
  LinearProgress,
  Grid,
  Chip,
  useTheme,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
  Cancel,
} from '@mui/icons-material';
import { TournamentImage } from '../../types/tournament';

interface ImageUploadProps {
  images: TournamentImage[];
  onUpload: (file: File, name: string) => Promise<void>;
  onDelete: (imageId: number) => Promise<void>;
  loading?: boolean;
  tournamentStarted?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onUpload,
  onDelete,
  loading = false,
  tournamentStarted = false,
}) => {
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageName, setImageName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Dosya validasyonu
    const validFiles = files.filter(file => {
      if (file.size > 16 * 1024 * 1024) {
        setError(`${file.name} dosyası 16MB'dan büyük.`);
        return false;
      }
      
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError(`${file.name} desteklenmeyen format. Sadece JPG ve PNG.`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(validFiles);
    setError(null);
    
    // İlk dosyanın adını varsayılan isim yap
    if (validFiles.length > 0) {
      const fileName = validFiles[0].name.replace(/\.[^/.]+$/, '');
      setImageName(fileName);
    }
  }, []);

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !imageName.trim()) {
      setError('Dosya ve isim gerekli.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of selectedFiles) {
        await onUpload(file, imageName || file.name);
      }
      setSelectedFiles([]);
      setImageName('');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Yükleme hatası.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    try {
      await onDelete(imageId);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Silme hatası.');
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setImageName('');
    setError(null);
  };

  return (
    <Box sx={{ mb: 4, fontFamily: 'Poppins, sans-serif' }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: theme.palette.primary.main,
          fontFamily: 'Poppins, sans-serif',
          textShadow: `0 0 5px ${theme.palette.primary.main}`,
          fontWeight: 'bold',
        }}
      >
        <ImageIcon sx={{ color: theme.palette.primary.main, filter: `drop-shadow(0 0 5px ${theme.palette.primary.main})` }} />
        Resim Yönetimi
      </Typography>

      {/* Hata mesajı */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
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

      {/* Upload alanı */}
      {!tournamentStarted && (
        <Card 
          sx={{ 
            mb: 3, 
            border: `2px dashed ${theme.palette.primary.main}`,
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
            boxShadow: `0 0 15px ${theme.palette.primary.main}`,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <input
                accept="image/jpeg,image/png"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload sx={{ color: theme.palette.primary.main }} />}
                  disabled={uploading}
                  size="large"
                  sx={{ 
                    mb: 2,
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
                    '&:disabled': {
                      color: `${theme.palette.primary.main}80`,
                      border: `2px solid ${theme.palette.primary.main}80`,
                      boxShadow: 'none',
                    },
                  }}
                >
                  Resim Seç
                </Button>
              </label>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: `0 0 3px ${theme.palette.primary.main}`,
                }}
              >
                JPG, PNG formatlarında, maksimum 16MB
              </Typography>

              {/* Seçilen dosyalar */}
              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography 
                    variant="subtitle2" 
                    gutterBottom
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontFamily: 'Poppins, sans-serif',
                      textShadow: `0 0 3px ${theme.palette.primary.main}`,
                    }}
                  >
                    Seçilen Dosyalar:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {selectedFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        size="small"
                        sx={{ 
                          color: theme.palette.primary.main,
                          borderColor: theme.palette.primary.main,
                          fontFamily: 'Poppins, sans-serif',
                          boxShadow: `0 0 5px ${theme.palette.primary.main}`,
                        }}
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <TextField
                    fullWidth
                    label="Resim İsmi"
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    sx={{ 
                      mt: 2,
                      '& .MuiOutlinedInput-root': {
                        color: theme.palette.primary.main,
                        fontFamily: 'Poppins, sans-serif',
                        '& fieldset': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: `0 0 5px ${theme.palette.primary.main}`,
                        },
                        '&:hover fieldset': {
                          borderColor: '#fff',
                          boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#fff',
                          boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.palette.primary.main,
                        fontFamily: 'Poppins, sans-serif',
                        textShadow: `0 0 3px ${theme.palette.primary.main}`,
                        '&.Mui-focused': {
                          color: '#fff',
                        },
                      },
                    }}
                    disabled={uploading}
                  />

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={handleUpload}
                      disabled={uploading || !imageName.trim()}
                      startIcon={<CloudUpload sx={{ color: theme.palette.primary.main }} />}
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
                        '&:disabled': {
                          color: `${theme.palette.primary.main}80`,
                          border: `2px solid ${theme.palette.primary.main}80`,
                          boxShadow: 'none',
                        },
                      }}
                    >
                      Yükle
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={clearSelection}
                      disabled={uploading}
                      startIcon={<Cancel sx={{ color: theme.palette.primary.main }} />}
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
                        '&:disabled': {
                          color: `${theme.palette.primary.main}80`,
                          border: `2px solid ${theme.palette.primary.main}80`,
                          boxShadow: 'none',
                        },
                      }}
                    >
                      İptal
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {(uploading || loading) && (
        <LinearProgress 
          sx={{ 
            mb: 2,
            '& .MuiLinearProgress-bar': {
              backgroundColor: theme.palette.primary.main,
              boxShadow: `0 0 10px ${theme.palette.primary.main}`,
            },
            '& .MuiLinearProgress-root': {
              backgroundColor: `${theme.palette.primary.main}33`,
            },
          }} 
        />
      )}

      {/* Yüklenen resimler */}
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
        Yüklenen Resimler ({images.length})
      </Typography>

      {images.length === 0 ? (
        <Card
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
            border: `1px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 10px ${theme.palette.primary.main}`,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ImageIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2, filter: `drop-shadow(0 0 10px ${theme.palette.primary.main})` }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.primary.main,
                fontFamily: 'Poppins, sans-serif',
                textShadow: `0 0 5px ${theme.palette.primary.main}`,
              }}
            >
              Henüz resim yüklenmedi
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.primary.main,
                fontFamily: 'Poppins, sans-serif',
                textShadow: `0 0 3px ${theme.palette.primary.main}`,
              }}
            >
              Turnuvayı başlatmak için en az 2 resim yükleyin
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {images.map((image) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
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
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '75%', // 4:3 aspect ratio
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
                <CardContent sx={{ background: `${theme.palette.background.default}CC` }}>
                  <Typography 
                    variant="subtitle1" 
                    noWrap
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontFamily: 'Poppins, sans-serif',
                      textShadow: `0 0 3px ${theme.palette.primary.main}`,
                    }}
                  >
                    {image.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: `${theme.palette.primary.main}B3`,
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {image.original_filename}
                  </Typography>
                  {tournamentStarted && (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`Puan: ${image.points}`}
                        sx={{ 
                          color: image.points > 0 ? theme.palette.primary.main : '#ff4444',
                          borderColor: image.points > 0 ? theme.palette.primary.main : '#ff4444',
                          fontFamily: 'Poppins, sans-serif',
                          boxShadow: `0 0 5px ${image.points > 0 ? theme.palette.primary.main : '#ff4444'}`,
                        }}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={`Tur: ${image.rounds_played}`}
                        sx={{ 
                          ml: 1,
                          color: theme.palette.primary.main,
                          borderColor: theme.palette.primary.main,
                          fontFamily: 'Poppins, sans-serif',
                          boxShadow: `0 0 5px ${theme.palette.primary.main}`,
                        }}
                        variant="outlined"
                      />
                    </Box>
                  )}
                </CardContent>
                {!tournamentStarted && (
                  <CardActions sx={{ background: `${theme.palette.background.default}CC` }}>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(image.id)}
                      sx={{ 
                        color: '#ff4444',
                        '&:hover': {
                          color: '#ff6666',
                          filter: 'drop-shadow(0 0 5px #ff4444)',
                        },
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ImageUpload; 