"""
ML Model Doğrudan Test Scripti
Bu script, ML modelini Django server olmadan test eder.
"""

import os
import sys
import django

# Django ayarlarını yükle
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'miorai_backend.settings')
django.setup()

from ml.match_predictor import MatchPredictor

def test_ml_model():
    """ML modelini doğrudan test et"""
    
    print("ML Model Doğrudan Testi Başlatılıyor...")
    print("=" * 50)
    
    try:
        # Modeli yükle
        predictor = MatchPredictor()
        predictor.load_model()
        
        print(f"Model yüklendi: {predictor.model_info['name']}")
        print(f"R² Score: {predictor.model_info['performance']['r2']:.4f}")
        print(f"MAE: {predictor.model_info['performance']['mae']:.2f}")
        
        print("\n" + "-" * 30)
        print("Tahmin Testleri:")
        
        # Test tahminleri
        test_cases = [2, 4, 8, 16, 32, 64]
        
        for n in test_cases:
            prediction = predictor.predict_matches(n)
            if prediction['mode'] == 'exact':
                print(f"N={n:2d}: 1 maç (kesin)")
            elif prediction['mode'] == 'point':
                print(f"N={n:2d}: {prediction['predicted_matches']:2d} maç (%95+ güven)")
            elif prediction['mode'] == 'interval':
                ci = prediction['confidence_interval']
                print(f"N={n:2d}: %95 güvenle {ci['lower']}-{ci['upper']} maç arası")
            else:
                print(f"N={n:2d}: Hata! Beklenmeyen mod: {prediction['mode']}")
        
        print("\n" + "-" * 30)
        print("Model Özellikleri:")
        print(f"Feature Names: {predictor.feature_names}")
        print(f"Model Path: {predictor.model_path}")
        
        # Model dosyası kontrolü
        if os.path.exists(predictor.model_path):
            file_size = os.path.getsize(predictor.model_path) / 1024  # KB
            print(f"Model File Size: {file_size:.1f} KB")
        else:
            print("Model file not found!")
        
        print("\n" + "=" * 50)
        print("ML Model Testi Başarıyla Tamamlandı!")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_ml_model() 