# Miorai Proje Yol Haritası

## Sprint 1: Temel Altyapı ve Kullanıcı Yönetimi (2 Hafta)

### Backend Hedefleri

- [ ] Flask projesi kurulumu ve temel yapılandırma
  - Proje yapısı ve bağımlılıkların kurulumu
  - Veritabanı bağlantısı ve User modeli
  - Temel API endpoint'lerinin tasarlanması
- [ ] Auth API'leri
  - `auth.py`: Kullanıcı kaydı ve girişi
  - JWT token sistemi implementasyonu
  - Oturum yönetimi
- [ ] Güvenlik Önlemleri
  - CORS yapılandırması (yapıldı)
  - Rate limiting (yapıldı ancak test edilmedi)
  - Input validasyonları (yapıldı)
  - XSS ve CSRF koruması (yapıldı)

### Frontend Hedefleri

- [ ] React projesi kurulumu
  - Proje yapısı ve bağımlılıklar
  - Routing yapısı (`App.js`)
  - Temel bileşenler
- [ ] Auth Sayfaları
  - Giriş/Kayıt sayfaları
  - Form validasyonları
  - API entegrasyonu
  - Route koruması
- [ ] Ana Sayfa
  - Basit bilgilendirme sayfası
  - Responsive tasarım
  - Kullanıcı durumu yönetimi

## Sprint 2: Dosya İşleme Sistemi (2 Hafta)

### Backend Hedefleri

- [ ] Dosya İşleme API'leri
  - ImageUploadView (tournaments/views.py içinde): Dosya yükleme ve işleme
  - Geçici dosya depolama sistemi
  - Dosya güvenlik kontrolleri
- [ ] Karşılaştırma Altyapısı
  - Karşılaştırma mantığı Match modeli ve turnuva sistemi içinde: Temel karşılaştırma mantığı
  - Dosya işleme kuyruğu
  - Hata yönetimi

### Frontend Hedefleri

- [ ] Dosya Yönetimi
  - `ImageUpload.tsx`: Dosya yükleme bileşeni
  - Dosya seçim arayüzü
  - Yükleme durumu göstergeleri
- [ ] Karşılaştırma Arayüzü
  - `ImageMatchCard.tsx`: Karşılaştırma görüntüleme
  - Basit sonuç ekranı
  - Responsive tasarım

## Sprint 3: Karşılaştırma ve Analiz (2 Hafta)

### Backend Hedefleri

- [ ] Gelişmiş Karşılaştırma
  - `similarity.py`: Benzerlik algoritması
  - Performans optimizasyonları
  - Önbellek sistemi
- [ ] Dışa Aktarma
  - `export.py`: Sonuç dışa aktarma API'leri
  - Farklı format desteği
  - Batch işlem desteği

### Frontend Hedefleri

- [ ] Karşılaştırma Görüntüleyici
  - Gelişmiş karşılaştırma arayüzü
  - İnteraktif grafikler
  - Filtreleme ve sıralama
- [ ] Sonuç Ekranı
  - Detaylı analiz görünümü
  - Dışa aktarma seçenekleri
  - Paylaşım özellikleri

## Sprint 4: Kullanıcı Deneyimi ve Profil (2 Hafta)

### Backend Hedefleri

- [ ] Profil Yönetimi
  - Kullanıcı profil API'leri
  - Karşılaştırma geçmişi
  - Notlar ve etiketleme sistemi
- [ ] Paylaşım Sistemi
  - Karşılaştırma paylaşımı
  - Kullanıcı tercihleri
  - Bildirim sistemi

### Frontend Hedefleri

- [ ] Profil Sayfası
  - Kullanıcı bilgileri yönetimi
  - Geçmiş karşılaştırmalar
  - Notlar ve etiketler arayüzü
- [ ] Kullanıcı Arayüzü
  - Tema ayarları
  - Kullanıcı tercihleri paneli
  - Bildirim merkezi

## Sprint 5: Makine Öğrenimi ve İyileştirmeler (2 Hafta)

### Backend Hedefleri

- [ ] ML Entegrasyonu
  - `classifier.py`: Dosya kategorilendirme
  - Model eğitimi ve test
  - API entegrasyonu
- [ ] Sistem İyileştirmeleri
  - Performans optimizasyonları
  - Güvenlik iyileştirmeleri
  - Logging ve monitoring

### Frontend Hedefleri

- [ ] ML Arayüzü
  - Kategorilendirme görüntüleme
  - İstatistik dashboard'u
  - Model performans göstergeleri
- [ ] Sistem İyileştirmeleri
  - Arayüz optimizasyonları
  - Hata yönetimi
  - Kullanıcı geri bildirim sistemi

## Sprint 6: Dokümantasyon ve Dağıtım (2 Hafta)

### Backend Hedefleri

- [ ] Dokümantasyon
  - API dokümantasyonu
  - Kurulum kılavuzu
  - Deployment yapılandırması
- [ ] Dağıtım
  - CI/CD pipeline
  - Monitoring sistemi
  - Yedekleme stratejisi

### Frontend Hedefleri

- [ ] Kullanıcı Dokümantasyonu
  - Kullanıcı kılavuzu
  - SSS sayfası
  - Gizlilik politikası
- [ ] Son Kontroller
  - Yardım merkezi
  - Son kullanıcı testleri
  - Performans testleri

## Önemli Notlar

1. Her Sprint Sonunda:

   - Çalışan bir ürün olmalı
   - Kod review yapılmalı
   - Test coverage kontrol edilmeli
   - Kullanıcı geri bildirimleri toplanmalı
   - Bir sonraki sprint planlanmalı

2. Güvenlik Öncelikleri:

   - Şifreler güvenli şekilde hashlenmeli
   - JWT token'lar güvenli saklanmalı
   - API endpoint'leri rate limiting ile korunmalı
   - Input validasyonları sıkı tutulmalı
   - XSS ve CSRF koruması sağlanmalı
   - Dosyalar sunucuda saklanmamalı

3. Performans Hedefleri:

   - Sayfa yüklenme süresi < 2 saniye
   - API yanıt süresi < 500ms
   - Dosya işleme süresi < 30 saniye
   - Mobil uyumluluk
   - Tarayıcı uyumluluğu (Chrome, Firefox, Safari)

4. Kod Kalitesi:
   - Yüksek test coverage
   - Temiz kod prensipleri
   - Düzenli kod review
   - Sürekli entegrasyon
   - Dokümantasyon güncelliği
