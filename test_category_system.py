#!/usr/bin/env python3
"""
Kategori Sistemi Test Scripti
Bu script kategori sisteminin doğru çalışıp çalışmadığını test eder.
"""

import requests
import json
import time

# API URL'leri
BASE_URL = "http://localhost:8000/api"
AUTH_URL = f"{BASE_URL}/auth"
TOURNAMENT_URL = f"{BASE_URL}/tournaments"

def test_category_system():
    print("🧪 Kategori Sistemi Testi Başlıyor...")
    
    # 1. Kullanıcı kaydı/girişi
    print("\n1. Kullanıcı girişi yapılıyor...")
    
    # Test kullanıcısı oluştur (eğer yoksa)
    register_data = {
        "email": "test_category@example.com",
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": "Category"
    }
    
    response = requests.post(f"{AUTH_URL}/register/", json=register_data)
    if response.status_code == 201:
        print("✅ Kullanıcı kaydı başarılı")
    elif response.status_code == 400:
        print("ℹ️ Kullanıcı zaten var, giriş yapılıyor...")
    else:
        print(f"❌ Kullanıcı kaydı başarısız: {response.status_code}")
        return
    
    # Giriş yap
    login_data = {
        "email": "test_category@example.com",
        "password": "TestPassword123!"
    }
    
    response = requests.post(f"{AUTH_URL}/login/", json=login_data)
    if response.status_code == 200:
        token = response.json()['token']
        headers = {"Authorization": f"Token {token}"}
        print("✅ Kullanıcı girişi başarılı")
    else:
        print(f"❌ Kullanıcı girişi başarısız: {response.status_code}")
        return
    
    # 2. Kategori listesini al
    print("\n2. Kategori listesi alınıyor...")
    response = requests.get(f"{BASE_URL}/ml/categories/", headers=headers)
    if response.status_code == 200:
        categories = response.json()
        print(f"✅ {len(categories)} kategori bulundu:")
        for cat in categories:
            print(f"   - {cat['value']}: {cat['label']}")
    else:
        print(f"❌ Kategori listesi alınamadı: {response.status_code}")
        return
    
    # 3. Debug: Mevcut turnuvaları kontrol et
    print("\n3. Mevcut turnuvalar kontrol ediliyor...")
    response = requests.get(f"{TOURNAMENT_URL}/debug/", headers=headers)
    if response.status_code == 200:
        tournaments = response.json()
        print(f"✅ {len(tournaments)} turnuva bulundu:")
        for tournament in tournaments:
            print(f"   - ID: {tournament['id']}, Name: {tournament['name']}, Category: {tournament['category']} ({tournament['category_display']}), Public: {tournament['is_public']}, Completed: {tournament['is_completed']}")
    else:
        print(f"❌ Turnuvalar alınamadı: {response.status_code}")
    
    # 4. Farklı kategorilerde turnuvalar oluştur
    test_categories = ['anime', 'nature', 'architecture']
    
    for category in test_categories:
        print(f"\n4. {category} kategorisinde turnuva oluşturuluyor...")
        
        # Turnuva oluştur
        tournament_data = {
            "name": f"Test {category.title()} Turnuvası",
            "category": category
        }
        
        response = requests.post(f"{TOURNAMENT_URL}/create/", json=tournament_data, headers=headers)
        if response.status_code == 201:
            tournament = response.json()
            print(f"✅ Turnuva oluşturuldu: ID={tournament['id']}, Category={tournament['category']}")
            
            # Turnuvayı public yap (simülasyon için)
            # Gerçek uygulamada turnuva tamamlanması gerekir
            print(f"   📝 Not: Gerçek uygulamada turnuva tamamlanması gerekir")
            
        else:
            print(f"❌ Turnuva oluşturulamadı: {response.status_code}")
    
    # 5. Public turnuvaları listele
    print("\n5. Public turnuvalar listeleniyor...")
    response = requests.get(f"{TOURNAMENT_URL}/public/", headers=headers)
    if response.status_code == 200:
        public_tournaments = response.json()
        print(f"✅ {len(public_tournaments)} public turnuva bulundu:")
        for tournament in public_tournaments:
            print(f"   - {tournament['name']}: {tournament['category']} ({tournament['category_display']})")
    else:
        print(f"❌ Public turnuvalar listelenemedi: {response.status_code}")
    
    # 6. Kategori filtresi testi
    print("\n6. Kategori filtresi test ediliyor...")
    for category in test_categories:
        response = requests.get(f"{TOURNAMENT_URL}/public/?category={category}", headers=headers)
        if response.status_code == 200:
            filtered_tournaments = response.json()
            print(f"✅ {category} kategorisinde {len(filtered_tournaments)} turnuva bulundu")
        else:
            print(f"❌ {category} kategorisi filtrelenemedi: {response.status_code}")
    
    print("\n🎉 Kategori sistemi testi tamamlandı!")
    
    # 7. Debug: Son durumu kontrol et
    print("\n7. Son durum kontrol ediliyor...")
    response = requests.get(f"{TOURNAMENT_URL}/debug/", headers=headers)
    if response.status_code == 200:
        tournaments = response.json()
        print(f"✅ Son durumda {len(tournaments)} turnuva var:")
        for tournament in tournaments:
            print(f"   - ID: {tournament['id']}, Name: {tournament['name']}, Category: {tournament['category']} ({tournament['category_display']}), Public: {tournament['is_public']}, Completed: {tournament['is_completed']}")
    else:
        print(f"❌ Son durum kontrol edilemedi: {response.status_code}")

if __name__ == "__main__":
    test_category_system() 