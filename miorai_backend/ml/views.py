"""
ML API Views - Güven Aralığı Yaklaşımı
Bu modül, ML tahmin sistemi için API endpoint'leri sağlar.
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from tournaments.models import Tournament, CATEGORY_CHOICES
from tournaments.serializers import (
    CategorySerializer, MatchPredictionSerializer, 
    SimilarityAnalysisSerializer
)
from .match_predictor import MatchPredictor
import os

class CategoriesView(APIView):
    """Kategori listesi endpoint'i"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        categories = [
            {'value': choice[0], 'label': choice[1]} 
            for choice in CATEGORY_CHOICES
        ]
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

class PredictMatchesView(APIView):
    """Eşleşme sayısı tahmini endpoint'i - Güven aralığı yaklaşımı"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            n_images = request.data.get('n_images')
            
            if not n_images or not isinstance(n_images, int) or n_images < 2:
                return Response(
                    {"error": "Geçersiz bir resim sayısı gerekli (minimum 2)"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Güven aralığı tahmin modelini kullan
            predictor = MatchPredictor()
            
            # Tahmin yap
            prediction = predictor.predict_matches(n_images)
            
            if 'error' in prediction:
                return Response(
                    {"error": prediction['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = MatchPredictionSerializer(prediction)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {"error": f"Tahmin hatası: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SimilarityAnalysisView(APIView):
    """Resim benzerlik analizi endpoint'i"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Bu endpoint şimdilik basit bir analiz döndürüyor
            # Gerçek implementasyon için resim işleme kütüphaneleri gerekli
            
            result = {
                'analysis_type': 'similarity',
                'status': 'not_implemented',
                'message': 'Resim benzerlik analizi henüz implement edilmemiş'
            }
            
            serializer = SimilarityAnalysisSerializer(result)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {"error": f"Analiz hatası: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ModelStatusView(APIView):
    """ML model durumu endpoint'i"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            predictor = MatchPredictor()
            
            # Veri seti özeti
            summary = predictor.get_dataset_summary()
            
            # Mevcut resim sayıları
            available_n_values = predictor.get_available_n_values()
            
            result = {
                'model_type': 'confidence_interval',
                'status': 'ready',
                'dataset_summary': summary,
                'available_n_values': available_n_values,
                'confidence_level': '95%',
                'message': 'Güven aralığı tabanlı tahmin modeli hazır'
            }
            
            return Response(result)
            
        except Exception as e:
            return Response(
                {"error": f"Model durumu hatası: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DatasetInfoView(APIView):
    """Veri seti bilgileri endpoint'i"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            predictor = MatchPredictor()
            
            # Veri seti özeti
            summary = predictor.get_dataset_summary()
            
            # Her N değeri için örnek sayısı
            n_counts = {}
            for n in summary['available_n_values']:
                matches_data = predictor.get_matches_for_n_images(n)
                n_counts[n] = len(matches_data)
            
            result = {
                'dataset_info': summary,
                'sample_counts': n_counts,
                'total_samples': sum(n_counts.values())
            }
            
            return Response(result)
            
        except Exception as e:
            return Response(
                {"error": f"Veri seti bilgisi hatası: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 