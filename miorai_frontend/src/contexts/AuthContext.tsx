import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { User, LoginData, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
        } else {
          console.error('Auth initialization error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setError(null);
      const response = await authService.login(data);
      setUser(response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Giriş yapılırken bir hata oluştu');
      throw err;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setError(null);
      const response = await authService.register(data);
      setUser(response.user);
      // Email doğrulama sayfasına yönlendir
      navigate('/verify-email');
    } catch (err: any) {
      console.error('Register error:', err);
      // Daha detaylı hata mesajları
      if (err.response?.status === 500) {
        setError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else if (err.response?.data?.email) {
        setError(err.response.data.email[0]);
      } else if (err.response?.data?.password) {
        setError(err.response.data.password[0]);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      navigate('/login');
    } catch (err: any) {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
      console.error('Logout error:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 