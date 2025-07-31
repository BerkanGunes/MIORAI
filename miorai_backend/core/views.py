"""
Core API views for health checks and monitoring.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.db import connection
from .monitoring import check_system_health, system_monitor, cache_monitor, performance_monitor
from .cache import cache_manager
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Basic health check endpoint.
    Returns system status and basic connectivity information.
    """
    try:
        # Check database connectivity
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"
    
    # Check cache connectivity
    try:
        cache.set('health_check', 'ok', 10)
        cache_result = cache.get('health_check')
        cache_status = "healthy" if cache_result == 'ok' else "unhealthy"
    except Exception as e:
        logger.error(f"Cache health check failed: {e}")
        cache_status = "unhealthy"
    
    # Overall status
    overall_status = "healthy" if db_status == "healthy" and cache_status == "healthy" else "unhealthy"
    
    return Response({
        'status': overall_status,
        'database': db_status,
        'cache': cache_status,
        'timestamp': performance_monitor.metrics.get('health_check', {}).get('start', 0)
    }, status=status.HTTP_200_OK if overall_status == "healthy" else status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(['GET'])
@permission_classes([AllowAny])
def detailed_health_check(request):
    """
    Detailed health check endpoint.
    Returns comprehensive system health information.
    """
    health_data = check_system_health()
    
    status_code = status.HTTP_200_OK
    if health_data['status'] == 'unhealthy':
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    elif health_data['status'] == 'degraded':
        status_code = status.HTTP_200_OK  # Still operational but with warnings
    
    return Response(health_data, status=status_code)

@api_view(['GET'])
@permission_classes([AllowAny])
def system_stats(request):
    """
    Get current system statistics.
    Returns CPU, memory, disk usage, and other system metrics.
    """
    try:
        system_stats = system_monitor.get_system_stats()
        cache_stats = cache_monitor.get_cache_stats()
        
        return Response({
            'system': system_stats,
            'cache': cache_stats,
            'timestamp': performance_monitor.metrics.get('system_stats', {}).get('start', 0)
        })
    except Exception as e:
        logger.error(f"Error getting system stats: {e}")
        return Response({
            'error': 'Failed to retrieve system statistics',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def performance_metrics(request):
    """
    Get performance metrics for the application.
    Returns API response times, database query statistics, and cache performance.
    """
    try:
        # Get recent performance metrics
        metrics = performance_monitor.get_metrics()
        
        # Get cache hit ratio
        cache_hits = cache_monitor.get_cache_stats().get('keyspace_hits', 0)
        cache_misses = cache_monitor.get_cache_stats().get('keyspace_misses', 0)
        total_requests = cache_hits + cache_misses
        cache_hit_ratio = cache_hits / total_requests if total_requests > 0 else 0
        
        return Response({
            'performance_metrics': metrics,
            'cache_performance': {
                'hit_ratio': cache_hit_ratio,
                'hits': cache_hits,
                'misses': cache_misses,
                'total_requests': total_requests
            },
            'thresholds': {
                'api_response_time': 0.5,  # seconds
                'slow_query_threshold': 1.0,  # seconds
                'cache_hit_ratio_threshold': 0.8  # 80%
            }
        })
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        return Response({
            'error': 'Failed to retrieve performance metrics',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_metrics(request):
    """
    Reset performance metrics.
    Clears all collected performance data.
    """
    try:
        performance_monitor.reset_metrics()
        return Response({
            'message': 'Performance metrics reset successfully',
            'timestamp': performance_monitor.metrics.get('reset', {}).get('start', 0)
        })
    except Exception as e:
        logger.error(f"Error resetting metrics: {e}")
        return Response({
            'error': 'Failed to reset performance metrics',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def cache_status(request):
    """
    Get detailed cache status and statistics.
    Returns cache connectivity, memory usage, and performance metrics.
    """
    try:
        cache_stats = cache_monitor.get_cache_stats()
        
        # Test cache operations
        test_key = 'cache_status_test'
        cache.set(test_key, 'test_value', 60)
        test_result = cache.get(test_key)
        cache.delete(test_key)
        
        cache_operational = test_result == 'test_value'
        
        return Response({
            'operational': cache_operational,
            'statistics': cache_stats,
            'test_result': 'passed' if cache_operational else 'failed',
            'timestamp': performance_monitor.metrics.get('cache_status', {}).get('start', 0)
        })
    except Exception as e:
        logger.error(f"Error getting cache status: {e}")
        return Response({
            'operational': False,
            'error': 'Failed to retrieve cache status',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def clear_cache(request):
    """
    Clear all cache data.
    WARNING: This will clear all cached data and may impact performance.
    """
    try:
        # Clear all cache
        cache.clear()
        
        # Clear specific cache patterns
        cache_manager.invalidate_pattern('*')
        
        return Response({
            'message': 'Cache cleared successfully',
            'timestamp': performance_monitor.metrics.get('clear_cache', {}).get('start', 0)
        })
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        return Response({
            'error': 'Failed to clear cache',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
