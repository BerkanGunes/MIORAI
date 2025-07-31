"""
Performance monitoring and logging utilities for Miorai project.
Provides tools for tracking API performance, database queries, and system metrics.
"""

import time
import logging
from functools import wraps
from typing import Dict, Any, Optional, Callable
from django.conf import settings
from django.core.cache import cache
from django.db import connection
from django.http import HttpRequest, HttpResponse
import json
import psutil
import os

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    """Monitor and track performance metrics."""
    
    def __init__(self):
        self.metrics = {}
        self.thresholds = getattr(settings, 'PERFORMANCE_MONITORING', {})
    
    def start_timer(self, operation: str) -> float:
        """Start timing an operation."""
        start_time = time.time()
        self.metrics[operation] = {'start': start_time}
        return start_time
    
    def end_timer(self, operation: str) -> float:
        """End timing an operation and log if threshold exceeded."""
        if operation not in self.metrics:
            return 0
        
        end_time = time.time()
        duration = end_time - self.metrics[operation]['start']
        self.metrics[operation]['duration'] = duration
        self.metrics[operation]['end'] = end_time
        
        # Check thresholds
        threshold = self.thresholds.get('API_RESPONSE_TIME_THRESHOLD', 0.5)
        if duration > threshold:
            logger.warning(f"Slow operation detected: {operation} took {duration:.3f}s (threshold: {threshold}s)")
        
        return duration
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get all collected metrics."""
        return self.metrics.copy()
    
    def reset_metrics(self):
        """Reset all metrics."""
        self.metrics.clear()

class DatabaseMonitor:
    """Monitor database query performance."""
    
    def __init__(self):
        self.query_count = 0
        self.query_time = 0
        self.slow_queries = []
        self.threshold = getattr(settings, 'PERFORMANCE_MONITORING', {}).get('SLOW_QUERY_THRESHOLD', 1.0)
    
    def start_monitoring(self):
        """Start monitoring database queries."""
        self.query_count = len(connection.queries)
        self.query_time = sum(float(q['time']) for q in connection.queries)
    
    def end_monitoring(self) -> Dict[str, Any]:
        """End monitoring and return statistics."""
        final_query_count = len(connection.queries)
        final_query_time = sum(float(q['time']) for q in connection.queries)
        
        new_queries = final_query_count - self.query_count
        new_query_time = final_query_time - self.query_time
        
        # Check for slow queries
        slow_queries = [
            q for q in connection.queries[self.query_count:]
            if float(q['time']) > self.threshold
        ]
        
        if slow_queries:
            for query in slow_queries:
                logger.warning(f"Slow query detected: {query['time']}s - {query['sql'][:100]}...")
        
        return {
            'query_count': new_queries,
            'query_time': new_query_time,
            'slow_queries': len(slow_queries),
            'avg_query_time': new_query_time / new_queries if new_queries > 0 else 0
        }

class SystemMonitor:
    """Monitor system resources."""
    
    @staticmethod
    def get_system_stats() -> Dict[str, Any]:
        """Get current system statistics."""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available': memory.available,
                'memory_total': memory.total,
                'disk_percent': disk.percent,
                'disk_free': disk.free,
                'disk_total': disk.total,
                'process_memory': psutil.Process().memory_info().rss
            }
        except Exception as e:
            logger.error(f"Error getting system stats: {e}")
            return {}

class CacheMonitor:
    """Monitor cache performance."""
    
    @staticmethod
    def get_cache_stats() -> Dict[str, Any]:
        """Get cache statistics."""
        try:
            # This is a simplified version. In production, you might want to use
            # Redis INFO command for more detailed statistics
            cache_info = cache.client.info()
            
            return {
                'connected_clients': cache_info.get('connected_clients', 0),
                'used_memory': cache_info.get('used_memory', 0),
                'used_memory_peak': cache_info.get('used_memory_peak', 0),
                'keyspace_hits': cache_info.get('keyspace_hits', 0),
                'keyspace_misses': cache_info.get('keyspace_misses', 0),
                'total_commands_processed': cache_info.get('total_commands_processed', 0),
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {}

# Global monitor instances
performance_monitor = PerformanceMonitor()
db_monitor = DatabaseMonitor()
system_monitor = SystemMonitor()
cache_monitor = CacheMonitor()

# Decorators for performance monitoring
def monitor_performance(operation_name: Optional[str] = None):
    """Decorator to monitor function performance."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            op_name = operation_name or f"{func.__module__}.{func.__name__}"
            
            # Start monitoring
            performance_monitor.start_timer(op_name)
            db_monitor.start_monitoring()
            
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                # End monitoring
                duration = performance_monitor.end_timer(op_name)
                db_stats = db_monitor.end_monitoring()
                
                # Log performance data
                logger.info(f"Performance: {op_name} - Duration: {duration:.3f}s, "
                          f"DB Queries: {db_stats['query_count']}, "
                          f"DB Time: {db_stats['query_time']:.3f}s")
        
        return wrapper
    return decorator

