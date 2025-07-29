"""
ML Module URLs
"""

from django.urls import path
from .views import (
    CategoriesView, PredictMatchesView, PredictMatchesWithSourceView,
    ModelStatusView, DatasetInfoView,
    UserTournamentStatsView, DatasetComparisonView, ModelAccuracyView
)

urlpatterns = [
    path('categories/', CategoriesView.as_view(), name='ml-categories'),
    path('predict-matches/', PredictMatchesView.as_view(), name='ml-predict-matches'),
    path('predict-matches-with-source/', PredictMatchesWithSourceView.as_view(), name='ml-predict-matches-with-source'),

    path('model-status/', ModelStatusView.as_view(), name='ml-model-status'),
    path('dataset-info/', DatasetInfoView.as_view(), name='ml-dataset-info'),
    
    # 🆕 Yeni kullanıcı veri analizi endpoint'leri
    path('user-tournament-stats/', UserTournamentStatsView.as_view(), name='ml-user-tournament-stats'),
    path('dataset-comparison/', DatasetComparisonView.as_view(), name='ml-dataset-comparison'),
    path('model-accuracy/', ModelAccuracyView.as_view(), name='ml-model-accuracy'),
] 