import axios from 'axios';
import { Tournament, TournamentCreateData, ImageUploadData, Match } from '../types/tournament';

const API_URL = 'http://localhost:8000/api/tournaments';
const ML_API_URL = 'http://localhost:8000/api/ml';

// Axios instance oluştur
const tournamentApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const mlApi = axios.create({
  baseURL: ML_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekle
tournamentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

mlApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const tournamentService = {
  // Tournament oluştur
  async createTournament(data: TournamentCreateData): Promise<Tournament> {
    const response = await tournamentApi.post('/create/', data);
    return response.data;
  },

  // Aktif tournament'ı getir
  async getTournament(): Promise<Tournament> {
    const response = await tournamentApi.get('/detail/');
    return response.data;
  },

  // Resim yükle
  async uploadImage(data: ImageUploadData): Promise<any> {
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('name', data.name);

    const response = await tournamentApi.post('/upload-image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Resim sil
  async deleteImage(imageId: number): Promise<void> {
    await tournamentApi.delete(`/delete-image/${imageId}/`);
  },

  // Resim ismini güncelle
  async updateImageName(imageId: number, name: string): Promise<any> {
    const response = await tournamentApi.patch(`/update-image-name/${imageId}/`, { name });
    return response.data;
  },

  // Tournament'ı başlat
  async startTournament(): Promise<Tournament> {
    const response = await tournamentApi.post('/start/');
    return response.data;
  },

  // Maç sonucunu gönder
  async submitMatchResult(matchId: number, winnerId: number): Promise<Tournament> {
    const response = await tournamentApi.post(`/submit-result/${matchId}/`, {
      winner_id: winnerId,
    });
    return response.data;
  },

  // Mevcut maçı getir
  async getCurrentMatch(): Promise<Match | null> {
    try {
      const response = await tournamentApi.get('/current-match/');
      if (response.data.completed || response.data.no_match) {
        return null;
      }
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Public turnuvaları listele
  async getPublicTournaments(): Promise<any[]> {
    const response = await tournamentApi.get('/public/');
    return response.data;
  },

  // Tournament'ı public yap
  async makeTournamentPublic(name: string): Promise<void> {
    await tournamentApi.post('/make-public/', { name });
  },

  // Public tournament'tan yeni tournament oluştur
  async createFromPublicTournament(tournamentId: number): Promise<Tournament> {
    const response = await tournamentApi.post(`/create-from-public/${tournamentId}/`);
    return response.data;
  },

  // Tournament'ı sil
  async deleteTournament(): Promise<void> {
    await tournamentApi.delete('/delete/');
  },

  // Aktif turnuvanın adını güncelle
  async updateTournamentName(name: string): Promise<void> {
    await tournamentApi.patch('/detail/', { name });
  },

  // ML API metodları
  // Kategorileri getir
  async getCategories(): Promise<any[]> {
    const response = await mlApi.get('/categories/');
    return response.data;
  },

  // Benzerlik analizi
  async getSimilarityAnalysis(): Promise<any> {
    const response = await mlApi.post('/similarity-analysis/');
    return response.data;
  },

  // Model durumu
  async getModelStatus(): Promise<any> {
    const response = await mlApi.get('/model-status/');
    return response.data;
  },
};

export default tournamentService; 