def monitor_api_performance(view_func):
    """Decorator to monitor API view performance."""
    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs) -> HttpResponse:
        # Start monitoring
        start_time = time.time()
        db_monitor.start_monitoring()
        
        try:
            response = view_func(request, *args, **kwargs)
            return response
        finally:
            # End monitoring
            duration = time.time() - start_time
            db_stats = db_monitor.end_monitoring()
            
            # Log API performance
            logger.info(f"API Performance: {request.path} - Method: {request.method} - "
                      f"Duration: {duration:.3f}s - Status: {getattr(response, 'status_code', 'N/A')} - "
                      f"DB Queries: {db_stats['query_count']}")
            
            # Add performance headers to response
            if hasattr(response, 'headers'):
                response.headers['X-Response-Time'] = f"{duration:.3f}s"
                response.headers['X-DB-Queries'] = str(db_stats['query_count'])
    
    return wrapper

# Middleware for automatic performance monitoring
class PerformanceMonitoringMiddleware:
    """Django middleware for automatic performance monitoring."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Start monitoring
        start_time = time.time()
        db_monitor.start_monitoring()
        
        # Process request
        response = self.get_response(request)
        
        # End monitoring
        duration = time.time() - start_time
        db_stats = db_monitor.end_monitoring()
        
        # Log request performance
        logger.info(f"Request Performance: {request.path} - Method: {request.method} - "
                  f"Duration: {duration:.3f}s - Status: {response.status_code} - "
                  f"DB Queries: {db_stats['query_count']}")
        
        # Add performance headers
        response['X-Response-Time'] = f"{duration:.3f}s"
        response['X-DB-Queries'] = str(db_stats['query_count'])
        
        return response

# Utility functions for logging
def log_user_action(user_id: int, action: str, details: Dict[str, Any] = None):
    """Log user actions for analytics."""
    log_data = {
        'user_id': user_id,
        'action': action,
        'timestamp': time.time(),
        'details': details or {}
    }
    logger.info(f"User Action: {json.dumps(log_data)}")

def log_error(error: Exception, context: Dict[str, Any] = None):
    """Log errors with context."""
    error_data = {
        'error_type': type(error).__name__,
        'error_message': str(error),
        'timestamp': time.time(),
        'context': context or {}
    }
    logger.error(f"Error: {json.dumps(error_data)}")

def log_security_event(event_type: str, user_id: Optional[int] = None, details: Dict[str, Any] = None):
    """Log security-related events."""
    security_data = {
        'event_type': event_type,
        'user_id': user_id,
        'timestamp': time.time(),
        'details': details or {}
    }
    logger.warning(f"Security Event: {json.dumps(security_data)}")

# Health check functions
def check_system_health() -> Dict[str, Any]:
    """Perform comprehensive system health check."""
    health_status = {
        'status': 'healthy',
        'timestamp': time.time(),
        'checks': {}
    }
    
    # Check system resources
    try:
        system_stats = system_monitor.get_system_stats()
        health_status['checks']['system'] = {
            'status': 'healthy' if system_stats.get('cpu_percent', 0) < 90 else 'warning',
            'cpu_percent': system_stats.get('cpu_percent', 0),
            'memory_percent': system_stats.get('memory_percent', 0)
        }
    except Exception as e:
        health_status['checks']['system'] = {'status': 'error', 'error': str(e)}
    
    # Check cache connectivity
    try:
        cache.set('health_check', 'ok', 10)
        cache_result = cache.get('health_check')
        health_status['checks']['cache'] = {
            'status': 'healthy' if cache_result == 'ok' else 'error',
            'result': cache_result
        }
    except Exception as e:
        health_status['checks']['cache'] = {'status': 'error', 'error': str(e)}
    
    # Check database connectivity
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_status['checks']['database'] = {'status': 'healthy'}
    except Exception as e:
        health_status['checks']['database'] = {'status': 'error', 'error': str(e)}
    
    # Overall status
    if any(check['status'] == 'error' for check in health_status['checks'].values()):
        health_status['status'] = 'unhealthy'
    elif any(check['status'] == 'warning' for check in health_status['checks'].values()):
        health_status['status'] = 'degraded'
    
    return health_status 