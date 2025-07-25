"""
Django Management Command: Veri Seti Analizi
Bu komut, turnuva simülasyon verilerini analiz eder ve güven aralığı istatistiklerini gösterir.
"""

from django.core.management.base import BaseCommand
from django.conf import settings
import os
import sys

# ML modülünü import et
sys.path.append(os.path.join(settings.BASE_DIR, 'ml'))
from match_predictor import MatchPredictor


class Command(BaseCommand):
    help = 'Veri setini analiz et ve güven aralığı istatistiklerini göster'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test-predictions',
            action='store_true',
            help='Test tahminleri yap',
        )
        parser.add_argument(
            '--n-values',
            type=str,
            default='2,4,8,16,32',
            help='Test edilecek N değerleri (virgülle ayrılmış)',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Veri Seti Analizi Başlatılıyor...')
        )

        try:
            # Güven aralığı tahmin modelini oluştur
            predictor = MatchPredictor()
            
            # Veri seti özeti
            summary = predictor.get_dataset_summary()
            
            self.stdout.write(
                self.style.SUCCESS(f'Veri seti yüklendi: {summary["total_records"]} kayıt')
            )
            
            self.stdout.write(f'N aralığı: {summary["n_range"]["min"]} - {summary["n_range"]["max"]}')
            self.stdout.write(f'Mevcut N değerleri: {summary["available_n_values"]}')
            
            # Test tahminleri
            if options['test_predictions']:
                self.stdout.write('\n' + '='*50)
                self.stdout.write('TEST TAHMİNLERİ')
                self.stdout.write('='*50)
                
                n_values_str = options['n_values']
                test_n_values = [int(n.strip()) for n in n_values_str.split(',')]
                
                for n in test_n_values:
                    self.stdout.write(f'\n--- {n} Resim İçin Tahmin ---')
                    
                    result = predictor.predict_matches(n)
                    
                    if 'error' in result:
                        self.stdout.write(
                            self.style.ERROR(f'Hata: {result["error"]}')
                        )
                    else:
                        pred = result['prediction']
                        self.stdout.write(
                            self.style.SUCCESS(f'Tahmini maç sayısı: {pred["estimated_matches"]}')
                        )
                        self.stdout.write(f'Güven aralığı: {pred["confidence_interval"][0]} - {pred["confidence_interval"][1]}')
                        self.stdout.write(f'Güven seviyesi: {pred["confidence_level"]}')
                        self.stdout.write(f'Dağılım: {pred["distribution"]}-dağılımı')
                        self.stdout.write(f'Örnek sayısı: {pred["sample_size"]}')
                        self.stdout.write(f'Hata payı: ±{pred["margin_of_error"]}')
                        self.stdout.write(f'Standart sapma: {pred["std_deviation"]}')
                        
                        if result.get('message'):
                            self.stdout.write(f'Mesaj: {result["message"]}')
            
            # Veri seti detayları
            self.stdout.write('\n' + '='*50)
            self.stdout.write('VERİ SETİ DETAYLARI')
            self.stdout.write('='*50)
            
            for n in summary['available_n_values']:
                matches_data = predictor.get_matches_for_n_images(n)
                if len(matches_data) > 0:
                    mean_matches = matches_data.mean()
                    std_matches = matches_data.std(ddof=1)
                    self.stdout.write(f'N={n:2d}: {len(matches_data):3d} örnek, '
                                    f'ortalama={mean_matches:5.2f}, '
                                    f'std={std_matches:5.2f}')
            
            self.stdout.write(
                self.style.SUCCESS('\nVeri seti analizi tamamlandı!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Analiz hatası: {str(e)}')
            )
            return 