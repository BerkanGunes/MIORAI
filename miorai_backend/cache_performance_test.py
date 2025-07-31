"""
Cache performans testleri - Django cache backend ile.
"""

import time
import os
import sys
import django

# Django settings'i yapılandır
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'miorai_backend.settings')
django.setup()

from django.core.cache import cache
from django.contrib.auth import get_user_model
from tournaments.models import Tournament
import json

User = get_user_model()

def test_basic_cache_operations():
    """Temel cache operasyonları testi."""
    print("🔍 Basic Cache Operations Test")
    print("=" * 50)
    
    # Test data
    test_data = {
        'string': 'test string',
        'number': 123,
        'list': [1, 2, 3, 4, 5],
        'dict': {'key': 'value', 'nested': {'data': 'test'}},
        'boolean': True
    }
    
    try:
        # Set cache
        start_time = time.time()
        cache.set('test_basic', test_data, timeout=60)
        set_time = time.time() - start_time
        
        # Get cache
        start_time = time.time()
        cached_data = cache.get('test_basic')
        get_time = time.time() - start_time
        
        # Verify data
        if cached_data == test_data:
            print("✅ Cache set/get successful")
            print(f"⏱️  Set time: {set_time:.4f}s")
            print(f"⏱️  Get time: {get_time:.4f}s")
            
            if set_time < 0.1 and get_time < 0.1:
                print("✅ Cache operations are fast")
            else:
                print("⚠️  Cache operations are slow")
        else:
            print("❌ Cache data mismatch")
            
    except Exception as e:
        print(f"❌ Basic cache test failed: {e}")
    
    print()

def test_cache_with_large_data():
    """Büyük veri ile cache testi."""
    print("🔍 Large Data Cache Test")
    print("=" * 50)
    
    # Create large test data
    large_data = {
        'items': [{'id': i, 'name': f'item_{i}', 'data': 'x' * 100} for i in range(1000)],
        'metadata': {
            'total_items': 1000,
            'created_at': time.time(),
            'version': '1.0'
        }
    }
    
    try:
        # Set large data
        start_time = time.time()
        cache.set('large_data', large_data, timeout=60)
        set_time = time.time() - start_time
        
        # Get large data
        start_time = time.time()
        cached_large_data = cache.get('large_data')
        get_time = time.time() - start_time
        
        # Verify data
        if cached_large_data and len(cached_large_data['items']) == 1000:
            print("✅ Large data cache successful")
            print(f"⏱️  Set time: {set_time:.4f}s")
            print(f"⏱️  Get time: {get_time:.4f}s")
            
            if set_time < 1.0 and get_time < 1.0:
                print("✅ Large data cache operations are fast")
            else:
                print("⚠️  Large data cache operations are slow")
        else:
            print("❌ Large data cache failed")
            
    except Exception as e:
        print(f"❌ Large data cache test failed: {e}")
    
    print()

def test_cache_pattern_operations():
    """Cache pattern operasyonları testi."""
    print("🔍 Cache Pattern Operations Test")
    print("=" * 50)
    
    try:
        # Set multiple cache entries with pattern
        patterns = ['user:1', 'user:2', 'user:3', 'tournament:1', 'tournament:2']
        
        start_time = time.time()
        for pattern in patterns:
            cache.set(pattern, f'data_for_{pattern}', timeout=60)
        set_time = time.time() - start_time
        
        # Get multiple cache entries
        start_time = time.time()
        retrieved_data = {}
        for pattern in patterns:
            retrieved_data[pattern] = cache.get(pattern)
        get_time = time.time() - start_time
        
        # Verify all data retrieved
        success_count = sum(1 for data in retrieved_data.values() if data is not None)
        
        print(f"✅ Pattern cache operations: {success_count}/{len(patterns)} successful")
        print(f"⏱️  Set time: {set_time:.4f}s")
        print(f"⏱️  Get time: {get_time:.4f}s")
        
        if success_count == len(patterns):
            print("✅ All pattern cache operations successful")
        else:
            print("⚠️  Some pattern cache operations failed")
            
    except Exception as e:
        print(f"❌ Pattern cache test failed: {e}")
    
    print()

