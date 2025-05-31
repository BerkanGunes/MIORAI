export interface TournamentImage {
  id: number;
  name: string;
  original_filename: string;
  image_url: string;
  points: number;
  rounds_played: number;
  order_index: number;
}

export interface Match {
  id: number;
  image1: TournamentImage;
  image2: TournamentImage;
  winner?: TournamentImage;
  round_number: number;
  match_index: number;
  played_at: string;
}

export interface Tournament {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_completed: boolean;
  current_round: number;
  current_match_index: number;
  images: TournamentImage[];
  matches: Match[];
}

export interface TournamentCreateData {
  name: string;
}

export interface ImageUploadData {
  image: File;
  name: string;
}

// Legacy types for backward compatibility
export interface Player {
  isim: string;
  puan: number;
  tur: number;
}

export interface TransitiveRelation {
  winner: string;
  loser: string;
}

export interface TournamentResult {
  player: Player;
  rank: number;
} 