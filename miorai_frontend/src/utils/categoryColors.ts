/**
 * Kategori renkleri utility fonksiyonu
 * Tüm sayfalarda tutarlı kategori renkleri için kullanılır
 */

export const getCategoryColor = (categoryValue: string): string => {
  const colors = {
    anime: '#FF6B9D',
    nature: '#4CAF50',
    architecture: '#2196F3',
    people: '#FF9800',
    animals: '#795548',
    food: '#E91E63',
    art: '#9C27B0',
    technology: '#607D8B',
    sports: '#F44336',
    general: '#757575',
  };
  return colors[categoryValue as keyof typeof colors] || '#757575';
};

export const categoryColors = {
  anime: '#FF6B9D',
  nature: '#4CAF50',
  architecture: '#2196F3',
  people: '#FF9800',
  animals: '#795548',
  food: '#E91E63',
  art: '#9C27B0',
  technology: '#607D8B',
  sports: '#F44336',
  general: '#757575',
} as const; 