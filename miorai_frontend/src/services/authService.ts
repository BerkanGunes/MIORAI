import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8000/api/auth';

// Axios instance oluştur
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekle
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Response interceptor - 401 hatalarını ele al
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz, localStorage'dan temizle
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: string;
  lastLogin: string;
}

// Backend'den gelen veriyi frontend formatına dönüştür
const transformUserData = (data: any): User => ({
  id: data.id,
  email: data.email,
  firstName: data.first_name,
  lastName: data.last_name,
  emailVerified: data.email_verified,
  createdAt: data.created_at,
  lastLogin: data.last_login
});

export const authService = {
  async login(data: LoginData) {
    const response = await authApi.post('/login/', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return {
      ...response.data,
      user: transformUserData(response.data.user)
    };
  },

  async register(data: RegisterData) {
    const response = await authApi.post('/register/', {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
      password2: data.confirmPassword,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async logout() {
    try {
      await authApi.post('/logout/');
    } catch (error) {
      // Logout hatası olsa bile token'ı temizle
      console.warn('Logout request failed, but clearing token anyway');
    } finally {
      localStorage.removeItem('token');
    }
  },

  async getCurrentUser() {
    const response = await authApi.get('/user/');
    return transformUserData(response.data);
  },

  async verifyEmail(token: string) {
    const response = await authApi.get(`/verify-email/?token=${token}`);
    return response.data;
  },

  async resetPassword(email: string) {
    const response = await authApi.post('/reset-password/', { email });
    return response.data;
  },

  async confirmResetPassword(token: string, new_password: string, new_password2: string) {
    const response = await authApi.post('/reset-password/confirm/', {
      token,
      new_password,
      new_password2,
    });
    return response.data;
  },

  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Knox token'ları JWT değil, basit string token'lar
      // Bu yüzden sadece token varlığını kontrol edelim
      return token.length > 0;
    } catch {
      return false;
    }
  },
};

export default authService; 