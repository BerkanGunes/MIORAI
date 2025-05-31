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
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ImageIcon color="primary" />
        Resim Yönetimi
      </Typography>

      {/* Hata mesajı */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload alanı */}
      {!tournamentStarted && (
        <Card sx={{ mb: 3, border: '2px dashed', borderColor: 'primary.main' }}>
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
                  startIcon={<CloudUpload />}
                  disabled={uploading}
                  size="large"
                  sx={{ mb: 2 }}
                >
                  Resim Seç
                </Button>
              </label>
              
              <Typography variant="body2" color="text.secondary">
                JPG, PNG formatlarında, maksimum 16MB
              </Typography>

              {/* Seçilen dosyalar */}
              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Seçilen Dosyalar:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {selectedFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <TextField
                    fullWidth
                    label="Resim İsmi"
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    sx={{ mt: 2 }}
                    disabled={uploading}
                  />

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={handleUpload}
                      disabled={uploading || !imageName.trim()}
                      startIcon={<CloudUpload />}
                    >
                      Yükle
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={clearSelection}
                      disabled={uploading}
                      startIcon={<Cancel />}
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
      {(uploading || loading) && <LinearProgress sx={{ mb: 2 }} />}

      {/* Yüklenen resimler */}
      <Typography variant="h6" gutterBottom>
        Yüklenen Resimler ({images.length})
      </Typography>

      {images.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Henüz resim yüklenmedi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Turnuvayı başlatmak için en az 2 resim yükleyin
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {images.map((image) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
              <Card>
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
                <CardContent>
                  <Typography variant="subtitle1" noWrap>
                    {image.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {image.original_filename}
                  </Typography>
                  {tournamentStarted && (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`Puan: ${image.points}`}
                        color={image.points > 0 ? 'success' : image.points < 0 ? 'error' : 'default'}
                      />
                      <Chip
                        size="small"
                        label={`Tur: ${image.rounds_played}`}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  )}
                </CardContent>
                {!tournamentStarted && (
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(image.id)}
                      color="error"
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