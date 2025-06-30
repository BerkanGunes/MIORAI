import React from 'react';
import { useTheme } from '@mui/material';
import ImageTournament from '../components/tournament/ImageTournament';

const TournamentPage: React.FC = () => {
  const theme = useTheme();

  return (
    <div style={{ 
      background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      minHeight: '100vh',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <ImageTournament />
    </div>
  );
};

export default TournamentPage; 