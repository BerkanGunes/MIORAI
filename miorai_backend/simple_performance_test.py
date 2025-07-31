"""
Basit performans testleri - Redis olmadan çalışır.
"""

import time
import os
import sys
import django

# Django settings'i yapılandır
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'miorai_backend.settings')
django.setup()

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework import status
from tournaments.models import Tournament, TournamentImage, Match
import psutil

User = get_user_model()

def test_cache_performance():
    """Cache performans testleri."""
    print("🔍 Cache Performance Tests")
    print("=" * 50)
    
    # Test data
    test_data = {'test': 'data', 'number': 123}
    
    # Cache set/get test
    start_time = time.time()
    
    try:
        # Set cache
        cache.set('test_key', test_data, timeout=60)
        
        # Get cache
        cached_data = cache.get('test_key')
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Assertions
        if cached_data == test_data:
            print(f"✅ Cache operation successful")
            print(f"⏱️  Duration: {duration:.4f}s")
            
            if duration < 0.1:
                print(f"✅ Cache operations are fast (< 0.1s)")
            else:
                print(f"⚠️  Cache operations are slow (> 0.1s)")
        else:
            print(f"❌ Cache operation failed - data mismatch")
            
    except Exception as e:
        print(f"❌ Cache test failed: {e}")
    
    print()

def test_system_monitoring():
    """System monitoring testleri."""
    print("🔍 System Monitoring Tests")
    print("=" * 50)
    
    try:
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        print(f"🖥️  CPU Usage: {cpu_percent:.2f}%")
        
        # Memory usage
        memory = psutil.virtual_memory()
        print(f"💾 Memory Usage: {memory.percent:.2f}%")
        print(f"💾 Available Memory: {memory.available / 1024 / 1024 / 1024:.2f}GB")
        
        # Disk usage
        disk = psutil.disk_usage('/')
        print(f"💿 Disk Usage: {disk.percent:.2f}%")
        print(f"💿 Free Space: {disk.free / 1024 / 1024 / 1024:.2f}GB")
        
        # Process memory
        process = psutil.Process()
        process_memory = process.memory_info().rss / 1024 / 1024
        print(f"🔧 Process Memory: {process_memory:.2f}MB")
        
        # Health checks
        if cpu_percent < 80:
            print("✅ CPU usage is healthy")
        else:
            print("⚠️  CPU usage is high")
            
        if memory.percent < 80:
            print("✅ Memory usage is healthy")
        else:
            print("⚠️  Memory usage is high")
            
        if disk.percent < 90:
            print("✅ Disk usage is healthy")
        else:
            print("⚠️  Disk usage is high")
            
    except Exception as e:
        print(f"❌ System monitoring test failed: {e}")
    
    print()

def test_database_operations():
    """Database operasyon testleri."""
    print("🔍 Database Operations Tests")
    print("=" * 50)
    
    try:
        # Test user creation
        start_time = time.time()
        
        # Create test user
        test_user = User.objects.create_user(
            email='perftest@example.com',
            password='testpass123'
        )
        
        # Create test tournament
        tournament = Tournament.objects.create(
            user=test_user,
            name='Performance Test Tournament',
            category='Nature',
            is_active=True
        )
        
        end_time = time.time()
        db_creation_time = end_time - start_time
        
        print(f"✅ Database operations successful")
        print(f"⏱️  Creation time: {db_creation_time:.4f}s")
        
        if db_creation_time < 1.0:
            print("✅ Database operations are fast (< 1.0s)")
        else:
            print("⚠️  Database operations are slow (> 1.0s)")
        
        # Test query performance
        start_time = time.time()
        
        # Query tournaments
        tournaments = Tournament.objects.filter(user=test_user)
        tournament_count = tournaments.count()
        
        end_time = time.time()
        query_time = end_time - start_time
        
        print(f"📊 Query time: {query_time:.4f}s")
        print(f"📊 Found {tournament_count} tournaments")
        
        if query_time < 0.1:
            print("✅ Database queries are fast (< 0.1s)")
        else:
            print("⚠️  Database queries are slow (> 0.1s)")
        
        # Cleanup
        tournament.delete()
        test_user.delete()
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
    
    print()

def test_memory_usage():
    """Memory usage testleri."""
    print("🔍 Memory Usage Tests")
    print("=" * 50)
    
    try:
        # Get initial memory usage
        process = psutil.Process()
        initial_memory = process.memory_info().rss
        
        # Perform some operations
        test_data = []
        for i in range(1000):
            test_data.append({
                'index': i,
                'data': 'x' * 100  # 100 bytes per entry
            })
        
        # Get memory usage after operations
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        print(f"📊 Memory increase: {memory_increase / 1024 / 1024:.2f}MB")
        print(f"📊 Total memory: {final_memory / 1024 / 1024:.2f}MB")
        
        if memory_increase < 100 * 1024 * 1024:  # 100MB
            print("✅ Memory usage is reasonable (< 100MB increase)")
        else:
            print("⚠️  Memory usage is high (> 100MB increase)")
        
        # Clear test data
        del test_data
        
    except Exception as e:
        print(f"❌ Memory test failed: {e}")
    
    print()

def test_concurrent_operations():
    """Concurrent operasyon testleri."""
    print("🔍 Concurrent Operations Tests")
    print("=" * 50)
    
    import threading
    import queue
    
    try:
        results = queue.Queue()
        
        def test_operation(thread_id):
            """Thread function for test operations."""
            try:
                start_time = time.time()
                
                # Simulate some work
                time.sleep(0.01)  # 10ms
                
                # Create some data
                test_data = {'thread_id': thread_id, 'timestamp': time.time()}
                
                end_time = time.time()
                duration = end_time - start_time
                
                results.put({
                    'thread_id': thread_id,
                    'success': True,
                    'duration': duration
                })
            except Exception as e:
                results.put({
                    'thread_id': thread_id,
                    'success': False,
                    'error': str(e)
                })
        
        # Create multiple threads
        threads = []
        thread_count = 10
        
        start_time = time.time()
        
        for i in range(thread_count):
            thread = threading.Thread(target=test_operation, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        end_time = time.time()
        total_duration = end_time - start_time
        
        # Collect results
        successful_operations = 0
        total_operation_time = 0
        
        while not results.empty():
            result = results.get()
            if result['success']:
                successful_operations += 1
                total_operation_time += result['duration']
        
        print(f"📊 Successful operations: {successful_operations}/{thread_count}")
        print(f"⏱️  Total duration: {total_duration:.4f}s")
        print(f"⏱️  Average operation time: {total_operation_time / successful_operations:.4f}s")
        
        if successful_operations == thread_count:
            print("✅ All concurrent operations successful")
        else:
            print("⚠️  Some concurrent operations failed")
            
        if total_duration < 1.0:
            print("✅ Concurrent operations are fast (< 1.0s)")
        else:
            print("⚠️  Concurrent operations are slow (> 1.0s)")
        
    except Exception as e:
        print(f"❌ Concurrent test failed: {e}")
    
    print()

def main():
    """Ana test fonksiyonu."""
    print("🚀 Miorai Performance Tests")
    print("=" * 60)
    print()
    
    # Run all tests
    test_cache_performance()
    test_system_monitoring()
    test_database_operations()
    test_memory_usage()
    test_concurrent_operations()
    
    print("🎉 Performance Tests Completed!")
    print("=" * 60)

if __name__ == '__main__':
    main() 