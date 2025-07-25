"""
Veri Seti Temizleme ve Analiz Scripti
Bu script, ML modeli için veri setini temizler ve analiz eder.
"""

import json
import pandas as pd
import numpy as np
from collections import defaultdict

def analyze_dataset():
    """Veri setini analiz et"""
    
    print("Veri Seti Analizi Başlatılıyor...")
    print("=" * 50)
    
    # Veri setini yükle
    with open('ml/data/tournament_dataset_v1.json', 'r') as f:
        data = json.load(f)
    
    df = pd.DataFrame(data)
    
    print(f"Toplam kayıt sayısı: {len(df)}")
    print(f"N aralığı: {df['n_images'].min()} - {df['n_images'].max()}")
    print(f"Maç aralığı: {df['total_matches'].min()} - {df['total_matches'].max()}")
    
    # N değerlerine göre analiz
    print("\nN değerlerine göre analiz:")
    for n in sorted(df['n_images'].unique()):
        n_data = df[df['n_images'] == n]
        matches = n_data['total_matches']
        
        print(f"N={n:2d}: {len(n_data):3d} simülasyon")
        print(f"  Maç aralığı: {matches.min():2d} - {matches.max():2d}")
        print(f"  Ortalama: {matches.mean():.1f}")
        print(f"  Standart sapma: {matches.std():.1f}")
        
        # Anormal değerleri tespit et
        q1 = matches.quantile(0.25)
        q3 = matches.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        outliers = matches[(matches < lower_bound) | (matches > upper_bound)]
        if len(outliers) > 0:
            print(f"  ⚠️  Anormal değerler: {list(outliers)}")
        
        print()
    
    return df

def clean_dataset(df):
    """Veri setini temizle"""
    
    print("Veri Temizleme Başlatılıyor...")
    print("=" * 50)
    
    original_count = len(df)
    cleaned_df = df.copy()
    
    # 1. Mantıksız değerleri temizle
    print("1. Mantıksız değerleri temizleme...")
    
    # N=2 için sadece 1 maç olmalı
    n2_mask = (df['n_images'] == 2) & (df['total_matches'] != 1)
    if n2_mask.sum() > 0:
        print(f"  N=2 için hatalı değerler: {df[n2_mask]['total_matches'].tolist()}")
        cleaned_df = cleaned_df[~n2_mask]
    
    # N=3 için sadece 1 maç olmalı
    n3_mask = (df['n_images'] == 3) & (df['total_matches'] != 1)
    if n3_mask.sum() > 0:
        print(f"  N=3 için hatalı değerler: {df[n3_mask]['total_matches'].tolist()}")
        cleaned_df = cleaned_df[~n3_mask]
    
    # 2. Outlier'ları temizle (IQR yöntemi)
    print("2. Outlier'ları temizleme...")
    
    outliers_removed = 0
    for n in sorted(df['n_images'].unique()):
        if n <= 3:  # N=2,3 için outlier kontrolü yapma
            continue
            
        n_data = cleaned_df[cleaned_df['n_images'] == n]
        if len(n_data) == 0:
            continue
            
        matches = n_data['total_matches']
        q1 = matches.quantile(0.25)
        q3 = matches.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        outlier_mask = (cleaned_df['n_images'] == n) & (
            (cleaned_df['total_matches'] < lower_bound) | 
            (cleaned_df['total_matches'] > upper_bound)
        )
        
        outliers_count = outlier_mask.sum()
        if outliers_count > 0:
            print(f"  N={n}: {outliers_count} outlier kaldırıldı")
            outliers_removed += outliers_count
            cleaned_df = cleaned_df[~outlier_mask]
    
    # 3. Minimum maç sayısı kontrolü
    print("3. Minimum maç sayısı kontrolü...")
    
    # Her N için minimum maç sayısı hesapla
    min_matches_by_n = {}
    for n in sorted(df['n_images'].unique()):
        if n <= 3:
            min_matches_by_n[n] = 1
        else:
            # N kişi için minimum maç sayısı: N-1 (herkes en az bir kez oynamalı)
            min_matches_by_n[n] = n - 1
    
    invalid_min_matches = 0
    for n, min_matches in min_matches_by_n.items():
        invalid_mask = (cleaned_df['n_images'] == n) & (cleaned_df['total_matches'] < min_matches)
        invalid_count = invalid_mask.sum()
        if invalid_count > 0:
            print(f"  N={n}: {invalid_count} kayıt minimum maç sayısının altında")
            invalid_min_matches += invalid_count
            cleaned_df = cleaned_df[~invalid_mask]
    
    # 4. Maksimum maç sayısı kontrolü
    print("4. Maksimum maç sayısı kontrolü...")
    
    # Her N için maksimum maç sayısı hesapla
    max_matches_by_n = {}
    for n in sorted(df['n_images'].unique()):
        if n <= 3:
            max_matches_by_n[n] = 1
        else:
            # N kişi için maksimum maç sayısı: N*(N-1)/2 (herkes herkesle oynar)
            max_matches_by_n[n] = n * (n - 1) // 2
    
    invalid_max_matches = 0
    for n, max_matches in max_matches_by_n.items():
        invalid_mask = (cleaned_df['n_images'] == n) & (cleaned_df['total_matches'] > max_matches)
        invalid_count = invalid_mask.sum()
        if invalid_count > 0:
            print(f"  N={n}: {invalid_count} kayıt maksimum maç sayısının üstünde")
            invalid_max_matches += invalid_count
            cleaned_df = cleaned_df[~invalid_mask]
    
    # Sonuçları raporla
    print("\n" + "=" * 50)
    print("Temizleme Sonuçları:")
    print(f"Orijinal kayıt sayısı: {original_count}")
    print(f"Temizlenmiş kayıt sayısı: {len(cleaned_df)}")
    print(f"Kaldırılan kayıt sayısı: {original_count - len(cleaned_df)}")
    print(f"  - Outlier'lar: {outliers_removed}")
    print(f"  - Minimum maç hatası: {invalid_min_matches}")
    print(f"  - Maksimum maç hatası: {invalid_max_matches}")
    
    return cleaned_df

