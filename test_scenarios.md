# 🧪 Miorai Test Senaryoları

## 📋 Test Öncesi Hazırlık

### 1. Environment Setup
```bash
# Backend kurulumu
cd miorai_backend
cp env_example.txt .env
# .env dosyasını düzenleyin
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend kurulumu
cd miorai_frontend
npm install
npm start
```

### 2. Test Verileri Hazırlama
- Test resimleri (JPG, PNG formatında)
- Farklı boyutlarda resimler (küçük, orta, büyük)
- Farklı formatlarda dosyalar
- **Kategori Test Verileri:**
  - Anime karakteri resimleri (Anime/Manga kategorisi için)
  - Doğa manzaraları (Nature kategorisi için)
  - Bina/şehir fotoğrafları (Architecture kategorisi için)
  - İnsan portreleri (People kategorisi için)
  - Hayvan fotoğrafları (Animals kategorisi için)
  - Yemek fotoğrafları (Food kategorisi için)
  - Sanat eserleri (Art kategorisi için)
  - Teknoloji ürünleri (Technology kategorisi için)
  - Spor aktiviteleri (Sports kategorisi için)
  - Karışık içerikler (General kategorisi için)

---

## 🔐 Sprint 1: Kullanıcı Yönetimi Testleri

### Test Senaryosu 1.1: Kullanıcı Kaydı
**Amaç:** Yeni kullanıcı kaydının doğru çalıştığını doğrulamak

**Adımlar:**
1. Frontend'de `/register` sayfasına git
2. Geçerli bilgilerle form doldur:
   - Email: `test@example.com`
   - Şifre: `TestPassword123!`
   - Ad: `Test`
   - Soyad: `User`
3. "Kayıt Ol" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Kayıt başarılı mesajı görünmeli
- ✅ Email doğrulama sayfasına yönlendirilmeli
- ✅ Veritabanında kullanıcı oluşturulmalı
- ✅ Email doğrulama token'ı oluşturulmalı

### Test Senaryosu 1.2: Geçersiz Kayıt
**Amaç:** Geçersiz verilerle kayıt işleminin reddedildiğini doğrulamak

**Adımlar:**
1. Geçersiz email ile kayıt olmaya çalış: `invalid-email`
2. Çok kısa şifre ile kayıt olmaya çalış: `123`
3. Boş alanlarla kayıt olmaya çalış

**Beklenen Sonuç:**
- ❌ Hata mesajları görünmeli
- ❌ Kayıt işlemi tamamlanmamalı

### Test Senaryosu 1.3: Kullanıcı Girişi
**Amaç:** Mevcut kullanıcının giriş yapabildiğini doğrulamak

**Adımlar:**
1. `/login` sayfasına git
2. Doğru email ve şifre ile giriş yap
3. "Giriş Yap" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Giriş başarılı olmalı
- ✅ Dashboard'a yönlendirilmeli
- ✅ Token localStorage'a kaydedilmeli

### Test Senaryosu 1.4: Yanlış Kimlik Bilgileri
**Amaç:** Yanlış kimlik bilgileriyle girişin reddedildiğini doğrulamak

**Adımlar:**
1. Yanlış email ile giriş yapmaya çalış
2. Yanlış şifre ile giriş yapmaya çalış

**Beklenen Sonuç:**
- ❌ Hata mesajı görünmeli
- ❌ Giriş yapılmamalı

### Test Senaryosu 1.5: Şifre Sıfırlama
**Amaç:** Şifre sıfırlama işleminin çalıştığını doğrulamak

**Adımlar:**
1. `/forgot-password` sayfasına git
2. Mevcut email adresini gir
3. "Şifre Sıfırla" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Şifre sıfırlama emaili gönderilmeli
- ✅ Başarı mesajı görünmeli

---

## 🏆 Sprint 2: Turnuva Sistemi Testleri

### Test Senaryosu 2.1: Turnuva Oluşturma
**Amaç:** Yeni turnuva oluşturmanın doğru çalıştığını doğrulamak

**Adımlar:**
1. Dashboard'da "Kendi Turnuvanı Yarat" butonuna tıkla
2. Turnuva adını gir: `Test Turnuvası`
3. "Turnuva Oluştur" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Turnuva oluşturulmalı
- ✅ Resim yükleme sayfasına yönlendirilmeli
- ✅ Veritabanında turnuva kaydı oluşturulmalı

### Test Senaryosu 2.2: Resim Yükleme
**Amaç:** Resim yükleme işleminin doğru çalıştığını doğrulamak

**Adımlar:**
1. Turnuva oluşturma sayfasında "Resim Yükle" butonuna tıkla
2. Geçerli bir resim dosyası seç (JPG/PNG)
3. Resim adını gir: `Test Resim 1`
4. "Yükle" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Resim başarıyla yüklenmeli
- ✅ Resim listesinde görünmeli
- ✅ Sunucuda `tournament_images/` klasöründe saklanmalı

### Test Senaryosu 2.3: Geçersiz Resim Yükleme
**Amaç:** Geçersiz dosya formatlarının reddedildiğini doğrulamak

