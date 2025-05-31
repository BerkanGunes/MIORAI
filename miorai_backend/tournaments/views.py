from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Tournament, TournamentImage, Match
from .serializers import (
    TournamentSerializer, TournamentCreateSerializer, 
    ImageUploadSerializer, TournamentImageSerializer
)
import json
import math

class TournamentCreateView(generics.CreateAPIView):
    serializer_class = TournamentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TournamentDetailView(generics.RetrieveAPIView):
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return get_object_or_404(Tournament, user=self.request.user, is_active=True)

class ImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        tournament = get_object_or_404(Tournament, user=request.user, is_active=True)
        
        # Turnuva başlamışsa resim yüklenemez
        if tournament.matches.exists():
            return Response(
                {"error": "Turnuva başladıktan sonra resim eklenemez."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            image = serializer.save(
                tournament=tournament,
                original_filename=request.FILES['image'].name,
                order_index=tournament.images.count()
            )
            return Response(
                TournamentImageSerializer(image, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

class StartTournamentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
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
    
    # DÜZELTME: Fonksiyon tanımından önceki girinti eklendi
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
    
    # DÜZELTME: Fonksiyon tanımından önceki girinti eklendi
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
    
    # DÜZELTME: Fonksiyon tanımından önceki girinti eklendi
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
    
    def get(self, request):
        tournament = get_object_or_404(Tournament, user=request.user, is_active=True)
        
        if tournament.is_completed:
            return Response({"completed": True})
        
        current_match = tournament.matches.filter(
            round_number=tournament.current_round,
            match_index=tournament.current_match_index,
            winner__isnull=True
        ).first()
        
        if current_match:
            from .serializers import MatchSerializer
            return Response(MatchSerializer(current_match, context={'request': request}).data)
        
        return Response({"no_match": True})
