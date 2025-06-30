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
- ✅ Email gönderildi mesajı görünmeli
- ✅ Şifre sıfırlama emaili gönderilmeli

---

## 📁 Sprint 2: Dosya İşleme Testleri

### Test Senaryosu 2.1: Resim Yükleme
**Amaç:** Resim yükleme işleminin doğru çalıştığını doğrulamak

**Adımlar:**
1. Dashboard'da "Turnuvaya Başla" butonuna tıkla
2. "Resim Yükle" butonuna tıkla
3. Test resmi seç (JPG/PNG formatında)
4. Resim adını gir: "Test Resim 1"
5. "Yükle" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Resim başarıyla yüklenmeli
- ✅ Resim listesinde görünmeli
- ✅ Yükleme durumu göstergesi çalışmalı

### Test Senaryosu 2.2: Geçersiz Dosya Yükleme
**Amaç:** Geçersiz dosya formatlarının reddedildiğini doğrulamak

**Adımlar:**
1. TXT dosyası yüklemeye çalış
2. Çok büyük dosya yüklemeye çalış (>16MB)
3. Boş dosya yüklemeye çalış

**Beklenen Sonuç:**
- ❌ Hata mesajı görünmeli
- ❌ Dosya yüklenmemeli

### Test Senaryosu 2.3: Resim Silme
**Amaç:** Yüklenen resmin silinebildiğini doğrulamak

**Adımlar:**
1. Yüklenen resmin yanındaki "Sil" butonuna tıkla
2. Silme işlemini onayla

**Beklenen Sonuç:**
- ✅ Resim listeden kaldırılmalı
- ✅ Sunucudan dosya silinmeli

### Test Senaryosu 2.4: Çoklu Resim Yükleme
**Amaç:** Birden fazla resmin yüklenebildiğini doğrulamak

**Adımlar:**
1. 5 farklı resim yükle
2. Her resme farklı isim ver
3. Tüm resimlerin listelendiğini kontrol et

**Beklenen Sonuç:**
- ✅ Tüm resimler başarıyla yüklenmeli
- ✅ Resimler sırayla listelenmeli
- ✅ Toplam resim sayısı doğru görünmeli

---

## 🏆 Sprint 3: Turnuva Sistemi Testleri

### Test Senaryosu 3.1: Turnuva Başlatma
**Amaç:** Turnuvanın doğru şekilde başlatıldığını doğrulamak

**Adımlar:**
1. En az 2 resim yükle
2. "Turnuvayı Başlat" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Turnuva başlamalı
- ✅ İlk maç görünmeli
- ✅ Resim yükleme devre dışı kalmalı

### Test Senaryosu 3.2: Yetersiz Resim ile Turnuva Başlatma
**Amaç:** Tek resimle turnuva başlatmanın engellendiğini doğrulamak

**Adımlar:**
1. Sadece 1 resim yükle
2. "Turnuvayı Başlat" butonuna tıkla

**Beklenen Sonuç:**
- ❌ Hata mesajı görünmeli
- ❌ Turnuva başlamamalı

### Test Senaryosu 3.3: Maç Karşılaştırması
**Amaç:** Maç karşılaştırma sisteminin çalıştığını doğrulamak

**Adımlar:**
1. Turnuvayı başlat
2. İki resim arasından birini seç
3. "Bu Resmi Seç" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Seçim kaydedilmeli
- ✅ Sonraki maça geçilmeli
- ✅ Puanlar güncellenmeli

### Test Senaryosu 3.4: Turnuva Tamamlama
**Amaç:** Turnuvanın doğru şekilde tamamlandığını doğrulamak

**Adımlar:**
1. Tüm maçları tamamla
2. Final maçını oyna

**Beklenen Sonuç:**
- ✅ Turnuva tamamlanmalı
- ✅ Kazanan resim gösterilmeli

### Test Senaryosu 3.5: Public Turnuvadan Katılım
**Amaç:** Public turnuvadan katıldığında turnuvanın otomatik başladığını doğrulamak

**Adımlar:**
1. Dashboard'da "Public Turnuvalar" butonuna tıkla
2. Mevcut bir public turnuvayı seç
3. "Turnuvaya Katıl" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Turnuva otomatik olarak başlamalı
- ✅ Resimler kopyalanmalı
- ✅ İlk maç görünmeli (resim yükleme adımına yönlendirilmemeli)
- ✅ Turnuva oyun adımında olmalı (step 1)

