import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import {
  AccountCircle,
  Palette,
  KeyboardArrowDown,
  ExitToApp,
  Person,
  Settings,
  Check,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { themeName, setThemeName } = useThemeContext();
  const theme = useTheme();
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleThemeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      handleProfileMenuClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { label: 'Ana Sayfa', path: '/' },
    { label: 'Hakkında', path: '/about' },
    { label: 'İletişim', path: '/contact' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/tournament')) {
      return true;
    }
    return location.pathname === path;
  };

  const themeOptions = [
    { name: 'nightPetrol', label: 'Gece Mavisi / Petrol' },
    { name: 'blackCobalt', label: 'Siyah / Kobalt' },
  ] as const;

  const handleSelectTheme = (name: typeof themeName) => {
    setThemeName(name);
    handleThemeMenuClose();
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        boxShadow: `0 0 20px ${theme.palette.primary.main}, 0 4px 20px ${theme.palette.primary.main}30`,
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Typography
          variant="h4"
          component="div"
          onClick={() => navigate('/')}
          sx={{
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, #fff)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: `0 0 10px ${theme.palette.primary.main}`,
            cursor: 'pointer',
            '&:hover': {
              textShadow: `0 0 15px ${theme.palette.primary.main}`,
            },
          }}
        >
          MIORAI
        </Typography>

        {/* Center Menu */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                color: isActivePath(item.path) ? '#fff' : theme.palette.primary.main,
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 'bold',
                border: isActivePath(item.path) ? '2px solid #fff' : '2px solid transparent',
                borderRadius: '8px',
                px: 2,
                py: 1,
                textShadow: `0 0 5px ${theme.palette.primary.main}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#fff',
                  border: '2px solid #fff',
                  boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                  background: `${theme.palette.primary.main}10`,
                },
              }}
            >
              {item.label}
            </Button>
          ))}

          {/* Tema Dropdown */}
          <Button
            onClick={handleThemeMenuOpen}
            endIcon={<KeyboardArrowDown />}
            startIcon={<Palette />}
            sx={{
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'bold',
              border: `2px solid ${theme.palette.primary.main}`,
              borderRadius: '8px',
              px: 2,
              py: 1,
              textShadow: `0 0 5px ${theme.palette.primary.main}`,
              boxShadow: `0 0 5px ${theme.palette.primary.main}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#fff',
                border: '2px solid #fff',
                boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                background: `${theme.palette.primary.main}10`,
              },
            }}
          >
            Tema
          </Button>
          <Menu
            anchorEl={themeMenuAnchor}
            open={Boolean(themeMenuAnchor)}
            onClose={handleThemeMenuClose}
            sx={{
              '& .MuiPaper-root': {
                background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                border: `1px solid ${theme.palette.primary.main}`,
                boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                color: theme.palette.primary.main,
                fontFamily: 'Poppins, sans-serif',
              },
            }}
          >
            {themeOptions.map((opt) => (
              <MenuItem
                key={opt.name}
                onClick={() => handleSelectTheme(opt.name)}
                sx={{
                  color: themeName === opt.name ? '#fff' : theme.palette.primary.main,
                  fontFamily: 'Poppins, sans-serif',
                  '&:hover': {
                    background: `${theme.palette.primary.main}10`,
                  },
                }}
              >
                {themeName === opt.name && <Check sx={{ mr: 1 }} />}
                {opt.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Right Side - User Menu or Login Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user ? (
            <>
              <Chip
                label={`Merhaba, ${user.firstName}`}
                sx={{
                  color: theme.palette.primary.main,
                  borderColor: theme.palette.primary.main,
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: `0 0 3px ${theme.palette.primary.main}`,
                }}
                variant="outlined"
              />
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  color: theme.palette.primary.main,
                  border: `2px solid ${theme.palette.primary.main}`,
                  borderRadius: '50%',
                  boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                  '&:hover': {
                    color: '#fff',
                    border: '2px solid #fff',
                    boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                  },
                }}
              >
                <AccountCircle sx={{ fontSize: 32 }} />
              </IconButton>
              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
                sx={{
                  '& .MuiPaper-root': {
                    background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                    border: `1px solid ${theme.palette.primary.main}`,
                    boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                  },
                }}
              >
                <MenuItem 
                  onClick={handleProfileMenuClose}
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                    '&:hover': {
                      background: `${theme.palette.primary.main}10`,
                    },
                  }}
                >
                  <Person sx={{ mr: 1 }} />
                  Profil
                </MenuItem>
                <MenuItem 
                  onClick={handleProfileMenuClose}
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontFamily: 'Poppins, sans-serif',
                    '&:hover': {
                      background: `${theme.palette.primary.main}10`,
                    },
                  }}
                >
                  <Settings sx={{ mr: 1 }} />
                  Ayarlar
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    color: '#ff4444',
                    fontFamily: 'Poppins, sans-serif',
                    '&:hover': {
                      background: 'rgba(255, 68, 68, 0.1)',
                    },
                  }}
                >
                  <ExitToApp sx={{ mr: 1 }} />
                  Çıkış Yap
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  color: theme.palette.primary.main,
                  border: `2px solid ${theme.palette.primary.main}`,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 'bold',
                  boxShadow: `0 0 5px ${theme.palette.primary.main}`,
                  '&:hover': {
                    color: '#fff',
                    border: '2px solid #fff',
                    boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                    background: `${theme.palette.primary.main}10`,
                  },
                }}
              >
                Giriş Yap
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/register')}
                sx={{
                  color: theme.palette.primary.main,
                  border: `2px solid ${theme.palette.primary.main}`,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 'bold',
                  boxShadow: `0 0 5px ${theme.palette.primary.main}`,
                  '&:hover': {
                    color: '#fff',
                    border: '2px solid #fff',
                    boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                    background: `${theme.palette.primary.main}10`,
                  },
                }}
              >
                Kayıt Ol
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 