def save_cleaned_dataset(df, filename="tournament_dataset_cleaned.json"):
    """Temizlenmiş veri setini kaydet"""
    
    print(f"\nTemizlenmiş veri seti kaydediliyor: {filename}")
    
    # DataFrame'i JSON'a çevir
    cleaned_data = df.to_dict('records')
    
    with open(f'ml/data/{filename}', 'w') as f:
        json.dump(cleaned_data, f, indent=2)
    
    print(f"Temizlenmiş veri seti kaydedildi: {len(cleaned_data)} kayıt")

def main():
    """Ana fonksiyon"""
    
    # Veri setini analiz et
    df = analyze_dataset()
    
    # Temizleme yapmak ister misiniz?
    response = input("\nVeri setini temizlemek ister misiniz? (y/n): ")
    
    if response.lower() == 'y':
        # Veri setini temizle
        cleaned_df = clean_dataset(df)
        
        # Temizlenmiş veri setini kaydet
        save_cleaned_dataset(cleaned_df)
        
        # Temizlenmiş veri setini analiz et
        print("\n" + "=" * 50)
        print("Temizlenmiş Veri Seti Analizi:")
        
        for n in sorted(cleaned_df['n_images'].unique()):
            n_data = cleaned_df[cleaned_df['n_images'] == n]
            matches = n_data['total_matches']
            
            print(f"N={n:2d}: {len(n_data):3d} simülasyon")
            print(f"  Maç aralığı: {matches.min():2d} - {matches.max():2d}")
            print(f"  Ortalama: {matches.mean():.1f}")
            print(f"  Standart sapma: {matches.std():.1f}")
            print()
    else:
        print("Veri temizleme iptal edildi.")

if __name__ == "__main__":
    main() 