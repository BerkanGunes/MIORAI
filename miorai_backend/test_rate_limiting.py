#!/usr/bin/env python3
"""
Rate Limiting Test Script
Bu script, rate limiting ayarlarını test etmek için kullanılır.
"""

import requests
import time
import json

# Test ayarları
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/tournaments"
TOKEN = None  # Test için token gerekli

def get_auth_headers():
    """Auth header'ları döndür"""
    if not TOKEN:
        print("❌ Token gerekli! Önce login olun.")
        return None
    return {
        'Authorization': f'Token {TOKEN}',
        'Content-Type': 'application/json'
    }

def test_rate_limits():
    """Rate limiting ayarlarını test et"""
    print("🧪 Rate Limiting Test Başlıyor...")
    print("=" * 50)
    
    headers = get_auth_headers()
    if not headers:
        return
    
    # Test 1: Tournament oluşturma (sustained throttle)
    print("\n📋 Test 1: Tournament Oluşturma (Sustained: 500/hour)")
    print("-" * 40)
    
    for i in range(3):
        try:
            response = requests.post(
                f"{API_URL}/create/",
                headers=headers,
                json={"name": f"Test Tournament {i+1}", "category": "general"}
            )
            print(f"  Deneme {i+1}: {response.status_code} - {response.text[:100]}")
        except Exception as e:
            print(f"  Hata: {e}")
    
    # Test 2: Maç sonucu gönderme (match throttle)
    print("\n🏆 Test 2: Maç Sonucu Gönderme (Match: 200/minute)")
    print("-" * 40)
    
    # Önce bir turnuva oluştur ve başlat
    try:
        # Tournament oluştur
        response = requests.post(
            f"{API_URL}/create/",
            headers=headers,
            json={"name": "Rate Test Tournament", "category": "general"}
        )
        tournament_data = response.json()
        print(f"  Tournament oluşturuldu: {tournament_data.get('id')}")
        
        # Resim yükle (2 adet)
        for i in range(2):
            files = {'image': ('test.jpg', b'fake_image_data', 'image/jpeg')}
            data = {'name': f'Test Image {i+1}'}
            response = requests.post(
                f"{API_URL}/upload-image/",
                headers={'Authorization': headers['Authorization']},
                files=files,
                data=data
            )
            print(f"  Resim {i+1} yüklendi: {response.status_code}")
        
        # Turnuvayı başlat
        response = requests.post(f"{API_URL}/start/", headers=headers)
        print(f"  Turnuva başlatıldı: {response.status_code}")
        
        # Maç sonuçlarını test et
        for i in range(5):
            try:
                response = requests.post(
                    f"{API_URL}/submit-result/1/",  # İlk maç
                    headers=headers,
                    json={"winner_id": 1}
                )
                print(f"  Maç sonucu {i+1}: {response.status_code}")
                
                if response.status_code == 429:
                    print(f"    ⚠️ Rate limit aşıldı! Retry-After: {response.headers.get('Retry-After', 'N/A')}")
                    break
                    
            except Exception as e:
                print(f"  Hata: {e}")
                break
                
    except Exception as e:
        print(f"  Test setup hatası: {e}")
    
    # Test 3: Resim yükleme (burst throttle)
    print("\n📸 Test 3: Resim Yükleme (Burst: 50/minute)")
    print("-" * 40)
    
    for i in range(3):
        try:
            files = {'image': (f'test_{i}.jpg', b'fake_image_data', 'image/jpeg')}
            data = {'name': f'Burst Test Image {i+1}'}
            response = requests.post(
                f"{API_URL}/upload-image/",
                headers={'Authorization': headers['Authorization']},
                files=files,
                data=data
            )
            print(f"  Resim yükleme {i+1}: {response.status_code}")
            
            if response.status_code == 429:
                print(f"    ⚠️ Rate limit aşıldı!")
                break
                
        except Exception as e:
            print(f"  Hata: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Rate Limiting Test Tamamlandı!")

def test_retry_mechanism():
    """Retry mekanizmasını test et"""
    print("\n🔄 Retry Mekanizması Test")
    print("-" * 30)
    
    headers = get_auth_headers()
    if not headers:
        return
    
    # Hızlı ardışık istekler gönder
    print("Hızlı ardışık istekler gönderiliyor...")
    
    start_time = time.time()
    success_count = 0
    rate_limit_count = 0
    
    for i in range(10):
        try:
            response = requests.post(
                f"{API_URL}/submit-result/1/",
                headers=headers,
                json={"winner_id": 1},
                timeout=5
            )
            
            if response.status_code == 200:
                success_count += 1
                print(f"  ✅ Başarılı: {i+1}")
            elif response.status_code == 429:
                rate_limit_count += 1
                print(f"  ⚠️ Rate Limit: {i+1} (Retry-After: {response.headers.get('Retry-After', 'N/A')})")
            else:
                print(f"  ❌ Hata {response.status_code}: {i+1}")
                
        except Exception as e:
            print(f"  ❌ Exception: {e}")
    
    end_time = time.time()
    duration = end_time - start_time
    
    print(f"\n📊 Sonuçlar:")
    print(f"  Toplam süre: {duration:.2f} saniye")
    print(f"  Başarılı istekler: {success_count}")
    print(f"  Rate limit aşımları: {rate_limit_count}")
    print(f"  Ortalama istek/saniye: {10/duration:.2f}")

if __name__ == "__main__":
    print("🚀 Miorai Rate Limiting Test Tool")
    print("=" * 50)
    
    # Token al
    print("🔑 Test için token gerekli!")
    print("1. Backend'i çalıştırın: python manage.py runserver")
    print("2. Frontend'den login olun ve token'ı alın")
    print("3. Bu script'te TOKEN değişkenini güncelleyin")
    print("4. Script'i tekrar çalıştırın")
    
    # Test'leri çalıştır
    if TOKEN:
        test_rate_limits()
        test_retry_mechanism()
    else:
        print("\n❌ Token ayarlanmadığı için test çalıştırılamadı.")
        print("TOKEN değişkenini güncelleyip tekrar deneyin.") 