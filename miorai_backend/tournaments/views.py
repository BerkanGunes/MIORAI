from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import UserRateThrottle
from django.shortcuts import get_object_or_404
from .models import Tournament, TournamentImage, Match
from .serializers import (
    TournamentSerializer, TournamentCreateSerializer, 
    ImageUploadSerializer, TournamentImageSerializer,
    PublicTournamentSerializer
)
import json
import math
import os

# ML veri toplama için import
from ml.match_predictor import MatchPredictor

# Performance monitoring ve cache imports
from core.monitoring import monitor_performance, monitor_api_performance
from core.cache import tournament_cache, cache_result, invalidate_cache_pattern
from core.monitoring import log_user_action, log_error

class TournamentMatchThrottle(UserRateThrottle):
    """
    Turnuva maç sonuçları için özel throttle sınıfı
    - Dakikada 200 istek (normal kullanıcı davranışı için yeterli)
    - Sadece maç sonucu gönderme işlemlerinde kullanılır
    """
    rate = '200/minute'
    scope = 'tournament_match'

class TournamentBurstThrottle(UserRateThrottle):
    """
    Turnuva işlemleri için burst throttle sınıfı
    - Dakikada 50 istek (yoğun kullanım için)
    - Turnuva başlatma, resim yükleme gibi işlemlerde kullanılır
    """
    rate = '50/minute'
    scope = 'tournament_burst'

class TournamentSustainedThrottle(UserRateThrottle):
    """
    Turnuva işlemleri için sürekli throttle sınıfı
    - Saatte 500 istek (uzun süreli kullanım için)
    - Genel turnuva işlemlerinde kullanılır
    """
    rate = '500/hour'
    scope = 'tournament_sustained'

class TournamentCreateView(generics.CreateAPIView):
    serializer_class = TournamentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [TournamentSustainedThrottle]  # Turnuva oluşturma için sustained throttle
    
    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            # Log user action
            log_user_action(request.user.id, 'tournament_created', {
                'tournament_id': response.data.get('id'),
                'category': response.data.get('category')
            })
            return response
        except Exception as e:
            log_error(e, {'user_id': request.user.id, 'action': 'tournament_create'})
            raise
    
    def perform_create(self, serializer):
        # Önce mevcut aktif turnuvaları pasif yap
        Tournament.objects.filter(user=self.request.user, is_active=True).update(is_active=False)
        tournament = serializer.save(user=self.request.user)
        
        # Invalidate user cache
        tournament_cache.invalidate_tournament_cache(tournament.id)

class TournamentDetailView(generics.RetrieveAPIView, generics.UpdateAPIView):
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [TournamentSustainedThrottle]  # Turnuva detayları için sustained throttle
    
    def retrieve(self, request, *args, **kwargs):
        try:
            # Try to get from cache first
            tournament = self.get_object()
            cached_data = tournament_cache.get_cached_tournament_data(tournament.id)
            
            if cached_data:
                return Response(cached_data)
            
            # If not in cache, get from database and cache it
            response = super().retrieve(request, *args, **kwargs)
            tournament_cache.cache_tournament_data(tournament.id, response.data)
            
            return response
        except Exception as e:
            log_error(e, {'user_id': request.user.id, 'action': 'tournament_detail'})
            raise
    
    def get_object(self):
        return get_object_or_404(Tournament, user=self.request.user, is_active=True)

class ImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [TournamentBurstThrottle]  # Resim yükleme için burst throttle
    
    def post(self, request):
        try:
            tournament = get_object_or_404(Tournament, user=request.user, is_active=True)
            
            # Turnuva başlamışsa resim yüklenemez
            if tournament.matches.exists():
                return Response(
                    {"error": "Turnuva başladıktan sonra resim eklenemez."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = ImageUploadSerializer(data=request.data)
            if serializer.is_valid():
                # Eğer name verilmemişse dosya adını kullan
                name = serializer.validated_data.get('name')
                if not name:
                    import re
                    name = re.sub(r'\.[^/.]+$', '', request.FILES['image'].name)  # Uzantıyı kaldır
                
                image = serializer.save(
                    tournament=tournament,
                    original_filename=request.FILES['image'].name,
                    name=name,
                    order_index=tournament.images.count()
                )
                return Response(
                    TournamentImageSerializer(image, context={'request': request}).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print(f"ImageUploadView Error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": f"Resim yükleme hatası: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ImageDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, image_id):
        tournament = get_object_or_404(Tournament, user=request.user, is_active=True)
        image = get_object_or_404(TournamentImage, id=image_id, tournament=tournament)
        
        # Turnuva başlamışsa resim silinemez
        if tournament.matches.exists():
            return Response(
                {"error": "Turnuva başladıktan sonra resim silinemez."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ImageUpdateNameView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, image_id):
        tournament = get_object_or_404(Tournament, user=request.user, is_active=True)
        image = get_object_or_404(TournamentImage, id=image_id, tournament=tournament)
        
        # Turnuva başlamışsa resim ismi değiştirilemez
        if tournament.matches.exists():
            return Response(
                {"error": "Turnuva başladıktan sonra resim ismi değiştirilemez."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        name = request.data.get('name')
        if not name or not name.strip():
            return Response(
                {"error": "Resim ismi boş olamaz."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image.name = name.strip()
        image.save()
        
        return Response(
            TournamentImageSerializer(image, context={'request': request}).data,
            status=status.HTTP_200_OK
        )

class StartTournamentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [TournamentBurstThrottle]  # Turnuva başlatma için burst throttle
    
    def post(self, request):
        tournament = get_object_or_404(Tournament, user=request.user, is_active=True)
        
        if tournament.matches.exists():
            return Response(
                {"error": "Turnuva zaten başlamış."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        images = list(tournament.images.all())
        if len(images) < 2:
            return Response(
                {"error": "En az 2 resim gerekli."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # BOŞ resimler ekle (2'nin kuvvetine tamamla)
        image_count = len(images)
        next_power_of_2 = 2 ** math.ceil(math.log2(image_count))
        empty_slots = next_power_of_2 - image_count
        
        for i in range(empty_slots):
            TournamentImage.objects.create(
                tournament=tournament,
                name=f"BOŞ_{i}",
                original_filename=f"empty_{i}",
                points=-500 - i,
                order_index=len(images) + i
            )
        
        # Win matrix oluştur
        total_images = tournament.images.count()
        win_matrix = [[0 for _ in range(total_images)] for _ in range(total_images)]
        tournament.set_win_matrix(win_matrix)
        tournament.save()
        
        # İlk round'u başlat
        self._create_next_round_matches(tournament)
        
        return Response(
            TournamentSerializer(tournament, context={'request': request}).data,
            status=status.HTTP_200_OK
        )
    
    def _create_next_round_matches(self, tournament):
        images = list(tournament.images.all())
        
        # Tur-puan kombinasyonuna göre grupla
        grouped = {}
        for image in images:
            key = f"{image.rounds_played}-{image.points}"
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(image)
        
        match_index = 0
        for group in grouped.values():
            for i in range(0, len(group), 2):
                if i + 1 < len(group):
                    # Çift sayıda resim, maç oluştur
                    Match.objects.create(
                        tournament=tournament,
                        image1=group[i],
                        image2=group[i + 1],
                        round_number=tournament.current_round,
                        match_index=match_index
                    )
                    match_index += 1
                else:
                    # Tek resim kaldı, bye ver
                    image = group[i]
                    image.rounds_played += 1
                    image.save()

# ... (Diğer importlar ve view'ler aynı) ...

class SubmitMatchResultView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [TournamentMatchThrottle]  # Sadece maç sonuçları için özel throttle
    
    def post(self, request, match_id):
        tournament = get_object_or_404(Tournament, user=request.user, is_active=True)
        match = get_object_or_404(Match, id=match_id, tournament=tournament)
        
        winner_id = request.data.get('winner_id')
        if not winner_id:
            return Response(
                {"error": "winner_id gerekli."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        winner = get_object_or_404(TournamentImage, id=winner_id)
        if winner not in [match.image1, match.image2]:
            return Response(
                {"error": "Geçersiz kazanan."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        loser = match.image2 if winner == match.image1 else match.image1
        
        # Maç sonucunu kaydet
        match.winner = winner
        match.save()
        
        # Puanları güncelle
        winner.points += 1
        winner.rounds_played += 1
        winner.save()
        
        loser.points -= 1
        loser.rounds_played += 1
        loser.save()
        
        # Win matrix'i güncelle
        self._update_win_matrix(tournament, winner, loser)
        
        # Sonraki maça geç veya round bitir
        tournament.current_match_index += 1
        current_round_matches = tournament.matches.filter(round_number=tournament.current_round)
        
        if tournament.current_match_index >= current_round_matches.count():
            # Round bitti, sonraki round'a geç
            tournament.current_round += 1
            tournament.current_match_index = 0
            tournament.save()
            
            # Sonraki round maçlarını oluştur
            self._create_next_round_matches(tournament)
        else:
            tournament.save()
        
        return Response(
            TournamentSerializer(tournament, context={'request': request}).data,
            status=status.HTTP_200_OK
        )
    
    def _update_win_matrix(self, tournament, winner, loser):
        images = list(tournament.images.all())
        try:
            winner_idx = next(i for i, img in enumerate(images) if img.id == winner.id)
            loser_idx = next(i for i, img in enumerate(images) if img.id == loser.id)
        except StopIteration:
            return

        matrix = tournament.get_win_matrix()
        if winner_idx < len(matrix) and loser_idx < len(matrix[winner_idx]):
            matrix[winner_idx][loser_idx] = 1
            
            # Transitive closure with Floyd-Warshall
            n = len(matrix)
            for k in range(n):
                for i in range(n):
                    if matrix[i][k]:
                        for j in range(n):
                            if matrix[k][j]:
                                matrix[i][j] = 1
            
            tournament.set_win_matrix(matrix)
            tournament.save()
    
    def _create_next_round_matches(self, tournament):
        if tournament.is_completed:
            return

        # Get non-empty images
        images = list(tournament.images.all())
        real_images = [img for img in images if not img.name.startswith('BOŞ_')]
        
        # Group by (rounds_played, points)
        grouped = {}
        for image in real_images:
            key = (image.rounds_played, image.points)
            grouped.setdefault(key, []).append(image)
        
        # Check end condition: no group has at least 2 players
        if not any(len(group) >= 2 for group in grouped.values()):
            tournament.is_completed = True
            tournament.save()
            
            # 🆕 TURNUVA TAMAMLANDIĞINDA ML VERİ SETİNE DAHİL ET
            self._collect_tournament_data_for_ml(tournament)
            return

        updates = []  # (image, point_delta, round_delta)
        new_matches = []  # (image1, image2)
        
        # Process each group
        for (rounds, points), group in grouped.items():
            group.sort(key=lambda img: img.id)
            i = 0
            while i < len(group):
                if i + 1 < len(group):
                    img1 = group[i]
                    img2 = group[i+1]
                    
                    # Check transitive closure
                    winner_id = self._get_previous_winner(tournament, img1, img2)
                    if winner_id is not None:
                        # Automatic result
                        winner = img1 if winner_id == img1.id else img2
                        loser = img2 if winner == img1 else img1
                        updates.append((winner, 1, 1))
                        updates.append((loser, -1, 1))
                    else:
                        # Manual match needed
                        new_matches.append((img1, img2))
                    i += 2
                else:
                    # Bye for single player
                    updates.append((group[i], 0, 1))
                    i += 1
        
        # Apply updates
        for image, point_delta, round_delta in updates:
            image.points += point_delta
            image.rounds_played += round_delta
            image.save()
        
        # Create new matches
        match_objects = []
        for idx, (img1, img2) in enumerate(new_matches):
            match_objects.append(Match(
                tournament=tournament,
                image1=img1,
                image2=img2,
                round_number=tournament.current_round,
                match_index=idx
            ))
        
        if match_objects:
            Match.objects.bulk_create(match_objects)
        
        # If no manual matches, proceed to next round recursively
        if not new_matches:
            tournament.current_round += 1
            tournament.current_match_index = 0
            tournament.save()
            self._create_next_round_matches(tournament)
    
    def _get_previous_winner(self, tournament, image1, image2):
        matrix = tournament.get_win_matrix()
        images = list(tournament.images.all())
        
        try:
            idx1 = next(i for i, img in enumerate(images) if img.id == image1.id)
            idx2 = next(i for i, img in enumerate(images) if img.id == image2.id)
            
            if matrix[idx1][idx2] == 1:
                return image1.id
            elif matrix[idx2][idx1] == 1:
                return image2.id
        except (StopIteration, IndexError):
            pass
        return None
    
    def _collect_tournament_data_for_ml(self, tournament):
        """
        🆕 Turnuva tamamlandığında ML veri setine dahil et
        """
        try:
            # Gerçek resim sayısını hesapla (BOŞ olmayan)
            real_images = tournament.images.filter(
                name__isnull=False
            ).exclude(name__startswith='BOŞ_')
            n_images = real_images.count()
            
            # Toplam maç sayısını hesapla
            total_matches = tournament.matches.count()
            
            # Veri kaydı oluştur
            tournament_data = {
                'n_images': n_images,
                'total_matches': total_matches,
                'tournament_id': tournament.id,
                'simulation_id': f"user_{tournament.user.id}_{tournament.id}",
                'real_images': n_images,
                'total_images_after_padding': tournament.images.count(),
                'rounds_played': tournament.current_round,
                'is_completed': tournament.is_completed,
                'category': tournament.category,
                'user_id': tournament.user.id,
                'created_at': tournament.created_at.isoformat(),
                'completed_at': tournament.updated_at.isoformat(),
                'is_user_tournament': True  # Kullanıcı turnuvası olduğunu belirt
            }
            
            # ML veri setini güncelle
            self._update_ml_dataset(tournament_data)
            
            print(f"✅ Turnuva verisi ML setine eklendi: {n_images} resim, {total_matches} maç")
            
        except Exception as e:
            print(f"❌ ML veri toplama hatası: {str(e)}")
    
    def _update_ml_dataset(self, tournament_data):
        """
        ML veri setini güncelle
        """
        try:
            dataset_path = "ml/data/tournament_dataset_v1.json"
            
            # Mevcut veri setini oku
            if os.path.exists(dataset_path):
                with open(dataset_path, 'r', encoding='utf-8') as f:
                    dataset = json.load(f)
            else:
                dataset = []
            
            # Yeni veriyi ekle
            dataset.append(tournament_data)
            
            # Veri setini kaydet
            with open(dataset_path, 'w', encoding='utf-8') as f:
                json.dump(dataset, f, indent=2, ensure_ascii=False)
            
            print(f"📊 ML veri seti güncellendi. Toplam kayıt: {len(dataset)}")
            
        except Exception as e:
            print(f"❌ Veri seti güncelleme hatası: {str(e)}")

# ... (Diğer view'ler aynı) ...
    
    def _get_previous_winner(self, tournament, image1, image2):
        matrix = tournament.get_win_matrix()
        images = list(tournament.images.all())
        
        try:
            idx1 = next(i for i, img in enumerate(images) if img.id == image1.id)
            idx2 = next(i for i, img in enumerate(images) if img.id == image2.id)
            
            if matrix[idx1][idx2] == 1:
                return image1.id
            elif matrix[idx2][idx1] == 1:
                return image2.id
            return None
        except:
            return None

class GetCurrentMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [TournamentSustainedThrottle]  # Mevcut maç sorgulama için sustained throttle
    
    def get(self, request):
        try:
            tournament = get_object_or_404(Tournament, user=request.user, is_active=True)
            
            if tournament.is_completed:
                return Response({"completed": True})
            
            current_matches = tournament.matches.filter(
                round_number=tournament.current_round
            ).order_by('match_index')
            
            if not current_matches.exists():
                return Response({"no_match": True})
            
            if tournament.current_match_index >= current_matches.count():
                return Response({"no_match": True})
            
            current_match = current_matches[tournament.current_match_index]
            
            return Response({
                'id': current_match.id,
                'image1': TournamentImageSerializer(current_match.image1, context={'request': request}).data,
                'image2': TournamentImageSerializer(current_match.image2, context={'request': request}).data,
                'round_number': current_match.round_number,
                'match_index': current_match.match_index
            })
        except Tournament.DoesNotExist:
            return Response({"error": "Aktif turnuva bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

class PublicTournamentsListView(generics.ListAPIView):
    """Public turnuvaları listele"""
    serializer_class = PublicTournamentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        try:
            # Get category filter from query params
            category = request.query_params.get('category')
            
            # Try to get from cache first
            cache_key = tournament_cache.get_public_tournaments_key(category)
            cached_data = tournament_cache.cache_manager.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # If not in cache, get from database and cache it
            response = super().list(request, *args, **kwargs)
            tournament_cache.cache_manager.set(cache_key, response.data, timeout=900)  # 15 minutes
            
            return response
        except Exception as e:
            log_error(e, {'user_id': request.user.id, 'action': 'public_tournaments_list'})
            raise
    
    def get_queryset(self):
        queryset = Tournament.objects.filter(
            is_public=True,
            is_completed=True
        )
        

        
        # Kategori filtresi
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Arama filtresi
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # Sıralama
        sort_by = self.request.query_params.get('sort', 'popularity')
        if sort_by == 'date':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'category':
            queryset = queryset.order_by('category', '-play_count')
        else:  # popularity (default)
            queryset = queryset.order_by('-play_count', '-created_at')
        
        return queryset

class MakeTournamentPublicView(APIView):
    """Turnuvayı public yap"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        tournament = get_object_or_404(Tournament, user=request.user, is_active=True)
        
        if not tournament.is_completed:
            return Response(
                {"error": "Sadece tamamlanan turnuvalar public yapılabilir."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        new_name = request.data.get('name', tournament.name)
        tournament.name = new_name
        # Kategori bilgisini koru - sadece name değiştir
        tournament.is_public = True
        tournament.save()
        
        return Response(
            {"message": "Turnuva başarıyla public yapıldı."},
            status=status.HTTP_200_OK
        )

class CreateTournamentFromPublicView(APIView):
    """Public turnuvadan kendi turnuvamı oluştur"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, tournament_id):
        # Kaynak turnuvayı bul
        source_tournament = get_object_or_404(Tournament, id=tournament_id, is_public=True)
        
        # Mevcut aktif turnuvayı kapat
        Tournament.objects.filter(user=request.user, is_active=True).update(is_active=False)
        
        # Yeni turnuva oluştur
        new_tournament = Tournament.objects.create(
            user=request.user,
            name=source_tournament.name,
            category=source_tournament.category,  # Kategori bilgisini kopyala
            is_from_public=True
        )
        
        # Resimleri kopyala (BOŞ olmayan)
        source_images = source_tournament.images.filter(
            name__isnull=False
        ).exclude(name__startswith='BOŞ_')
        
        for idx, source_image in enumerate(source_images):
            TournamentImage.objects.create(
                tournament=new_tournament,
                image=source_image.image,  # Aynı dosyayı referans et
                name=source_image.name,
                original_filename=source_image.original_filename,
                order_index=idx
            )
        
        # Kaynak turnuvanın oynanma sayısını artır
        source_tournament.play_count += 1
        source_tournament.save()
        
        # Turnuvayı otomatik olarak başlat
        self._start_tournament_automatically(new_tournament)
        
        return Response(
            TournamentSerializer(new_tournament, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
    
    def _start_tournament_automatically(self, tournament):
        """Turnuvayı otomatik olarak başlat"""
        images = list(tournament.images.all())
        if len(images) < 2:
            return  # En az 2 resim gerekli
        
        # BOŞ resimler ekle (2'nin kuvvetine tamamla)
        image_count = len(images)
        next_power_of_2 = 2 ** math.ceil(math.log2(image_count))
        empty_slots = next_power_of_2 - image_count
        
        for i in range(empty_slots):
            TournamentImage.objects.create(
                tournament=tournament,
                name=f"BOŞ_{i}",
                original_filename=f"empty_{i}",
                points=-500 - i,
                order_index=len(images) + i
            )
        
        # Win matrix oluştur
        total_images = tournament.images.count()
        win_matrix = [[0 for _ in range(total_images)] for _ in range(total_images)]
        tournament.set_win_matrix(win_matrix)
        tournament.save()
        
        # İlk round'u başlat
        self._create_next_round_matches(tournament)
    
    def _create_next_round_matches(self, tournament):
        """İlk round maçlarını oluştur"""
        images = list(tournament.images.all())
        
        # Tur-puan kombinasyonuna göre grupla
        grouped = {}
        for image in images:
            key = f"{image.rounds_played}-{image.points}"
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(image)
        
        match_index = 0
        for group in grouped.values():
            for i in range(0, len(group), 2):
                if i + 1 < len(group):
                    # Çift sayıda resim, maç oluştur
                    Match.objects.create(
                        tournament=tournament,
                        image1=group[i],
                        image2=group[i + 1],
                        round_number=tournament.current_round,
                        match_index=match_index
                    )
                    match_index += 1
                else:
                    # Tek resim kaldı, bye ver
                    image = group[i]
                    image.rounds_played += 1
                    image.save()

class DeleteTournamentView(APIView):
    """Turnuvayı sil (public yapmak istemeyenler için)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        tournament = get_object_or_404(Tournament, user=request.user, is_active=True)
        
        if not tournament.is_completed:
            return Response(
                {"error": "Sadece tamamlanan turnuvalar silinebilir."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tournament.delete()
        
        return Response(
            {"message": "Turnuva başarıyla silindi."},
            status=status.HTTP_200_OK
        )

class DebugTournamentView(APIView):
    """Debug: Turnuva bilgilerini göster"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        tournaments = Tournament.objects.filter(user=request.user).order_by('-created_at')
        debug_data = []
        
        for tournament in tournaments:
            debug_data.append({
                'id': tournament.id,
                'name': tournament.name,
                'category': tournament.category,
                'category_display': tournament.get_category_display(),
                'is_public': tournament.is_public,
                'is_completed': tournament.is_completed,
                'is_active': tournament.is_active,
                'created_at': tournament.created_at.isoformat(),
            })
        
        return Response(debug_data, status=status.HTTP_200_OK)
