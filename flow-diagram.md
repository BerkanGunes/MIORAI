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
E --> F[Resim Yükleme Ekranı]
F --> F1["Cihazdan Resim Yükle /upload-image/"]
F1 --> F2["Resimler sunucuda saklanır (tournament_images/)"]
F --> G["Resim Silme /delete-image/<id>/"]
F --> H[En az 2 resim kontrolü]
H -->|Yetersiz| F
H -->|Yeterli| I["Turnuvayı Başlat /start/"]

%% Turnuva Oyun Akışı
I --> J[Karşılaştırma Ekranı]
J --> K["İki Resim Karşılaştırması"]
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
U --> V[Turnuva Seçimi]
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

D5 --> AA[Gizlilik Politikası]
AA --> AA1[Veri saklama süresi ve şartları]
AA --> AA2[Resimlerin gizliliğiyle ilgili açıklamalar]

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
