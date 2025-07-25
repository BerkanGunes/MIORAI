"""
Turnuva Simülasyonu ve Veri Toplama Sistemi
Bu modül, farklı N değerlerinde turnuvalar simüle ederek ML modeli için veri toplar.
"""

import random
import math
import json
from typing import List, Dict, Tuple
from django.contrib.auth import get_user_model
from tournaments.models import Tournament, TournamentImage, Match

User = get_user_model()

class TournamentSimulator:
    """Turnuva simülasyonu için sınıf"""
    
    def __init__(self):
        self.test_user = None
        self._create_test_user()
    
    def _create_test_user(self):
        """Test için kullanıcı oluştur"""
        try:
            self.test_user = User.objects.get(email='ml_simulator@test.com')
        except User.DoesNotExist:
            self.test_user = User.objects.create_user(
                email='ml_simulator@test.com',
                password='testpass123',
                first_name='ML',
                last_name='Simulator'
            )
    
    def simulate_tournament(self, n_images: int, simulation_id: int = 0) -> Dict:
        """
        N resimle turnuva simüle et ve sonuçları döndür
        
        Args:
            n_images: Simüle edilecek resim sayısı
            simulation_id: Simülasyon ID'si
            
        Returns:
            Dict: Simülasyon sonuçları
        """
        # Turnuva oluştur
        tournament = Tournament.objects.create(
            user=self.test_user,
            name=f"Simulation_{simulation_id}_N{n_images}",
            is_active=True
        )
        
        # N adet test resmi oluştur
        for i in range(n_images):
            TournamentImage.objects.create(
                tournament=tournament,
                name=f"Test_Image_{i}",
                original_filename=f"test_{i}.jpg",
                order_index=i
            )
        
        # Turnuvayı başlat
        self._start_tournament(tournament)
        
        # Simülasyonu çalıştır
        total_matches = self._run_simulation(tournament)
        
        # Sonuçları topla
        result = {
            'n_images': n_images,
            'total_matches': total_matches,
            'tournament_id': tournament.id,
            'simulation_id': simulation_id,
            'real_images': n_images,
            'total_images_after_padding': tournament.images.count(),
            'rounds_played': tournament.current_round,
            'is_completed': tournament.is_completed
        }
        
        # Temizlik
        tournament.delete()
        
        return result
    
    def _start_tournament(self, tournament: Tournament):
        """Turnuvayı başlat (mevcut koddan uyarlandı)"""
        images = list(tournament.images.all())
        
        # BOŞ resimler ekle (2'nin kuvvetine tamamla)
        image_count = len(images)
        next_power_of_2 = 2 ** math.ceil(math.log2(image_count))
        empty_slots = next_power_of_2 - image_count
        
        for i in range(empty_slots):
            TournamentImage.objects.create(
                tournament=tournament,
                name=f"BOŞ_{i}",
                original_filename=f"empty_{i}",
                points=-500 - i,
                order_index=len(images) + i
            )
        
        # Win matrix oluştur
        total_images = tournament.images.count()
        win_matrix = [[0 for _ in range(total_images)] for _ in range(total_images)]
        tournament.set_win_matrix(win_matrix)
        tournament.save()
        
        # İlk round'u başlat
        self._create_next_round_matches(tournament)
    
    def _create_next_round_matches(self, tournament: Tournament):
        """Sonraki round maçlarını oluştur (mevcut koddan uyarlandı)"""
        if tournament.is_completed:
            return

        # Get non-empty images
        images = list(tournament.images.all())
        real_images = [img for img in images if not img.name.startswith('BOŞ_')]
        
        # Group by (rounds_played, points)
        grouped = {}
        for image in real_images:
            key = (image.rounds_played, image.points)
            grouped.setdefault(key, []).append(image)
        
        # Check end condition: no group has at least 2 players
        if not any(len(group) >= 2 for group in grouped.values()):
            tournament.is_completed = True
            tournament.save()
            return

        updates = []  # (image, point_delta, round_delta)
        new_matches = []  # (image1, image2)
        
        # Process each group
        for (rounds, points), group in grouped.items():
            group.sort(key=lambda img: img.id)
            i = 0
            while i < len(group):
                if i + 1 < len(group):
                    img1 = group[i]
                    img2 = group[i+1]
                    
                    # Check transitive closure
                    winner_id = self._get_previous_winner(tournament, img1, img2)
                    if winner_id is not None:
                        # Automatic result
                        winner = img1 if winner_id == img1.id else img2
                        loser = img2 if winner == img1 else img1
                        updates.append((winner, 1, 1))
                        updates.append((loser, -1, 1))
                    else:
                        # Manual match needed
                        new_matches.append((img1, img2))
                    i += 2
                else:
                    # Bye for single player
                    updates.append((group[i], 0, 1))
                    i += 1
        
        # Apply updates
        for image, point_delta, round_delta in updates:
            image.points += point_delta
            image.rounds_played += round_delta
            image.save()
        
        # Create new matches
        match_objects = []
        for idx, (img1, img2) in enumerate(new_matches):
            match_objects.append(Match(
                tournament=tournament,
                image1=img1,
                image2=img2,
                round_number=tournament.current_round,
                match_index=idx
            ))
        
        if match_objects:
            Match.objects.bulk_create(match_objects)
        
        # If no manual matches, proceed to next round recursively
        if not new_matches:
            tournament.current_round += 1
            tournament.current_match_index = 0
            tournament.save()
            self._create_next_round_matches(tournament)
    
    def _get_previous_winner(self, tournament: Tournament, image1: TournamentImage, image2: TournamentImage):
        """Önceki kazananı kontrol et (mevcut koddan uyarlandı)"""
        matrix = tournament.get_win_matrix()
        images = list(tournament.images.all())
        
        try:
            idx1 = next(i for i, img in enumerate(images) if img.id == image1.id)
            idx2 = next(i for i, img in enumerate(images) if img.id == image2.id)
            
            if matrix[idx1][idx2] == 1:
                return image1.id
            elif matrix[idx2][idx1] == 1:
                return image2.id
        except (StopIteration, IndexError):
            pass
        return None
    
    def _run_simulation(self, tournament: Tournament) -> int:
        """
        Turnuvayı simüle et ve toplam maç sayısını döndür
        
        Args:
            tournament: Simüle edilecek turnuva
            
        Returns:
            int: Toplam maç sayısı
        """
        total_matches = 0
        
        while not tournament.is_completed:
            # Mevcut maçları al
            current_matches = Match.objects.filter(
                tournament=tournament,
                round_number=tournament.current_round
            )
            
            if not current_matches.exists():
                # Yeni round başlat
                self._create_next_round_matches(tournament)
                continue
            
            # Her maç için rastgele kazanan seç
            for match in current_matches:
                # Rastgele kazanan seç
                winner = random.choice([match.image1, match.image2])
                loser = match.image2 if winner == match.image1 else match.image1
                
                # Win matrix'i güncelle
                self._update_win_matrix(tournament, winner, loser)
                
                # Maçı tamamla
                match.winner = winner
                match.save()
                
                total_matches += 1
            
            # Sonraki round'a geç
            tournament.current_round += 1
            tournament.current_match_index = 0
            tournament.save()
            
            # Yeni maçları oluştur
            self._create_next_round_matches(tournament)
        
        return total_matches
    
    def _update_win_matrix(self, tournament: Tournament, winner: TournamentImage, loser: TournamentImage):
        """Win matrix'i güncelle (mevcut koddan uyarlandı)"""
        matrix = tournament.get_win_matrix()
        images = list(tournament.images.all())
        
        try:
            winner_idx = next(i for i, img in enumerate(images) if img.id == winner.id)
            loser_idx = next(i for i, img in enumerate(images) if img.id == loser.id)
            
            matrix[winner_idx][loser_idx] = 1
            
            # Transitive closure: winner beats everyone that loser beats
            for i in range(len(matrix)):
                if matrix[loser_idx][i] == 1:
                    matrix[winner_idx][i] = 1
            
            tournament.set_win_matrix(matrix)
            tournament.save()
        except (StopIteration, IndexError):
            pass
    
    def generate_dataset(self, n_range: Tuple[int, int] = (2, 128), 
                        simulations_per_n: int = 10) -> List[Dict]:
        """
        Veri seti oluştur
        
        Args:
            n_range: N değerleri aralığı (min, max)
            simulations_per_n: Her N için simülasyon sayısı
            
        Returns:
            List[Dict]: Veri seti
        """
        dataset = []
        
        for n in range(n_range[0], n_range[1] + 1):
            print(f"Simulating N={n}...")
            
            for sim_id in range(simulations_per_n):
                try:
                    result = self.simulate_tournament(n, sim_id)
                    dataset.append(result)
                    print(f"  Simulation {sim_id + 1}: {result['total_matches']} matches")
                except Exception as e:
                    print(f"  Error in simulation {sim_id + 1}: {e}")
                    continue
        
        return dataset
    
    def save_dataset(self, dataset: List[Dict], filename: str = "tournament_dataset.json"):
        """Veri setini JSON dosyasına kaydet"""
        with open(f"ml/data/{filename}", 'w') as f:
            json.dump(dataset, f, indent=2)
        
        print(f"Dataset saved to ml/data/{filename}")
        print(f"Total records: {len(dataset)}")
    
    def analyze_dataset(self, dataset: List[Dict]) -> Dict:
        """Veri setini analiz et"""
        analysis = {
            'total_simulations': len(dataset),
            'n_range': {
                'min': min(d['n_images'] for d in dataset),
                'max': max(d['n_images'] for d in dataset)
            },
            'matches_range': {
                'min': min(d['total_matches'] for d in dataset),
                'max': max(d['total_matches'] for d in dataset)
            },
            'avg_matches_by_n': {}
        }
        
        # N değerlerine göre ortalama maç sayısı
        n_groups = {}
        for record in dataset:
            n = record['n_images']
            if n not in n_groups:
                n_groups[n] = []
            n_groups[n].append(record['total_matches'])
        
        for n, matches in n_groups.items():
            analysis['avg_matches_by_n'][n] = {
                'avg': sum(matches) / len(matches),
                'min': min(matches),
                'max': max(matches),
                'std': (sum((x - sum(matches)/len(matches))**2 for x in matches) / len(matches))**0.5
            }
        
        return analysis


def run_data_collection():
    """Veri toplama işlemini çalıştır"""
    print("Starting tournament data collection...")
    
    simulator = TournamentSimulator()
    
    # Veri seti oluştur
    dataset = simulator.generate_dataset(n_range=(2, 64), simulations_per_n=20)
    
    # Veri setini kaydet
    simulator.save_dataset(dataset, "tournament_dataset_v1.json")
    
    # Analiz et
    analysis = simulator.analyze_dataset(dataset)
    
    print("\nDataset Analysis:")
    print(f"Total simulations: {analysis['total_simulations']}")
    print(f"N range: {analysis['n_range']['min']} - {analysis['n_range']['max']}")
    print(f"Matches range: {analysis['matches_range']['min']} - {analysis['matches_range']['max']}")
    
    print("\nAverage matches by N:")
    for n in sorted(analysis['avg_matches_by_n'].keys()):
        stats = analysis['avg_matches_by_n'][n]
        print(f"N={n:2d}: {stats['avg']:.1f} ± {stats['std']:.1f} (min: {stats['min']}, max: {stats['max']})")
    
    return dataset, analysis


if __name__ == "__main__":
    run_data_collection() 