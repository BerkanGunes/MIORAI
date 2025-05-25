import api from './api.config';

// Types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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

export interface AuthResponse {
  user: User;
  token: string;
}

// Auth servisi
const authService = {
  // Giriş yap
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login/', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Kayıt ol
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register/', data);
    return response.data;
  },

  // Çıkış yap
  async logout(): Promise<void> {
    await api.post('/auth/logout/');
    localStorage.removeItem('token');
  },

  // Şifre sıfırlama isteği gönder
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/reset-password/', { email });
  },

  // Şifre sıfırlama
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password/confirm/', {
      token,
      new_password: newPassword,
    });
  },

  // Email doğrulama
  async verifyEmail(token: string): Promise<void> {
    await api.get(`/auth/verify-email/?token=${token}`);
  },

  // Mevcut kullanıcı bilgilerini getir
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/user/');
    return response.data;
  },

  // Token kontrolü
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

export default authService; 