**Adımlar:**
1. Geçersiz dosya formatı seç (TXT, PDF)
2. Çok büyük dosya seç (>10MB)
3. Boş dosya seç

**Beklenen Sonuç:**
- ❌ Hata mesajı görünmeli
- ❌ Dosya yüklenmemeli

### Test Senaryosu 2.4: Turnuva Başlatma
**Amaç:** Turnuvayı başlatmanın doğru çalıştığını doğrulamak

**Adımlar:**
1. En az 2 resim yükle
2. "Turnuvayı Başlat" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Turnuva başlamalı
- ✅ İlk maç gösterilmeli
- ✅ BOŞ resimler otomatik eklenmeli (2'nin kuvvetine tamamla)

---

## 🎯 Sprint 5: Kategori Sistemi ve ML Tahmin Testleri

### Test Senaryosu 5.1: Kategori Seçimi
**Amaç:** Turnuva oluşturma sırasında kategori seçiminin çalıştığını doğrulamak

**Adımlar:**
1. Turnuva oluşturma sayfasında kategori seçiciyi aç
2. "Anime/Manga" kategorisini seç
3. Turnuva adını gir ve oluştur
4. Resim yükleme sayfasına geç

**Beklenen Sonuç:**
- ✅ Kategori seçici görünmeli
- ✅ Seçilen kategori kaydedilmeli
- ✅ Turnuva oluşturma formunda kategori alanı olmalı

### Test Senaryosu 5.2: ML Eşleşme Tahmini
**Amaç:** ML modelinin eşleşme sayısını doğru tahmin ettiğini doğrulamak

**Adımlar:**
1. 8 resim yükle (farklı kategorilerden)
2. "Tahmin Al" butonuna tıkla
3. Tahmin sonucunu kontrol et

**Beklenen Sonuç:**
- ✅ Tahmin sonucu 4-15 arasında olmalı
- ✅ Güvenilirlik skoru %70-95 arasında olmalı
- ✅ Tahmin süresi < 5 saniye olmalı

### Test Senaryosu 5.3: Kalan Maç Sayısı Göstergesi
**Amaç:** Turnuva sırasında kalan maç sayısının doğru gösterildiğini doğrulamak

**Adımlar:**
1. Turnuvayı başlat
2. İlk maçı tamamla
3. Kalan maç sayısını kontrol et

**Beklenen Sonuç:**
- ✅ Kalan maç sayısı doğru hesaplanmalı
- ✅ Her maç sonrası güncellenmeli
- ✅ Görsel gösterge (progress bar) olmalı

### Test Senaryosu 5.4: Kategori Bazlı Filtreleme
**Amaç:** Public turnuvalarda kategori filtrelemenin çalıştığını doğrulamak

**Adımlar:**
1. Public turnuvalar sayfasına git
2. "Anime/Manga" kategorisi filtresini seç
3. Sonuçları kontrol et

**Beklenen Sonuç:**
- ✅ Sadece Anime/Manga kategorisindeki turnuvalar görünmeli
- ✅ Filtre temizleme butonu çalışmalı
- ✅ Birden fazla kategori seçimi yapılabilmeli

### Test Senaryosu 5.5: Benzerlik Analizi
**Amaç:** Resim benzerlik analizinin doğru çalıştığını doğrulamak

**Adımlar:**
1. Benzer resimler yükle (aynı kategoriden)
2. Farklı resimler yükle (farklı kategorilerden)
3. Benzerlik analizi sonuçlarını karşılaştır

**Beklenen Sonuç:**
- ✅ Benzer resimler yüksek benzerlik skoru almalı
- ✅ Farklı resimler düşük benzerlik skoru almalı
- ✅ Benzerlik skoru 0-1 arasında olmalı

### Test Senaryosu 5.6: Arama Sistemi
**Amaç:** Kategori ve metin aramasının çalıştığını doğrulamak

**Adımlar:**
1. Public turnuvalar sayfasında arama kutusuna "anime" yaz
2. "Nature" kategorisini seç
3. Sonuçları kontrol et

**Beklenen Sonuç:**
- ✅ Hem metin hem kategori filtresi çalışmalı
- ✅ Sonuçlar anında güncellenmeli
- ✅ "Sonuç bulunamadı" mesajı görünmeli (uygun durumda)

---

## 🔍 Sprint 6: Performans Testleri

### Test Senaryosu 6.1: Yüksek Yük Testi
**Amaç:** Sistemin yüksek kullanıcı yükü altında çalıştığını doğrulamak

**Adımlar:**
1. 100+ resim yükle
2. 16 resimlik turnuva oluştur
3. Turnuvayı başlat ve tamamla

**Beklenen Sonuç:**
- ✅ Sistem yavaşlamamalı
- ✅ Tüm işlemler tamamlanmalı
- ✅ Memory leak olmamalı

### Test Senaryosu 6.2: API Response Time
**Amaç:** API yanıt sürelerinin kabul edilebilir olduğunu doğrulamak

**Adımlar:**
1. API endpoint'lerini test et
2. Response time'ları ölç

**Beklenen Sonuç:**
- ✅ API yanıt süresi < 500ms olmalı
- ✅ ML tahmin süresi < 5 saniye olmalı
- ✅ Resim yükleme süresi < 30 saniye olmalı

### Test Senaryosu 6.3: Mobile Responsiveness
**Amaç:** Mobil cihazlarda uygulamanın düzgün çalıştığını doğrulamak

**Adımlar:**
1. Mobil tarayıcıda test et
2. Farklı ekran boyutlarında test et
3. Touch gesture'ları test et

**Beklenen Sonuç:**
- ✅ Responsive tasarım çalışmalı
- ✅ Touch gesture'lar çalışmalı
- ✅ Mobil performans kabul edilebilir olmalı

---

## 🛡️ Güvenlik Testleri

### Test Senaryosu 7.1: Authentication
**Amaç:** Kimlik doğrulama sisteminin güvenli olduğunu doğrulamak

**Adımlar:**
1. Geçersiz token ile API çağrısı yap
2. Expired token ile API çağrısı yap
3. Token olmadan API çağrısı yap

**Beklenen Sonuç:**
- ❌ 401 Unauthorized hatası alınmalı
- ❌ API erişimi reddedilmeli

### Test Senaryosu 7.2: Input Validation
**Amaç:** Input validasyonlarının güvenli olduğunu doğrulamak

**Adımlar:**
1. SQL injection denemesi yap
2. XSS denemesi yap
3. File upload güvenlik testi yap

**Beklenen Sonuç:**
- ❌ Güvenlik açıkları olmamalı
- ❌ Zararlı kod çalışmamalı
- ❌ Dosya güvenliği sağlanmalı

### Test Senaryosu 7.3: Rate Limiting
**Amaç:** Rate limiting sisteminin çalıştığını doğrulamak

**Adımlar:**
1. Çok hızlı API çağrıları yap
2. Rate limit aşımını test et

**Beklenen Sonuç:**
- ❌ Rate limit aşıldığında 429 hatası alınmalı
- ❌ API erişimi geçici olarak engellenmeli

---

## 📱 Cross-Browser Testleri

### Test Senaryosu 8.1: Chrome Testi
**Adımlar:**
1. Chrome'da tüm özellikleri test et
2. Developer tools ile performans kontrol et

### Test Senaryosu 8.2: Firefox Testi
**Adımlar:**
1. Firefox'ta tüm özellikleri test et
2. CSS ve JavaScript uyumluluğunu kontrol et

### Test Senaryosu 8.3: Safari Testi
**Adımlar:**
1. Safari'de tüm özellikleri test et
2. WebKit uyumluluğunu kontrol et

---

## 🧪 ML Model Testleri

### Test Senaryosu 9.1: Model Doğruluğu
**Amaç:** ML modelinin tahmin doğruluğunu test etmek

**Adımlar:**
1. Bilinen sonuçlu turnuvalar oluştur
2. Model tahminlerini gerçek sonuçlarla karşılaştır
3. Doğruluk oranını hesapla

**Beklenen Sonuç:**
- ✅ Doğruluk oranı > %70 olmalı
- ✅ Güvenilirlik skoru tutarlı olmalı

### Test Senaryosu 9.2: Model Performansı
**Amaç:** ML modelinin performansını test etmek

**Adımlar:**
1. Farklı resim sayılarıyla test et
2. Farklı kategorilerle test et
3. Response time'ları ölç

**Beklenen Sonuç:**
- ✅ Tüm durumlarda çalışmalı
- ✅ Response time < 5 saniye olmalı
- ✅ Memory kullanımı makul olmalı

---

## 📊 Test Raporlama

### Test Sonuçları Formatı
```json
{
  "test_scenario": "5.1 - Kategori Seçimi",
  "status": "PASSED",
  "execution_time": "2.5s",
  "browser": "Chrome 120.0",
  "device": "Desktop",
  "notes": "Kategori seçimi başarıyla çalışıyor",
  "screenshots": ["screenshot1.png", "screenshot2.png"]
}
```

### Test Coverage Hedefleri
- **Unit Tests**: %80+
- **Integration Tests**: %70+
- **E2E Tests**: %60+
- **ML Model Tests**: %90+

### Test Otomasyonu
- **Backend**: pytest ile unit ve integration testleri
- **Frontend**: Jest ve React Testing Library
- **E2E**: Cypress ile end-to-end testleri
- **ML**: Custom test suite ile model testleri

---

## 🚀 Test Çalıştırma Komutları

```bash
# Backend testleri
cd miorai_backend
python manage.py test

# Frontend testleri
cd miorai_frontend
npm test

# E2E testleri
npm run cypress:open

# ML model testleri
cd miorai_backend
python -m pytest ml/tests/
```

Bu test senaryoları, Sprint 5'in yeni yaklaşımına uygun olarak güncellenmiştir ve ML eşleşme tahmini ile manuel kategori sistemi özelliklerini kapsamaktadır. 