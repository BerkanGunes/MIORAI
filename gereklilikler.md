# Miorai Proje Yol Haritası

## Sprint 1: Temel Altyapı ve Kullanıcı Yönetimi ✅ TAMAMLANDI

### Backend Hedefleri ✅

- [x] Django projesi kurulumu ve temel yapılandırma
  - Proje yapısı ve bağımlılıkların kurulumu
  - Veritabanı bağlantısı ve User modeli
  - Temel API endpoint'lerinin tasarlanması
- [x] Auth API'leri
  - `users/views.py`: Kullanıcı kaydı ve girişi
  - Knox JWT token sistemi implementasyonu
  - Oturum yönetimi
- [x] Güvenlik Önlemleri
  - CORS yapılandırması
  - Rate limiting
  - Input validasyonları
  - XSS ve CSRF koruması

### Frontend Hedefleri ✅

- [x] React projesi kurulumu
  - Proje yapısı ve bağımlılıklar
  - Routing yapısı (`App.tsx`)
  - Temel bileşenler
- [x] Auth Sayfaları
  - Giriş/Kayıt sayfaları
  - Form validasyonları
  - API entegrasyonu
  - Route koruması
- [x] Ana Sayfa
  - Dashboard sayfası
  - Responsive tasarım
  - Kullanıcı durumu yönetimi

## Sprint 2: Turnuva Sistemi ve Resim Yönetimi ✅ TAMAMLANDI

### Backend Hedefleri ✅

- [x] Turnuva API'leri
  - `tournaments/models.py`: Tournament, TournamentImage, Match modelleri
  - `tournaments/views.py`: Turnuva oluşturma, resim yükleme, maç yönetimi
  - Resim depolama sistemi (tournament_images/)
- [x] Turnuva Altyapısı
  - Turnuva algoritması ve maç sistemi
  - Resim yükleme ve silme işlemleri
  - Hata yönetimi

### Frontend Hedefleri ✅

- [x] Turnuva Yönetimi
  - `ImageTournament.tsx`: Ana turnuva bileşeni
  - `ImageUpload.tsx`: Resim yükleme bileşeni
  - Resim seçim arayüzü
  - Yükleme durumu göstergeleri
- [x] Turnuva Arayüzü
  - `ImageMatchCard.tsx`: Karşılaştırma görüntüleme
  - Turnuva akışı yönetimi
  - Responsive tasarım

## Sprint 3: Public Turnuvalar ve Paylaşım ✅ TAMAMLANDI

### Backend Hedefleri ✅

- [x] Public Turnuva Sistemi
  - Public turnuva listesi API'si
  - Turnuva kopyalama sistemi
  - Turnuva public yapma özelliği
- [x] Turnuva Paylaşımı
  - Turnuva sonuçları
  - Public turnuva erişimi
  - Kullanıcı etkileşimi

### Frontend Hedefleri ✅

- [x] Public Turnuvalar
  - `PublicTournaments.tsx`: Public turnuva listesi
  - Turnuva seçim arayüzü
  - Turnuva kopyalama işlemi
- [x] Paylaşım Arayüzü
  - Turnuva sonuçları görüntüleme
  - Public yapma seçenekleri
  - Kullanıcı etkileşimi

## Sprint 4: Kullanıcı Deneyimi ve Profil ✅ TAMAMLANDI

### Backend Hedefleri ✅

- [x] Profil Yönetimi
  - Kullanıcı profil API'leri
  - Turnuva geçmişi
  - Email doğrulama sistemi
- [x] Kullanıcı Ayarları
  - Şifre değiştirme
  - Kullanıcı bilgileri güncelleme
  - Oturum yönetimi

### Frontend Hedefleri ✅

- [x] Profil Sayfası
  - Kullanıcı bilgileri yönetimi
  - Geçmiş turnuvalar
  - Ayarlar arayüzü
- [x] Kullanıcı Arayüzü
  - Tema ayarları (Dark theme)
  - Kullanıcı tercihleri paneli
  - Navigasyon sistemi

## Sprint 5: Kategori Sistemi ve ML Eşleşme Tahmini 🔄 DEVAM EDİYOR

### Backend Hedefleri

