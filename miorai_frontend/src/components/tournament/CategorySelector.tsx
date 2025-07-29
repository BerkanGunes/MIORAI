import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { tournamentService } from '../../services/tournamentService';
import { getCategoryColor } from '../../utils/categoryColors';

interface Category {
  value: string;
  label: string;
}

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  disabled?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
  disabled = false,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await tournamentService.getCategories();
        setCategories(response);
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
        // Fallback kategoriler
        setCategories([
          { value: 'anime', label: 'Anime/Manga' },
          { value: 'nature', label: 'Nature' },
          { value: 'architecture', label: 'Architecture' },
          { value: 'people', label: 'People' },
          { value: 'animals', label: 'Animals' },
          { value: 'food', label: 'Food' },
          { value: 'art', label: 'Art' },
          { value: 'technology', label: 'Technology' },
          { value: 'sports', label: 'Sports' },
          { value: 'general', label: 'General' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);



  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Kategoriler yükleniyor...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ 
          color: theme.palette.primary.main,
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 'bold',
          mb: 2,
        }}
      >
        🏷️ Turnuva Kategorisi
      </Typography>
      
      <FormControl 
        fullWidth 
        disabled={disabled}
        sx={{ 
          mb: 2,
          '& .MuiOutlinedInput-root': {
            border: `2px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 10px ${theme.palette.primary.main}`,
            '&:hover': {
              boxShadow: `0 0 15px ${theme.palette.primary.main}`,
            },
          },
        }}
      >
        <InputLabel 
          sx={{ 
            color: theme.palette.primary.main,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          Kategori Seçin
        </InputLabel>
        <Select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          label="Kategori Seçin"
          sx={{ 
            fontFamily: 'Poppins, sans-serif',
            '& .MuiSelect-select': {
              color: theme.palette.primary.main,
            },
          }}
        >
          {categories.map((category) => (
            <MenuItem 
              key={category.value} 
              value={category.value}
              sx={{ 
                fontFamily: 'Poppins, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: getCategoryColor(category.value),
                  flexShrink: 0,
                }}
              />
              {category.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedCategory && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={categories.find(c => c.value === selectedCategory)?.label || selectedCategory}
            sx={{
              backgroundColor: getCategoryColor(selectedCategory),
              color: 'white',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'bold',
              boxShadow: `0 0 10px ${getCategoryColor(selectedCategory)}`,
              '&:hover': {
                boxShadow: `0 0 15px ${getCategoryColor(selectedCategory)}`,
              },
            }}
          />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontFamily: 'Poppins, sans-serif' }}
          >
            seçildi
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CategorySelector; 