"""
ML Module URLs
"""

from django.urls import path
from .views import (
    CategoriesView, PredictMatchesView, 
    SimilarityAnalysisView, ModelStatusView, DatasetInfoView
)

urlpatterns = [
    path('categories/', CategoriesView.as_view(), name='ml-categories'),
    path('predict-matches/', PredictMatchesView.as_view(), name='ml-predict-matches'),
    path('similarity-analysis/', SimilarityAnalysisView.as_view(), name='ml-similarity-analysis'),
    path('model-status/', ModelStatusView.as_view(), name='ml-model-status'),
    path('dataset-info/', DatasetInfoView.as_view(), name='ml-dataset-info'),
] 