### Test Senaryosu 3.6: Public Turnuva Oluşturma
**Amaç:** Tamamlanan turnuvayı public yapabildiğini doğrulamak

**Adımlar:**
1. Bir turnuvayı tamamla
2. "Evet, Public Yap" butonuna tıkla
3. Turnuva ismini gir
4. Onayla

**Beklenen Sonuç:**
- ✅ Turnuva public olmalı
- ✅ Public turnuvalar listesinde görünmeli
- ✅ Diğer kullanıcılar katılabilmeli

---

## 🔒 Güvenlik Testleri

### Test Senaryosu S.1: Yetkisiz Erişim
**Amaç:** Giriş yapmadan korumalı sayfalara erişimin engellendiğini doğrulamak

**Adımlar:**
1. Tarayıcıda `/dashboard` adresine git
2. Token'ı localStorage'dan sil
3. Sayfayı yenile

**Beklenen Sonuç:**
- ❌ Login sayfasına yönlendirilmeli
- ❌ Dashboard'a erişim engellenmeli

### Test Senaryosu S.2: Token Geçerliliği
**Amaç:** Geçersiz token ile erişimin engellendiğini doğrulamak

**Adımlar:**
1. Geçersiz token localStorage'a ekle
2. API istekleri yap

**Beklenen Sonuç:**
- ❌ 401 hatası alınmalı
- ❌ Login sayfasına yönlendirilmeli

### Test Senaryosu S.3: Rate Limiting
**Amaç:** API rate limiting'in çalıştığını doğrulamak

**Adımlar:**
1. Çok hızlı ardışık istekler gönder
2. Rate limit aşımını test et

**Beklenen Sonuç:**
- ❌ Rate limit hatası alınmalı
- ❌ İstekler geçici olarak engellenmeli

---

## 📱 UI/UX Testleri

### Test Senaryosu U.1: Responsive Tasarım
**Amaç:** Farklı ekran boyutlarında uygulamanın düzgün göründüğünü doğrulamak

**Adımlar:**
1. Desktop'ta test et
2. Tablet boyutunda test et
3. Mobile boyutunda test et

**Beklenen Sonuç:**
- ✅ Tüm ekran boyutlarında düzgün görünmeli
- ✅ Responsive tasarım çalışmalı

### Test Senaryosu U.2: Loading States
**Amaç:** Yükleme durumlarının doğru gösterildiğini doğrulamak

**Adımlar:**
1. Yavaş internet bağlantısında test et
2. Resim yükleme sırasında loading göster
3. API istekleri sırasında loading göster

**Beklenen Sonuç:**
- ✅ Loading spinner'lar görünmeli
- ✅ Kullanıcı geri bildirimi sağlanmalı

### Test Senaryosu U.3: Error Handling
**Amaç:** Hata durumlarının doğru şekilde gösterildiğini doğrulamak

**Adımlar:**
1. Network hatası simüle et
2. Server hatası simüle et
3. Validation hatası oluştur

**Beklenen Sonuç:**
- ✅ Hata mesajları görünmeli
- ✅ Kullanıcı dostu mesajlar olmalı

---

## 🧪 Otomatik Test Çalıştırma

### Backend Testleri
```bash
cd miorai_backend
python manage.py test users
python manage.py test tournaments
python manage.py test --verbosity=2
```

### Frontend Testleri
```bash
cd miorai_frontend
npm test
npm run test -- --coverage
```

---

## 📊 Test Sonuçları Raporu

### Test Çalıştırma Sonrası Kontrol Listesi:

- [ ] Tüm backend testleri geçti mi?
- [ ] Tüm frontend testleri geçti mi?
- [ ] Manuel test senaryoları başarılı mı?
- [ ] Güvenlik testleri geçti mi?
- [ ] UI/UX testleri başarılı mı?
- [ ] Performance testleri kabul edilebilir mi?

### Hata Raporlama Formatı:
```
Test Senaryosu: [Senaryo Adı]
Hata Açıklaması: [Detaylı hata açıklaması]
Beklenen Davranış: [Ne olması gerekiyordu]
Gerçekleşen Davranış: [Ne oldu]
Adımlar: [Hata oluşturan adımlar]
Öncelik: [Yüksek/Orta/Düşük]
``` 