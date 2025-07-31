"""
URL configuration for core app.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Health check endpoints
    path('health/', views.health_check, name='health_check'),
    path('health/detailed/', views.detailed_health_check, name='detailed_health_check'),
    
    # Monitoring endpoints
    path('monitoring/system-stats/', views.system_stats, name='system_stats'),
    path('monitoring/performance-metrics/', views.performance_metrics, name='performance_metrics'),
    path('monitoring/cache-status/', views.cache_status, name='cache_status'),
    
    # Cache management endpoints
    path('cache/clear/', views.clear_cache, name='clear_cache'),
    path('monitoring/reset-metrics/', views.reset_metrics, name='reset_metrics'),
] 