- [ ] Manuel Kategori Sistemi
  - Tournament modeline kategori alanı ekleme
  - Kategori seçenekleri (Anime, Nature, Architecture, vb.)
  - Kategori bazlı filtreleme API'si
  - Public turnuvalarda kategori gösterimi
- [ ] ML Eşleşme Sayısı Tahmini
  - `ml/predictor.py`: Eşleşme sayısı tahmin modeli
  - Resim benzerlik analizi
  - Turnuva karmaşıklık skoru hesaplama
  - Tahmin doğruluğu ve güvenilirlik skoru
- [ ] Tahmin API'leri
  - `PredictMatchesView`: Eşleşme sayısı tahmini
  - `RemainingMatchesView`: Kalan maç sayısı
  - `SimilarityAnalysisView`: Resim benzerlik analizi
  - Asenkron tahmin sistemi ve önbellekleme

### Frontend Hedefleri

- [ ] Kategori Sistemi
  - `CategorySelector.tsx`: Kategori seçici bileşeni
  - Turnuva oluşturma formuna kategori seçici ekleme
  - Kategori chip'leri ve etiketleri
  - Kategori bazlı filtreleme arayüzü
- [ ] ML Tahmin Göstergeleri
  - `MatchPrediction.tsx`: Eşleşme sayısı tahmin göstergesi
  - `RemainingMatches.tsx`: Kalan maç sayısı göstergesi
  - `SimilarityIndicator.tsx`: Benzerlik analizi görüntüleme
  - Turnuva başlatma öncesi tahmin bilgisi
- [ ] Public Tournaments Güncellemesi
  - Kategori bazlı filtreleme
  - Arama çubuğu entegrasyonu
  - Kategori etiketleri görüntüleme
  - Sıralama seçenekleri (popülerlik, tarih, kategori)

## Sprint 6: Performans İyileştirmeleri ve Optimizasyon 📋 PLANLANIYOR

### Backend Hedefleri

- [ ] Performans Optimizasyonları
  - Redis önbellekleme sistemi
  - Database query optimizasyonu
  - Resim işleme optimizasyonu
  - API response time iyileştirmeleri
- [ ] Güvenlik İyileştirmeleri
  - ML model güvenliği
  - Input sanitization geliştirmeleri
  - Rate limiting optimizasyonu
  - Güvenlik audit ve testleri
- [ ] Monitoring ve Logging
  - Sistem izleme araçları
  - Error tracking sistemi
  - Performance monitoring
  - Log analizi ve raporlama

### Frontend Hedefleri

- [ ] UI/UX İyileştirmeleri
  - Loading state optimizasyonları
  - Error handling geliştirmeleri
  - Accessibility iyileştirmeleri
  - Mobile experience optimizasyonu
- [ ] Kullanıcı Geri Bildirim Sistemi
  - Tahmin doğruluğu geri bildirimi
  - Kullanıcı raporlama sistemi
  - Feedback collection
  - Kullanıcı deneyimi analizi

## Sprint 7: Dokümantasyon ve Dağıtım 📋 PLANLANIYOR

### Backend Hedefleri

- [ ] Dokümantasyon
  - API dokümantasyonu (Swagger/OpenAPI)
  - ML model dokümantasyonu
  - Kurulum kılavuzu
  - Deployment yapılandırması
- [ ] Dağıtım
  - CI/CD pipeline kurulumu
  - Docker containerization
  - Production environment setup
  - Monitoring ve alerting sistemi

### Frontend Hedefleri

- [ ] Kullanıcı Dokümantasyonu
  - Kullanıcı kılavuzu
  - Kategori sistemi açıklaması
  - ML tahmin sistemi açıklaması
  - SSS sayfası
  - Gizlilik politikası
- [ ] Son Kontroller
  - Yardım merkezi
  - Son kullanıcı testleri
  - Performance testleri
  - Cross-browser testing

## Mevcut Özellikler ✅

### Backend
- Django REST Framework ile API
- Knox JWT authentication
- MySQL veritabanı
- Resim yükleme ve depolama
- Turnuva sistemi algoritması
- Public turnuva paylaşımı
- Rate limiting ve güvenlik

### Frontend
- React TypeScript
- Material-UI tasarım sistemi
- Dark theme
- Responsive tasarım
- Protected routes
- Turnuva yönetimi arayüzü
- Resim yükleme ve karşılaştırma

