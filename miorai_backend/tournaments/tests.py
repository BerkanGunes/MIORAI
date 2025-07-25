from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from knox.models import AuthToken
from .models import Tournament, TournamentImage, Match
import json
import os

User = get_user_model()

class TournamentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword123'
        )
        self.tournament = Tournament.objects.create(
            user=self.user,
            name='Test Tournament'
        )

    def test_tournament_creation(self):
        """Test turnuva oluşturma"""
        self.assertEqual(self.tournament.user, self.user)
        self.assertEqual(self.tournament.name, 'Test Tournament')
        self.assertTrue(self.tournament.is_active)
        self.assertFalse(self.tournament.is_completed)

    def test_tournament_str_representation(self):
        """Test turnuva string temsili"""
        self.assertEqual(str(self.tournament), f"{self.user.email} - Test Tournament")

    def test_win_matrix_operations(self):
        """Test win matrix işlemleri"""
        matrix = [[0, 1], [0, 0]]
        self.tournament.set_win_matrix(matrix)
        self.tournament.save()
        
        retrieved_matrix = self.tournament.get_win_matrix()
        self.assertEqual(retrieved_matrix, matrix)

class TournamentImageModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword123'
        )
        self.tournament = Tournament.objects.create(
            user=self.user,
            name='Test Tournament'
        )

    def test_image_creation(self):
        """Test resim oluşturma"""
        image = TournamentImage.objects.create(
            tournament=self.tournament,
            name='Test Image',
            original_filename='test.jpg',
            order_index=0
        )
        self.assertEqual(image.tournament, self.tournament)
        self.assertEqual(image.name, 'Test Image')
        self.assertEqual(image.points, 0)

class MatchModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword123'
        )
        self.tournament = Tournament.objects.create(
            user=self.user,
            name='Test Tournament'
        )
        self.image1 = TournamentImage.objects.create(
            tournament=self.tournament,
            name='Image 1',
            original_filename='image1.jpg'
        )
        self.image2 = TournamentImage.objects.create(
            tournament=self.tournament,
            name='Image 2',
            original_filename='image2.jpg'
        )

    def test_match_creation(self):
        """Test maç oluşturma"""
        match = Match.objects.create(
            tournament=self.tournament,
            image1=self.image1,
            image2=self.image2,
            round_number=1,
            match_index=0
        )
        self.assertEqual(match.tournament, self.tournament)
        self.assertEqual(match.image1, self.image1)
        self.assertEqual(match.image2, self.image2)
        self.assertIsNone(match.winner)

    def test_match_with_winner(self):
        """Test kazananı olan maç"""
        match = Match.objects.create(
            tournament=self.tournament,
            image1=self.image1,
            image2=self.image2,
            round_number=1,
            match_index=0,
            winner=self.image1
        )
        self.assertEqual(match.winner, self.image1)

class TournamentAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword123'
        )
        self.token = AuthToken.objects.create(self.user)[1]
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')
        
        self.create_tournament_url = reverse('tournament-create')
        self.tournament_detail_url = reverse('tournament-detail')
        self.upload_image_url = reverse('upload-image')
        self.start_tournament_url = reverse('start-tournament')

    def test_create_tournament(self):
        """Test turnuva oluşturma"""
        data = {'name': 'Test Tournament', 'category': 'general'}
        response = self.client.post(self.create_tournament_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Test Tournament')
        self.assertEqual(response.data['category'], 'general')

    def test_get_tournament_detail(self):
        """Test turnuva detaylarını alma"""
        tournament = Tournament.objects.create(
            user=self.user,
            name='Test Tournament',
            category='general'
        )
        response = self.client.get(self.tournament_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Tournament')

    def test_upload_image(self):
        """Test resim yükleme"""
        # Önce turnuva oluştur
        tournament_data = {'name': 'Test Tournament', 'category': 'general'}
        tournament_response = self.client.post(self.create_tournament_url, tournament_data)
        self.assertEqual(tournament_response.status_code, status.HTTP_201_CREATED)
        
        # Test resim dosyası oluştur (gerçek JPEG header'ı ile)
        image_content = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
        image_file = SimpleUploadedFile(
            'test.jpg',
            image_content,
            content_type='image/jpeg'
        )
        
        data = {
            'image': image_file,
            'name': 'Test Image'
        }
        response = self.client.post(self.upload_image_url, data, format='multipart')
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Response status: {response.status_code}")
            print(f"Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Test Image')

    def test_start_tournament(self):
        """Test turnuva başlatma"""
        tournament = Tournament.objects.create(
            user=self.user,
            name='Test Tournament',
            category='general'
        )
        
        # En az 2 resim ekle
        for i in range(2):
            TournamentImage.objects.create(
                tournament=tournament,
                name=f'Image {i+1}',
                original_filename=f'image{i+1}.jpg'
            )
        
        response = self.client.post(self.start_tournament_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Turnuvanın başladığını kontrol et
        tournament.refresh_from_db()
        self.assertTrue(tournament.matches.exists())

    def test_start_tournament_insufficient_images(self):
        """Test yetersiz resim ile turnuva başlatma"""
        tournament = Tournament.objects.create(
            user=self.user,
            name='Test Tournament',
            category='general'
        )
        
        # Sadece 1 resim ekle
        TournamentImage.objects.create(
            tournament=tournament,
            name='Image 1',
            original_filename='image1.jpg'
        )
        
        response = self.client.post(self.start_tournament_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class MatchAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword123'
        )
        self.token = AuthToken.objects.create(self.user)[1]
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')
        
        self.tournament = Tournament.objects.create(
            user=self.user,
            name='Test Tournament',
            category='general'
        )
        
        # Test resimleri oluştur
        self.image1 = TournamentImage.objects.create(
            tournament=self.tournament,
            name='Image 1',
            original_filename='image1.jpg'
        )
        self.image2 = TournamentImage.objects.create(
            tournament=self.tournament,
            name='Image 2',
            original_filename='image2.jpg'
        )
        
        self.match = Match.objects.create(
            tournament=self.tournament,
            image1=self.image1,
            image2=self.image2,
            round_number=1,
            match_index=0
        )
        
        self.submit_result_url = reverse('submit-result', kwargs={'match_id': self.match.id})
        self.current_match_url = reverse('current-match')

    def test_submit_match_result(self):
        """Test maç sonucu gönderme"""
        data = {'winner_id': self.image1.id}
        response = self.client.post(self.submit_result_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Maç sonucunun kaydedildiğini kontrol et
        self.match.refresh_from_db()
        self.assertEqual(self.match.winner, self.image1)
        
        # Puanların güncellendiğini kontrol et
        self.image1.refresh_from_db()
        self.image2.refresh_from_db()
        self.assertEqual(self.image1.points, 1)
        self.assertEqual(self.image2.points, -1)

    def test_submit_invalid_winner(self):
        """Test geçersiz kazanan ile maç sonucu gönderme"""
        # Başka bir resim oluştur
        other_image = TournamentImage.objects.create(
            tournament=self.tournament,
            name='Other Image',
            original_filename='other.jpg'
        )
        
        data = {'winner_id': other_image.id}
        response = self.client.post(self.submit_result_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_current_match(self):
        """Test mevcut maçı alma"""
        response = self.client.get(self.current_match_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.match.id)

class UnauthorizedAccessTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword123'
        )
        self.tournament = Tournament.objects.create(
            user=self.user,
            name='Test Tournament',
            category='general'
        )

    def test_unauthorized_tournament_access(self):
        """Test yetkisiz turnuva erişimi"""
        # Token olmadan istek yap
        response = self.client.get(reverse('tournament-detail'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthorized_image_upload(self):
        """Test yetkisiz resim yükleme"""
        image_file = SimpleUploadedFile(
            'test.jpg',
            b'fake-image-content',
            content_type='image/jpeg'
        )
        data = {
            'image': image_file,
            'name': 'Test Image'
        }
        response = self.client.post(reverse('upload-image'), data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
