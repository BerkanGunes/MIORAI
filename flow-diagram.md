graph TD

%% Giriş ve Yönlendirme
A[Giriş Sayfası]
A --> B[Kaydol / Giriş Yap]
B -->|Başarılıysa| C[Anasayfa / Bilgilendirme Sayfası]
A -->|Zaten kayıtlıysa| C

%% Bilgilendirme Sayfası
C --> D["Karşılaştırmaya Başla" Butonu]
D --> E[Dosya Seçim Ekranı]

%% Dosya Seçim Ekranı
E --> F["Cihazdan Dosya Yükle"]
F --> F1["Dosyalar sunucuda saklanmaz (uyarı)"]
E --> G["Hazır Dosyalardan Seç"]
E --> H["Dosya etiketleme/kategorilendirme"]
E --> I[Seçim tamamlandığında → Karşılaştırma Ekranı]

%% Karşılaştırma Ekranı
I --> J["Farklılıklar gösterilir (renk kodları, satır-satır)"]
I --> K["Benzerlik Skoru %"]
I --> L["Makine Öğrenimiyle kategorilendirme (gelişmiş)"]
I --> M["Yorum bırakma/not ekleme alanı"]
I --> N["Yeniden Karşılaştır/Dosya Değiştir"]
I --> O["Karşılaştırmayı Bitir"]
O --> P[Sonuç Ekranı]

%% Sonuç Ekranı
P --> Q[Karşılaştırma Özeti]
P --> R[Sonuçları Dışa Aktar .pdf, .txt, .csv]
P --> S[Karşılaştırmayı Paylaş link üretimi]
P --> T[Benzer karşılaştırmalar göster]
P --> U[Geri dön --> Dosya Seçim]
U --> E

%% Profil Sayfası
C --> V[Profil Sayfası]
V --> V1[Önceki karşılaşmalar]
V --> V2[Kaydedilen notlar/paylaşılan karşılaştırmalar]
V --> V3[Tema/Görünüm ayarları]
V --> V4[Çıkış yap]

%% SSS/Yardım ve Gizlilik
C --> W[SSS/Yardım Sayfası]
C --> X[Gizlilik Politikası/KVKK Sayfası]

W --> W1["Hangi dosyalar destekleniyor?"]
W --> W2["Karşılaştırma nasıl yapılır?"]
W --> W3["Sonuçlar nasıl okunmalı?"]

X --> X1[Veri saklama süresi ve şartları]
X --> X2[Dosyaların gizliliğiyle ilgili açıklamalar]
