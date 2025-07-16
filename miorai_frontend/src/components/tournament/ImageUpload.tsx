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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
  Cancel,
  Edit,
} from '@mui/icons-material';
import { TournamentImage } from '../../types/tournament';

interface ImageUploadProps {
  images: TournamentImage[];
  onUpload: (file: File, name: string) => Promise<void>;
  onDelete: (imageId: number) => Promise<void>;
  onUpdateName?: (imageId: number, name: string) => Promise<void>;
  loading?: boolean;
  tournamentStarted?: boolean;
}

interface SelectedFile {
  file: File;
  name: string;
  id: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onUpload,
  onDelete,
  onUpdateName,
  loading = false,
  tournamentStarted = false,
}) => {
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<TournamentImage | null>(null);
  const [editName, setEditName] = useState('');

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Dosya validasyonu
    const validFiles: SelectedFile[] = [];
    for (const file of files) {
      if (file.size > 16 * 1024 * 1024) {
        setError(`${file.name} dosyası 16MB'dan büyük.`);
        continue;
      }
      
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError(`${file.name} desteklenmeyen format. Sadece JPG ve PNG.`);
        continue;
      }
      
      // Dosya adını uzantısız olarak al
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      validFiles.push({
        file,
        name: fileName,
        id: Math.random().toString(36).substr(2, 9)
      });
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError(null);
  }, []);

  const handleNameChange = (id: string, newName: string) => {
    setSelectedFiles(prev => 
      prev.map(item => 
        item.id === id ? { ...item, name: newName } : item
      )
    );
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(item => item.id !== id));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('En az bir dosya seçin.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const selectedFile of selectedFiles) {
        await onUpload(selectedFile.file, selectedFile.name || selectedFile.file.name);
      }
      setSelectedFiles([]);
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

  const handleEditName = (image: TournamentImage) => {
    setEditingImage(image);
    setEditName(image.name);
  };

  const handleSaveEdit = async () => {
    if (!editingImage || !editName.trim()) return;
    
    try {
      if (onUpdateName) {
        await onUpdateName(editingImage.id, editName);
      }
      setEditingImage(null);
      setEditName('');
    } catch (error: any) {
      setError('İsim güncelleme hatası.');
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
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
                <Box sx={{ mt: 3 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontFamily: 'Poppins, sans-serif',
                      textShadow: `0 0 3px ${theme.palette.primary.main}`,
                      fontWeight: 'bold',
                    }}
                  >
                    Seçilen Resimler ({selectedFiles.length})
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {selectedFiles.map((selectedFile) => (
                      <Grid item xs={12} sm={6} md={4} key={selectedFile.id}>
                        <Card
                          sx={{ 
                            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                            border: `1px solid ${theme.palette.primary.main}`,
                            boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                            fontFamily: 'Poppins, sans-serif',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              paddingTop: '75%',
                              overflow: 'hidden',
                            }}
                          >
                            <img
                              src={URL.createObjectURL(selectedFile.file)}
                              alt={selectedFile.file.name}
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
                            <TextField
                              fullWidth
                              label="Resim İsmi"
                              value={selectedFile.name}
                              onChange={(e) => handleNameChange(selectedFile.id, e.target.value)}
                              size="small"
                              sx={{ 
                                mb: 1,
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
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: `${theme.palette.primary.main}B3`,
                                fontFamily: 'Poppins, sans-serif',
                              }}
                            >
                              {selectedFile.file.name}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveFile(selectedFile.id)}
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
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={handleUpload}
                      disabled={uploading}
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
                      Tümünü Yükle
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
                <CardContent sx={{ background: `${theme.palette.background.default}CC` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography 
                      variant="subtitle1" 
                      noWrap
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontFamily: 'Poppins, sans-serif',
                        textShadow: `0 0 3px ${theme.palette.primary.main}`,
                        flex: 1,
                      }}
                    >
                      {image.name}
                    </Typography>
                    {!tournamentStarted && (
                      <IconButton
                        size="small"
                        onClick={() => handleEditName(image)}
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&:hover': {
                            color: '#fff',
                            filter: `drop-shadow(0 0 5px ${theme.palette.primary.main})`,
                          },
                        }}
                      >
                        <Edit />
                      </IconButton>
                    )}
                  </Box>
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

      {/* İsim düzenleme dialog'u */}
      <Dialog 
        open={!!editingImage} 
        onClose={() => setEditingImage(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontFamily: 'Poppins, sans-serif' }}>
          Resim İsmini Düzenle
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Resim İsmi"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ 
              mt: 1,
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
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditingImage(null)}
            sx={{ color: theme.palette.primary.main, fontFamily: 'Poppins, sans-serif' }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleSaveEdit}
            disabled={!editName.trim()}
            sx={{ 
              color: theme.palette.primary.main, 
              fontFamily: 'Poppins, sans-serif',
              '&:disabled': {
                color: `${theme.palette.primary.main}80`,
              },
            }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUpload; 