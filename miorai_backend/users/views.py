from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from knox.models import AuthToken
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
import jwt
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    ChangePasswordSerializer, ResetPasswordEmailSerializer,
    ResetPasswordConfirmSerializer
)
from .models import User
# from ratelimit.decorators import ratelimit  # Geçici olarak kapatıldı

class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    # @ratelimit(key='ip', rate='5/m', block=True)  # Geçici olarak kapatıldı
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Email doğrulama token'ı oluştur
        token = jwt.encode(
            {
                'user_id': user.id,
                'exp': timezone.now() + timedelta(days=1)
            },
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        
        # Doğrulama emaili gönder (güvenli)
        try:
            verification_url = f"http://localhost:3000/verify-email?token={token}"
            send_mail(
                'Email Adresinizi Doğrulayın',
                f'Email adresinizi doğrulamak için aşağıdaki linke tıklayın:\n\n{verification_url}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,  # Hata durumunda sessizce devam et
            )
            print(f"Email doğrulama gönderildi: {user.email}")
        except Exception as e:
            print(f"Email gönderme hatası: {str(e)}")
            # Email gönderilemese bile kullanıcı kaydı tamamlanır
        
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": AuthToken.objects.create(user)[1]
        })

class LoginAPI(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer

    # @ratelimit(key='ip', rate='5/m', block=True)  # Geçici olarak kapatıldı
    def post(self, request, format=None):
        try:
            serializer = self.serializer_class(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            
            # Token oluştur
            token = AuthToken.objects.create(user)[1]
            
            # Kullanıcı bilgilerini döndür
            user_data = UserSerializer(user).data
            return Response({
                "user": user_data,
                "token": token
            })
        except Exception as e:
            print(f"Login error: {str(e)}")  # Hata ayıklama için
            return Response(
                {"detail": "Giriş yapılırken bir hata oluştu."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LogoutAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        logout(request)
        return Response({"detail": "Başarıyla çıkış yapıldı."})

class UserAPI(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordAPI(generics.UpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ChangePasswordSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"old_password": ["Mevcut şifre yanlış."]}, 
                          status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"detail": "Şifre başarıyla değiştirildi."})

class ResetPasswordEmailAPI(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ResetPasswordEmailSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Bu email adresi ile kayıtlı kullanıcı bulunamadı."},
                          status=status.HTTP_404_NOT_FOUND)

        # Reset token oluştur
        token = jwt.encode(
            {
                'user_id': user.id,
                'exp': timezone.now() + timedelta(hours=1)
            },
            settings.SECRET_KEY,
            algorithm='HS256'
        )

        # Reset emaili gönder
        reset_url = f"http://localhost:3000/reset-password?token={token}"
        send_mail(
            'Şifre Sıfırlama',
            f'Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:\n\n{reset_url}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return Response({"detail": "Şifre sıfırlama bağlantısı email adresinize gönderildi."})

class ResetPasswordConfirmAPI(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ResetPasswordConfirmSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            payload = jwt.decode(serializer.validated_data['token'], 
                               settings.SECRET_KEY, 
                               algorithms=['HS256'])
            user = User.objects.get(id=payload['user_id'])
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            return Response({"detail": "Geçersiz veya süresi dolmuş token."},
                          status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"detail": "Şifreniz başarıyla sıfırlandı."})

class VerifyEmailAPI(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        token = request.query_params.get('token')
        if not token:
            return Response({"detail": "Token bulunamadı."},
                          status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.get(id=payload['user_id'])
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            return Response({"detail": "Geçersiz veya süresi dolmuş token."},
                          status=status.HTTP_400_BAD_REQUEST)

        user.email_verified = True
        user.save()
        return Response({"detail": "Email adresi başarıyla doğrulandı."})
