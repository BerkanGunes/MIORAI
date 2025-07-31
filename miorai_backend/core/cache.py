"""
Cache management utilities for Miorai project.
Provides helper functions for Redis cache operations.
"""

import json
import hashlib
from typing import Any, Optional, Dict, List
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.redis import RedisCache
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    """Centralized cache management for the application."""
    
    def __init__(self):
        self.default_timeout = 300  # 5 minutes
        self.ml_timeout = 3600      # 1 hour
        self.session_timeout = 86400  # 24 hours
    
    def _generate_cache_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a unique cache key."""
        key_parts = [prefix]
        
        # Add positional arguments
        for arg in args:
            key_parts.append(str(arg))
        
        # Add keyword arguments (sorted for consistency)
        for key, value in sorted(kwargs.items()):
            key_parts.append(f"{key}:{value}")
        
        # Create hash for long keys
        key_string = ":".join(key_parts)
        if len(key_string) > 250:  # Redis key length limit
            return f"{prefix}:{hashlib.md5(key_string.encode()).hexdigest()}"
        
        return key_string
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get value from cache."""
        try:
            value = cache.get(key)
            if value is not None:
                logger.debug(f"Cache HIT: {key}")
            else:
                logger.debug(f"Cache MISS: {key}")
            return value
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return default
    
    def set(self, key: str, value: Any, timeout: Optional[int] = None) -> bool:
        """Set value in cache."""
        try:
            if timeout is None:
                timeout = self.default_timeout
            
            cache.set(key, value, timeout)
            logger.debug(f"Cache SET: {key} (timeout: {timeout}s)")
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete value from cache."""
        try:
            cache.delete(key)
            logger.debug(f"Cache DELETE: {key}")
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    def get_or_set(self, key: str, default_func, timeout: Optional[int] = None) -> Any:
        """Get value from cache or set default if not exists."""
        value = self.get(key)
        if value is None:
            value = default_func()
            self.set(key, value, timeout)
        return value
    
    def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate all keys matching pattern."""
        try:
            # Note: This is a simplified version. In production, you might want to use
            # Redis SCAN command for better performance with large datasets
            keys = cache.keys(pattern)
            if keys:
                cache.delete_many(keys)
                logger.info(f"Invalidated {len(keys)} cache keys matching pattern: {pattern}")
                return len(keys)
            return 0
        except Exception as e:
            logger.error(f"Cache pattern invalidation error for {pattern}: {e}")
            return 0

# Tournament-specific cache functions
class TournamentCache:
    """Cache utilities for tournament-related operations."""
    
    def __init__(self):
        self.cache_manager = CacheManager()
        self.prefix = "tournament"
    
    def get_tournament_key(self, tournament_id: int) -> str:
        """Generate cache key for tournament data."""
        return self.cache_manager._generate_cache_key(f"{self.prefix}:data", tournament_id)
    
    def get_tournament_matches_key(self, tournament_id: int) -> str:
        """Generate cache key for tournament matches."""
        return self.cache_manager._generate_cache_key(f"{self.prefix}:matches", tournament_id)
    
    def get_public_tournaments_key(self, category: Optional[str] = None) -> str:
        """Generate cache key for public tournaments list."""
        if category:
            return self.cache_manager._generate_cache_key(f"{self.prefix}:public:category", category)
        return f"{self.prefix}:public:all"
    
    def cache_tournament_data(self, tournament_id: int, data: Dict) -> bool:
        """Cache tournament data."""
        key = self.get_tournament_key(tournament_id)
        return self.cache_manager.set(key, data, timeout=1800)  # 30 minutes
    
    def get_cached_tournament_data(self, tournament_id: int) -> Optional[Dict]:
        """Get cached tournament data."""
        key = self.get_tournament_key(tournament_id)
        return self.cache_manager.get(key)
    
    def invalidate_tournament_cache(self, tournament_id: int) -> bool:
        """Invalidate all cache entries for a tournament."""
        pattern = f"{self.prefix}:*:{tournament_id}"
        return self.cache_manager.invalidate_pattern(pattern) > 0

# ML-specific cache functions
class MLCache:
    """Cache utilities for ML-related operations."""
    
    def __init__(self):
        self.cache_manager = CacheManager()
        self.prefix = "ml"
    
    def get_prediction_key(self, n_images: int, category: Optional[str] = None) -> str:
        """Generate cache key for ML prediction."""
        if category:
            return self.cache_manager._generate_cache_key(f"{self.prefix}:prediction", n_images, category=category)
        return self.cache_manager._generate_cache_key(f"{self.prefix}:prediction", n_images)
    
    def get_model_status_key(self) -> str:
        """Generate cache key for model status."""
        return f"{self.prefix}:status"
    
    def cache_prediction(self, n_images: int, prediction: Dict, category: Optional[str] = None) -> bool:
        """Cache ML prediction result."""
        key = self.get_prediction_key(n_images, category)
        return self.cache_manager.set(key, prediction, timeout=self.cache_manager.ml_timeout)
    
    def get_cached_prediction(self, n_images: int, category: Optional[str] = None) -> Optional[Dict]:
        """Get cached ML prediction."""
        key = self.get_prediction_key(n_images, category)
        return self.cache_manager.get(key)
    
    def invalidate_ml_cache(self) -> bool:
        """Invalidate all ML-related cache entries."""
        pattern = f"{self.prefix}:*"
        return self.cache_manager.invalidate_pattern(pattern) > 0

# User-specific cache functions
class UserCache:
    """Cache utilities for user-related operations."""
    
    def __init__(self):
        self.cache_manager = CacheManager()
        self.prefix = "user"
    
    def get_user_tournaments_key(self, user_id: int) -> str:
        """Generate cache key for user tournaments."""
        return self.cache_manager._generate_cache_key(f"{self.prefix}:tournaments", user_id)
    
    def get_user_stats_key(self, user_id: int) -> str:
        """Generate cache key for user statistics."""
        return self.cache_manager._generate_cache_key(f"{self.prefix}:stats", user_id)
    
    def cache_user_tournaments(self, user_id: int, tournaments: List) -> bool:
        """Cache user tournaments list."""
        key = self.get_user_tournaments_key(user_id)
        return self.cache_manager.set(key, tournaments, timeout=900)  # 15 minutes
    
    def get_cached_user_tournaments(self, user_id: int) -> Optional[List]:
        """Get cached user tournaments."""
        key = self.get_user_tournaments_key(user_id)
        return self.cache_manager.get(key)
    
    def invalidate_user_cache(self, user_id: int) -> bool:
        """Invalidate all cache entries for a user."""
        pattern = f"{self.prefix}:*:{user_id}"
        return self.cache_manager.invalidate_pattern(pattern) > 0

# Global cache instances
cache_manager = CacheManager()
tournament_cache = TournamentCache()
ml_cache = MLCache()
user_cache = UserCache()

# Cache decorators
def cache_result(timeout: Optional[int] = None, key_prefix: str = "func"):
    """Decorator to cache function results."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Generate cache key based on function name and arguments
            cache_key = cache_manager._generate_cache_key(
                f"{key_prefix}:{func.__name__}", 
                *args, 
                **kwargs
            )
            
            # Try to get from cache first
            result = cache_manager.get(cache_key)
            if result is not None:
                return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, timeout)
            return result
        
        return wrapper
    return decorator

def invalidate_cache_pattern(pattern: str):
    """Decorator to invalidate cache after function execution."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            cache_manager.invalidate_pattern(pattern)
            return result
        return wrapper
    return decorator 