from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from knox.models import AuthToken
import json

User = get_user_model()

class UserModelTest(TestCase):
    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_create_user(self):
        """Test kullanıcı oluşturma"""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data['email'])
        self.assertTrue(user.check_password(self.user_data['password']))
        self.assertFalse(user.email_verified)

    def test_create_superuser(self):
        """Test superuser oluşturma"""
        superuser = User.objects.create_superuser(**self.user_data)
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.email_verified)

    def test_user_str_representation(self):
        """Test kullanıcı string temsili"""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(str(user), self.user_data['email'])

    def test_get_full_name(self):
        """Test tam ad alma"""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.get_full_name(), 'Test User')

class AuthAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_user_registration(self):
        """Test kullanıcı kaydı"""
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], self.user_data['email'])

    def test_user_registration_invalid_data(self):
        """Test geçersiz veri ile kayıt"""
        invalid_data = {
            'email': 'invalid-email',
            'password': '123'  # Çok kısa şifre
        }
        response = self.client.post(self.register_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login(self):
        """Test kullanıcı girişi"""
        # Önce kullanıcı oluştur
        user = User.objects.create_user(**self.user_data)
        
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('token', response.data)

    def test_user_login_invalid_credentials(self):
        """Test geçersiz kimlik bilgileri ile giriş"""
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_logout(self):
        """Test kullanıcı çıkışı"""
        # Önce kullanıcı oluştur ve giriş yap
        user = User.objects.create_user(**self.user_data)
        token = AuthToken.objects.create(user)[1]
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_duplicate_email_registration(self):
        """Test aynı email ile tekrar kayıt"""
        # İlk kullanıcıyı oluştur
        response1 = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        # Aynı email ile tekrar kayıt olmaya çalış
        response2 = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)

class PasswordResetTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.reset_email_url = reverse('reset-password-email')
        self.reset_confirm_url = reverse('reset-password-confirm')
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpassword123'
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_password_reset_email(self):
        """Test şifre sıfırlama emaili gönderme"""
        data = {'email': self.user_data['email']}
        response = self.client.post(self.reset_email_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_nonexistent_email(self):
        """Test var olmayan email ile şifre sıfırlama"""
        data = {'email': 'nonexistent@example.com'}
        response = self.client.post(self.reset_email_url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
