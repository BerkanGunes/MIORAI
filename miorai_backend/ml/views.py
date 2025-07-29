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
    CategorySerializer, MatchPredictionSerializer
)
from .match_predictor import MatchPredictor
import os
import json

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

class PredictMatchesWithSourceView(APIView):
    """Eşleşme sayısı tahmini endpoint'i - Kaynak analizi ile"""
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
            
            # Kaynak analizi ile tahmin yap
            prediction = predictor.predict_matches_with_source_analysis(n_images)
            
            if 'error' in prediction:
                return Response(
                    {"error": prediction['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(prediction)
            
        except Exception as e:
            return Response(
                {"error": f"Tahmin hatası: {str(e)}"},
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

class UserTournamentStatsView(APIView):
    """Kullanıcı turnuva istatistikleri endpoint'i"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            predictor = MatchPredictor()
            
            # Veri setini yükle
            dataset = predictor.load_dataset()
            
            # Kullanıcı turnuvalarını filtrele
            user_tournaments = [
                record for record in dataset 
                if record.get('is_user_tournament', False)
            ]
            
            # Genel istatistikler
            total_user_tournaments = len(user_tournaments)
            total_simulated_tournaments = len(dataset) - total_user_tournaments
            
            # Kategori bazlı istatistikler
            category_stats = {}
            for record in user_tournaments:
                category = record.get('category', 'general')
                if category not in category_stats:
                    category_stats[category] = {
                        'count': 0,
                        'total_matches': 0,
                        'avg_matches': 0
                    }
                category_stats[category]['count'] += 1
                category_stats[category]['total_matches'] += record.get('total_matches', 0)
            
            # Ortalama maç sayılarını hesapla
            for category in category_stats:
                count = category_stats[category]['count']
                total = category_stats[category]['total_matches']
                category_stats[category]['avg_matches'] = total / count if count > 0 else 0
            
            # Resim sayısı bazlı istatistikler
            n_stats = {}
            for record in user_tournaments:
                n = record.get('n_images', 0)
                if n not in n_stats:
                    n_stats[n] = {
                        'count': 0,
                        'total_matches': 0,
                        'avg_matches': 0
                    }
                n_stats[n]['count'] += 1
                n_stats[n]['total_matches'] += record.get('total_matches', 0)
            
            # Ortalama maç sayılarını hesapla
            for n in n_stats:
                count = n_stats[n]['count']
                total = n_stats[n]['total_matches']
                n_stats[n]['avg_matches'] = total / count if count > 0 else 0
            
            result = {
                'total_user_tournaments': total_user_tournaments,
                'total_simulated_tournaments': total_simulated_tournaments,
                'total_tournaments': len(dataset),
                'category_statistics': category_stats,
                'n_statistics': n_stats,
                'message': f'{total_user_tournaments} kullanıcı turnuvası analiz edildi'
            }
            
            return Response(result)
            
        except Exception as e:
            return Response(
                {"error": f"İstatistik hatası: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DatasetComparisonView(APIView):
    """Simülasyon vs Kullanıcı verileri karşılaştırması"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            predictor = MatchPredictor()
            
            # Veri setini yükle
            dataset = predictor.load_dataset()
            
            # Verileri ayır
            simulated_data = [
                record for record in dataset 
                if not record.get('is_user_tournament', False)
            ]
            
            user_data = [
                record for record in dataset 
                if record.get('is_user_tournament', False)
            ]
            
            # Karşılaştırma analizi
            comparison = {}
            
            # Her N değeri için karşılaştırma
            all_n_values = set()
            for record in dataset:
                all_n_values.add(record.get('n_images', 0))
            
            for n in sorted(all_n_values):
                simulated_n = [r for r in simulated_data if r.get('n_images') == n]
                user_n = [r for r in user_data if r.get('n_images') == n]
                
                if simulated_n and user_n:
                    sim_avg = sum(r.get('total_matches', 0) for r in simulated_n) / len(simulated_n)
                    user_avg = sum(r.get('total_matches', 0) for r in user_n) / len(user_n)
                    
                    comparison[n] = {
                        'simulated_avg': round(sim_avg, 2),
                        'user_avg': round(user_avg, 2),
                        'difference': round(abs(sim_avg - user_avg), 2),
                        'simulated_count': len(simulated_n),
                        'user_count': len(user_n)
                    }
            
            result = {
                'comparison': comparison,
                'summary': {
                    'total_simulated': len(simulated_data),
                    'total_user': len(user_data),
                    'overlapping_n_values': len(comparison)
                }
            }
            
            return Response(result)
            
        except Exception as e:
            return Response(
                {"error": f"Karşılaştırma hatası: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ModelAccuracyView(APIView):
    """Model doğruluğu analizi (kullanıcı verileri vs tahminler)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            predictor = MatchPredictor()
            
            # Veri setini yükle
            dataset = predictor.load_dataset()
            
            # Kullanıcı turnuvalarını filtrele
            user_tournaments = [
                record for record in dataset 
                if record.get('is_user_tournament', False)
            ]
            
            accuracy_data = []
            total_error = 0
            total_predictions = 0
            
            for record in user_tournaments:
                n_images = record.get('n_images', 0)
                actual_matches = record.get('total_matches', 0)
                
                if n_images >= 2:
                    # Tahmin yap
                    prediction = predictor.predict_matches(n_images)
                    
                    if 'prediction' in prediction and prediction['prediction']:
                        predicted_matches = prediction['prediction'].get('estimated_matches', 0)
                        
                        # Hata hesapla
                        error = abs(predicted_matches - actual_matches)
                        percentage_error = (error / actual_matches * 100) if actual_matches > 0 else 0
                        
                        accuracy_data.append({
                            'n_images': n_images,
                            'actual_matches': actual_matches,
                            'predicted_matches': round(predicted_matches, 2),
                            'error': round(error, 2),
                            'percentage_error': round(percentage_error, 2),
                            'tournament_id': record.get('tournament_id')
                        })
                        
                        total_error += error
                        total_predictions += 1
            
            # Genel doğruluk istatistikleri
            avg_error = total_error / total_predictions if total_predictions > 0 else 0
            avg_percentage_error = sum(r['percentage_error'] for r in accuracy_data) / len(accuracy_data) if accuracy_data else 0
            
            result = {
                'accuracy_data': accuracy_data,
                'summary': {
                    'total_predictions': total_predictions,
                    'average_error': round(avg_error, 2),
                    'average_percentage_error': round(avg_percentage_error, 2),
                    'accuracy_score': round(max(0, 100 - avg_percentage_error), 2)
                }
            }
            
            return Response(result)
            
        except Exception as e:
            return Response(
                {"error": f"Doğruluk analizi hatası: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 