### API Endpoints
- `/api/auth/register/` - Kullanıcı kaydı
- `/api/auth/login/` - Kullanıcı girişi
- `/api/auth/logout/` - Çıkış
- `/api/tournaments/create/` - Turnuva oluşturma
- `/api/tournaments/upload-image/` - Resim yükleme
- `/api/tournaments/start/` - Turnuvayı başlatma
- `/api/tournaments/submit-result/<id>/` - Maç sonucu
- `/api/tournaments/public/` - Public turnuvalar
- `/api/tournaments/make-public/` - Public yapma

### Yeni API Endpoints (Sprint 5)
- `/api/tournaments/predict-matches/` - Eşleşme sayısı tahmini
- `/api/tournaments/remaining-matches/` - Kalan maç sayısı
- `/api/tournaments/similarity-analysis/` - Resim benzerlik analizi
- `/api/tournaments/categories/` - Kategori listesi
- `/api/tournaments/search/` - Kategori ve arama filtreleme

## Kategori Sistemi Detayları

### Desteklenen Kategoriler
1. **Anime/Manga** - Anime karakterleri, manga panelleri
2. **Nature** - Doğa manzaraları, bitkiler, hayvanlar
3. **Architecture** - Binalar, şehir manzaraları, yapılar
4. **People** - Portreler, grup fotoğrafları
5. **Animals** - Evcil hayvanlar, vahşi hayvanlar
6. **Food** - Yemekler, içecekler, restoranlar
7. **Art** - Resimler, heykeller, sanat eserleri
8. **Technology** - Elektronik cihazlar, bilgisayarlar
9. **Sports** - Spor aktiviteleri, oyunlar
10. **General** - Genel kategoriler

### ML Eşleşme Tahmin Sistemi

#### Tahmin Özellikleri
- **Resim Sayısı**: Temel faktör (2-16 resim)
- **Resim Benzerliği**: Yüksek benzerlik = daha az transitive closure
- **Resim Çeşitliliği**: Farklı kategoriler = daha fazla maç
- **Tarihsel Veriler**: Benzer turnuvaların sonuçları

#### Tahmin Çıktıları
- **Tahmini Maç Sayısı**: 4-15 arası
- **Güvenilirlik Skoru**: %70-95 arası
- **Kalan Maç Sayısı**: Turnuva sırasında güncellenen
- **Zorluk Seviyesi**: Kolay/Orta/Zor

## Önemli Notlar

1. Her Sprint Sonunda:
   - Çalışan bir ürün olmalı ✅
   - Kod review yapılmalı ✅
   - Test coverage kontrol edilmeli
   - Kullanıcı geri bildirimleri toplanmalı
   - Bir sonraki sprint planlanmalı

2. Güvenlik Öncelikleri:
   - Şifreler güvenli şekilde hashlenmeli ✅
   - JWT token'lar güvenli saklanmalı ✅
   - API endpoint'leri rate limiting ile korunmalı ✅
   - Input validasyonları sıkı tutulmalı ✅
   - XSS ve CSRF koruması sağlanmalı ✅
   - Resimler sunucuda güvenli saklanmalı ✅
   - ML model güvenliği sağlanmalı

3. Performans Hedefleri:
   - Sayfa yüklenme süresi < 2 saniye ✅
   - API yanıt süresi < 500ms ✅
   - Resim işleme süresi < 30 saniye ✅
   - ML tahmin süresi < 5 saniye
   - Mobil uyumluluk ✅
   - Tarayıcı uyumluluğu (Chrome, Firefox, Safari) ✅

4. Kod Kalitesi:
   - Yüksek test coverage
   - Temiz kod prensipleri ✅
   - Düzenli kod review ✅
   - Sürekli entegrasyon
   - Dokümantasyon güncelliği

## Sonraki Adımlar

1. **Kategori Sistemi**: Manuel kategori seçimi ve filtreleme
2. **ML Tahmin Sistemi**: Eşleşme sayısı tahmini
3. **Performans İyileştirmeleri**: Önbellek sistemi ve optimizasyonlar
4. **Dokümantasyon**: API ve kullanıcı kılavuzları
5. **Deployment**: Production ortamına geçiş
6. **Monitoring**: Sistem izleme ve loglama