def test_cache_timeout():
    """Cache timeout testi."""
    print("🔍 Cache Timeout Test")
    print("=" * 50)
    
    try:
        # Set cache with short timeout
        cache.set('timeout_test', 'test_data', timeout=2)
        
        # Immediately get (should work)
        immediate_data = cache.get('timeout_test')
        if immediate_data == 'test_data':
            print("✅ Immediate cache retrieval successful")
        else:
            print("❌ Immediate cache retrieval failed")
        
        # Wait for timeout
        print("⏳ Waiting for cache timeout (2 seconds)...")
        time.sleep(3)
        
        # Try to get after timeout (should fail)
        timeout_data = cache.get('timeout_test')
        if timeout_data is None:
            print("✅ Cache timeout working correctly")
        else:
            print("❌ Cache timeout not working")
            
    except Exception as e:
        print(f"❌ Cache timeout test failed: {e}")
    
    print()

def test_cache_with_models():
    """Model verileri ile cache testi."""
    print("🔍 Cache with Models Test")
    print("=" * 50)
    
    try:
        # Create test user and tournament
        test_user = User.objects.create_user(
            email='cachetest@example.com',
            password='testpass123'
        )
        
        tournament = Tournament.objects.create(
            user=test_user,
            name='Cache Test Tournament',
            category='Nature',
            is_active=True
        )
        
        # Cache tournament data
        tournament_data = {
            'id': tournament.id,
            'name': tournament.name,
            'category': tournament.category,
            'user_email': tournament.user.email,
            'created_at': tournament.created_at.isoformat()
        }
        
        start_time = time.time()
        cache.set(f'tournament:{tournament.id}', tournament_data, timeout=60)
        set_time = time.time() - start_time
        
        # Get cached tournament data
        start_time = time.time()
        cached_tournament = cache.get(f'tournament:{tournament.id}')
        get_time = time.time() - start_time
        
        if cached_tournament and cached_tournament['id'] == tournament.id:
            print("✅ Model cache successful")
            print(f"⏱️  Set time: {set_time:.4f}s")
            print(f"⏱️  Get time: {get_time:.4f}s")
        else:
            print("❌ Model cache failed")
        
        # Cleanup
        tournament.delete()
        test_user.delete()
        
    except Exception as e:
        print(f"❌ Model cache test failed: {e}")
    
    print()

def test_cache_stress():
    """Cache stress testi."""
    print("🔍 Cache Stress Test")
    print("=" * 50)
    
    try:
        # Perform many cache operations
        operation_count = 1000
        successful_operations = 0
        
        start_time = time.time()
        
        for i in range(operation_count):
            key = f'stress_test_{i}'
            data = {'index': i, 'timestamp': time.time()}
            
            # Set cache
            cache.set(key, data, timeout=60)
            
            # Get cache
            retrieved_data = cache.get(key)
            
            if retrieved_data and retrieved_data['index'] == i:
                successful_operations += 1
        
        end_time = time.time()
        total_time = end_time - start_time
        
        print(f"✅ Stress test: {successful_operations}/{operation_count} operations successful")
        print(f"⏱️  Total time: {total_time:.4f}s")
        print(f"⏱️  Average time per operation: {total_time / operation_count:.6f}s")
        
        if successful_operations == operation_count:
            print("✅ All stress test operations successful")
        else:
            print(f"⚠️  {operation_count - successful_operations} operations failed")
            
        if total_time < 10.0:
            print("✅ Stress test performance is good")
        else:
            print("⚠️  Stress test performance is slow")
        
    except Exception as e:
        print(f"❌ Cache stress test failed: {e}")
    
    print()

def main():
    """Ana test fonksiyonu."""
    print("🚀 Miorai Cache Performance Tests")
    print("=" * 60)
    print()
    
    # Run all cache tests
    test_basic_cache_operations()
    test_cache_with_large_data()
    test_cache_pattern_operations()
    test_cache_timeout()
    test_cache_with_models()
    test_cache_stress()
    
    print("🎉 Cache Performance Tests Completed!")
    print("=" * 60)

if __name__ == '__main__':
    main() 