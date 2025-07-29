"""
Maç Sayısı Tahmin Modeli - Güven Aralığı Yaklaşımı
Bu modül, turnuva simülasyon verilerini kullanarak güven aralığı ile maç sayısı tahmini yapar.
"""

import json
import numpy as np
import scipy.stats as stats
from typing import Dict, List, Optional
import os

class MatchPredictor:
    """Maç sayısı tahmin modeli sınıfı - Güven aralığı yaklaşımı"""
    
    def __init__(self, dataset_path: str = "ml/data/tournament_dataset_v1.json"):
        self.dataset_path = dataset_path
        self.dataset = None
        self.confidence_level = 0.95  # %95 güven aralığı
        
    def load_dataset(self) -> List[Dict]:
        """
        Veri setini yükle
        
        Returns:
            List[Dict]: Veri seti
        """
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(f"Dataset not found: {self.dataset_path}")
        
        with open(self.dataset_path, 'r') as f:
            self.dataset = json.load(f)
        
        return self.dataset
    
    def get_matches_for_n_images(self, n_images: int) -> np.ndarray:
        """
        Belirli bir resim sayısı için maç sayılarını getir
        
        Args:
            n_images: Resim sayısı
            
        Returns:
            np.ndarray: Maç sayıları dizisi
        """
        if self.dataset is None:
            self.load_dataset()
        
        matches = []
        for record in self.dataset:
            if record['n_images'] == n_images:
                matches.append(record['total_matches'])
        
        return np.array(matches)
    
    def get_matches_for_n_images_with_source(self, n_images: int) -> Dict:
        """
        Belirli bir resim sayısı için maç sayılarını kaynak bilgisiyle getir
        
        Args:
            n_images: Resim sayısı
            
        Returns:
            Dict: Simülasyon ve kullanıcı verileri ayrı ayrı
        """
        if self.dataset is None:
            self.load_dataset()
        
        simulated_matches = []
        user_matches = []
        
        for record in self.dataset:
            if record['n_images'] == n_images:
                if record.get('is_user_tournament', False):
                    user_matches.append(record['total_matches'])
                else:
                    simulated_matches.append(record['total_matches'])
        
        return {
            'simulated': np.array(simulated_matches),
            'user': np.array(user_matches),
            'total': np.array(simulated_matches + user_matches)
        }
    
    def predict_matches_with_source_analysis(self, n_images: int) -> Dict:
        """
        Belirli bir resim sayısı için maç sayısı tahmini (kaynak analizi ile)
        
        Args:
            n_images: Resim sayısı
            
        Returns:
            Dict: Tahmin sonuçları ve kaynak analizi
        """
        try:
            # Veri setini yükle
            if self.dataset is None:
                self.load_dataset()
            
            # Kaynak bazlı veri analizi
            source_data = self.get_matches_for_n_images_with_source(n_images)
            
            if len(source_data['total']) == 0:
                return {
                    'error': f'{n_images} resim için veri bulunamadı',
                    'n_images': n_images,
                    'prediction': None
                }
            
            # Genel tahmin (tüm veriler)
            total_confidence_result = self.calculate_confidence_interval(source_data['total'])
            
            # Simülasyon tahmini
            simulated_confidence_result = None
            if len(source_data['simulated']) > 0:
                simulated_confidence_result = self.calculate_confidence_interval(source_data['simulated'])
            
            # Kullanıcı tahmini
            user_confidence_result = None
            if len(source_data['user']) > 0:
                user_confidence_result = self.calculate_confidence_interval(source_data['user'])
            
            # Sonuç formatını hazırla
            result = {
                'n_images': n_images,
                'prediction': {
                    'estimated_matches': total_confidence_result['mean'],
                    'confidence_interval': total_confidence_result['confidence_interval'],
                    'confidence_level': f"%{int(total_confidence_result['confidence_level'] * 100)}",
                    'distribution': total_confidence_result['distribution'],
                    'sample_size': total_confidence_result['sample_size'],
                    'margin_of_error': total_confidence_result['margin_of_error'],
                    'std_deviation': total_confidence_result['std']
                },
                'source_analysis': {
                    'total_samples': len(source_data['total']),
                    'simulated_samples': len(source_data['simulated']),
                    'user_samples': len(source_data['user']),
                    'simulated_prediction': simulated_confidence_result,
                    'user_prediction': user_confidence_result
                },
                'message': f"Yaklaşık {total_confidence_result['mean']} maç oynanacak (%{int(total_confidence_result['confidence_level'] * 100)} güven aralığı: {total_confidence_result['confidence_interval'][0]}-{total_confidence_result['confidence_interval'][1]})"
            }
            
            return result
            
        except Exception as e:
            return {
                'error': f'Tahmin hatası: {str(e)}',
                'n_images': n_images,
                'prediction': None
            }
    
    def calculate_confidence_interval(self, data: np.ndarray) -> Dict:
        """
        Güven aralığı hesapla
        
        Args:
            data: Veri dizisi
            
        Returns:
            Dict: Güven aralığı sonuçları
        """
        n = len(data)
        
        if n == 0:
            return {
                'error': 'Bu resim sayısı için veri bulunamadı',
                'confidence_interval': None,
                'distribution': None,
                'sample_size': 0
            }
        
        # Ortalama ve standart sapma hesapla
        x_bar = np.mean(data)
        s = np.std(data, ddof=1)
        
        # Güven aralığı hesapla
        if n <= 30:
            # Küçük örneklemlerde t-dağılımı zorunlu
            dist = "t"
            crit_value = stats.t.ppf(0.975, df=n-1)
        else:
            # Büyük örneklemlerde z-dağılımı tercih edilebilir
            dist = "z"
            crit_value = stats.norm.ppf(0.975)
        
        # Margin of Error hesapla
        ME = crit_value * (s / np.sqrt(n))
        
        # Güven aralığı sınırları
        lower_bound = x_bar - ME
        upper_bound = x_bar + ME
        
        return {
            'mean': round(x_bar, 2),
            'std': round(s, 2),
            'confidence_interval': (round(lower_bound, 2), round(upper_bound, 2)),
            'distribution': dist,
            'sample_size': n,
            'margin_of_error': round(ME, 2),
            'confidence_level': self.confidence_level
        }
    
    def predict_matches(self, n_images: int) -> Dict:
        """
        Belirli bir resim sayısı için maç sayısı tahmini yap
        
        Args:
            n_images: Resim sayısı
            
        Returns:
            Dict: Tahmin sonuçları
        """
        try:
            # Veri setini yükle
            if self.dataset is None:
                self.load_dataset()
            
            # Bu resim sayısı için maç verilerini getir
            matches_data = self.get_matches_for_n_images(n_images)
            
            if len(matches_data) == 0:
                return {
                    'error': f'{n_images} resim için veri bulunamadı',
                    'n_images': n_images,
                    'prediction': None
                }
            
            # Güven aralığı hesapla
            confidence_result = self.calculate_confidence_interval(matches_data)
            
            if 'error' in confidence_result:
                return {
                    'error': confidence_result['error'],
                    'n_images': n_images,
                    'prediction': None
                }
            
            # Sonuç formatını hazırla
            result = {
                'n_images': n_images,
                'prediction': {
                    'estimated_matches': confidence_result['mean'],
                    'confidence_interval': confidence_result['confidence_interval'],
                    'confidence_level': f"%{int(confidence_result['confidence_level'] * 100)}",
                    'distribution': confidence_result['distribution'],
                    'sample_size': confidence_result['sample_size'],
                    'margin_of_error': confidence_result['margin_of_error'],
                    'std_deviation': confidence_result['std']
                },
                'message': f"Yaklaşık {confidence_result['mean']} maç oynanacak (%{int(confidence_result['confidence_level'] * 100)} güven aralığı: {confidence_result['confidence_interval'][0]}-{confidence_result['confidence_interval'][1]})"
            }
            
            return result
            
        except Exception as e:
            return {
                'error': f'Tahmin hatası: {str(e)}',
                'n_images': n_images,
                'prediction': None
            }
    
    def get_available_n_values(self) -> List[int]:
        """
        Veri setinde bulunan resim sayılarını getir
        
        Returns:
            List[int]: Mevcut resim sayıları
        """
        if self.dataset is None:
            self.load_dataset()
        
        n_values = set()
        for record in self.dataset:
            n_values.add(record['n_images'])
        
        return sorted(list(n_values))
    
    def get_dataset_summary(self) -> Dict:
        """
        Veri seti özeti getir
        
        Returns:
            Dict: Veri seti özeti
        """
        if self.dataset is None:
            self.load_dataset()
        
        n_values = self.get_available_n_values()
        total_records = len(self.dataset)
        
        return {
            'total_records': total_records,
            'available_n_values': n_values,
            'n_range': {
                'min': min(n_values) if n_values else 0,
                'max': max(n_values) if n_values else 0
            }
        }

def load_and_test_model():
    """Test fonksiyonu"""
    predictor = MatchPredictor()
    
    # Veri seti özeti
    summary = predictor.get_dataset_summary()
    print(f"Veri seti özeti: {summary}")
    
    # Test tahminleri
    test_n_values = [2, 4, 8, 16, 32]
    
    for n in test_n_values:
        result = predictor.predict_matches(n)
        print(f"\n{n} resim için tahmin:")
        print(f"Sonuç: {result}") 