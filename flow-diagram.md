graph TD

%% Giriş ve Yönlendirme
A[Giriş Sayfası /login]
A --> B[Kaydol /register veya Giriş Yap /login]
B -->|Başarılıysa| C[Dashboard / Anasayfa]
A -->|Zaten kayıtlıysa| C

%% Dashboard - Ana Seçenekler
C --> D1["Kendi Turnuvanı Yarat" Butonu]
C --> D2["Turnuvaya Katıl" Butonu]
C --> D3[Profil Sayfası]
C --> D4[SSS/Yardım Sayfası]
C --> D5[Gizlilik Politikası]

%% Kendi Turnuvanı Yarat Akışı
D1 --> E[Turnuva Oluşturma Sayfası /tournament]
E --> E1[Kategori Seçimi]
E1 --> F[Resim Yükleme Ekranı]
F --> F1["Cihazdan Resim Yükle /upload-image/"]
F1 --> F2["Resimler sunucuda saklanır (tournament_images/)"]
F --> G["Resim Silme /delete-image/<id>/"]
F --> H[En az 2 resim kontrolü]
H -->|Yetersiz| F
H -->|Yeterli| I1[ML Eşleşme Tahmini /predict-matches/]
I1 --> I2["Tahmini maç sayısı gösterilir"]
I2 --> I["Turnuvayı Başlat /start/"]

%% Turnuva Oyun Akışı
I --> J[Karşılaştırma Ekranı]
J --> J1[Kalan Maç Sayısı Göstergesi]
J1 --> K["İki Resim Karşılaştırması"]
K --> L["Kazanan Seçimi /submit-result/<match_id>/"]
L --> M[Sonraki Maç Kontrolü]
M -->|Devam| J
M -->|Bitti| N[Turnuva Tamamlandı]

%% Turnuva Tamamlandı
N --> O[Sonuç Ekranı]
O --> P[Turnuvayı Public Yapma Seçeneği]
P -->|Evet| Q["Public Yap /make-public/"]
P -->|Hayır| R[Turnuvayı Sil /delete/]
Q --> S[Public Turnuvalar Listesine Ekle]
R --> T[Yeni Turnuva Oluştur]
T --> E

%% Turnuvaya Katıl Akışı
D2 --> U[Public Turnuvalar Listesi /public-tournaments]
U --> U1["Arama ve Filtreleme"]
U1 --> U2["Kategori Seçimi (Anime, Nature, vb.)"]
U2 --> U3["Metin Arama"]
U3 --> V[Turnuva Seçimi]
V --> W["Turnuvadan Kopyala /create-from-public/<id>/"]
W --> X[Kopya Turnuva Oluşturuldu]
X --> I

%% Profil Sayfası
D3 --> Y[Kullanıcı Profili]
Y --> Y1[Önceki turnuvalar]
Y --> Y2[Şifre değiştirme]
Y --> Y3[Email doğrulama]
Y --> Y4[Çıkış yap /logout]

%% Yardım ve Gizlilik
D4 --> Z[SSS/Yardım Sayfası]
Z --> Z1["Hangi dosyalar destekleniyor?"]
Z --> Z2["Turnuva nasıl oluşturulur?"]
Z --> Z3["Sonuçlar nasıl okunmalı?"]
Z --> Z4["Kategori sistemi nasıl çalışır?"]
Z --> Z5["ML tahmin sistemi nasıl çalışır?"]

D5 --> AA[Gizlilik Politikası]
AA --> AA1[Veri saklama süresi ve şartları]
AA --> AA2[Resimlerin gizliliğiyle ilgili açıklamalar]
AA --> AA3[ML modeli veri kullanımı]

%% ML Eşleşme Tahmin Sistemi
subgraph "ML Eşleşme Tahmin Sistemi"
    ML1["Resim Analizi"]
    ML2["Benzerlik Hesaplama"]
    ML3["Eşleşme Sayısı Tahmini"]
    ML4["Güvenilirlik Skoru"]
    ML5["Kullanıcı Geri Bildirimi"]
    
    ML1 --> ML2
    ML2 --> ML3
    ML3 --> ML4
    ML4 --> ML5
    ML5 --> ML1
end

%% Kategori Sistemi
subgraph "Kategori Sistemi"
    CAT1["Manuel Kategori Seçimi"]
    CAT2["Kategori Filtreleme"]
    CAT3["Kategori Bazlı Arama"]
    CAT4["Public Turnuva Kategorileri"]
    
    CAT1 --> CAT2
    CAT2 --> CAT3
    CAT3 --> CAT4
end

%% Arama ve Filtreleme Sistemi
subgraph "Arama ve Filtreleme"
    SEARCH1["Kategori Filtreleme"]
    SEARCH2["Metin Arama"]
    SEARCH3["Sıralama (Popülerlik, Tarih, Kategori)"]
    SEARCH4["Kombinasyonlu Filtreleme"]
    
    SEARCH1 --> SEARCH4
    SEARCH2 --> SEARCH4
    SEARCH3 --> SEARCH4
end

%% API Endpoints
subgraph "Backend API Endpoints"
    API1["/api/auth/register/"]
    API2["/api/auth/login/"]
    API3["/api/auth/logout/"]
    API4["/api/auth/user/"]
    API5["/api/tournaments/create/"]
    API6["/api/tournaments/upload-image/"]
    API7["/api/tournaments/start/"]
    API8["/api/tournaments/submit-result/<id>/"]
    API9["/api/tournaments/public/"]
    API10["/api/tournaments/make-public/"]
    API11["/api/tournaments/delete/"]
    API12["/api/tournaments/predict-matches/"]
    API13["/api/tournaments/remaining-matches/"]
    API14["/api/tournaments/similarity-analysis/"]
    API15["/api/tournaments/categories/"]
    API16["/api/tournaments/search/"]
end

%% Frontend Routes
subgraph "Frontend Routes"
    ROUTE1["/login"]
    ROUTE2["/register"]
    ROUTE3["/dashboard"]
    ROUTE4["/tournament"]
    ROUTE5["/public-tournaments"]
    ROUTE6["/about"]
    ROUTE7["/contact"]
end

%% Desteklenen Kategoriler
subgraph "Desteklenen Kategoriler"
    CATEGORY1["Anime/Manga"]
    CATEGORY2["Nature"]
    CATEGORY3["Architecture"]
    CATEGORY4["People"]
    CATEGORY5["Animals"]
    CATEGORY6["Food"]
    CATEGORY7["Art"]
    CATEGORY8["Technology"]
    CATEGORY9["Sports"]
    CATEGORY10["General"]
end

%% ML Tahmin Özellikleri
subgraph "ML Tahmin Özellikleri"
    FEATURE1["Resim Sayısı (2-16)"]
    FEATURE2["Resim Benzerliği"]
    FEATURE3["Resim Çeşitliliği"]
    FEATURE4["Tarihsel Veriler"]
    
    FEATURE1 --> PREDICT1["Tahmini Maç Sayısı (4-15)"]
    FEATURE2 --> PREDICT2["Güvenilirlik Skoru (%70-95)"]
    FEATURE3 --> PREDICT3["Kalan Maç Sayısı"]
    FEATURE4 --> PREDICT4["Zorluk Seviyesi"]
end
