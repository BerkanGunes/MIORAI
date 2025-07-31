"""
Performance testleri için test dosyası.
Redis cache, database query optimizasyonu ve API response time testleri.
"""

import time
import requests
import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework import status
from tournaments.models import Tournament, TournamentImage, Match
from core.monitoring import performance_monitor, db_monitor, system_monitor
from core.cache import cache_manager, tournament_cache, ml_cache

User = get_user_model()

class PerformanceTestCase(TestCase):
    """Performance testleri için test case."""
    
    def setUp(self):
        """Test setup."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Test tournament oluştur
        self.tournament = Tournament.objects.create(
            user=self.user,
            name='Test Tournament',
            category='Nature',
            is_active=True
        )
    
    def test_cache_performance(self):
        """Cache performans testleri."""
        # Cache set/get test
        start_time = time.time()
        
        # Test data
        test_data = {'test': 'data', 'number': 123}
        
        # Set cache
        cache_manager.set('test_key', test_data, timeout=60)
        
        # Get cache
        cached_data = cache_manager.get('test_key')
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Assertions
        self.assertEqual(cached_data, test_data)
        self.assertLess(duration, 0.1)  # Cache operations should be very fast
        
        print(f"Cache operation duration: {duration:.4f}s")
    
    def test_tournament_cache_performance(self):
        """Tournament cache performans testleri."""
        # Tournament data cache test
        start_time = time.time()
        
        # Cache tournament data
        tournament_data = {
            'id': self.tournament.id,
            'name': self.tournament.name,
            'category': self.tournament.category
        }
        
        tournament_cache.cache_tournament_data(self.tournament.id, tournament_data)
        
        # Get cached data
        cached_data = tournament_cache.get_cached_tournament_data(self.tournament.id)
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Assertions
        self.assertEqual(cached_data, tournament_data)
        self.assertLess(duration, 0.1)
        
        print(f"Tournament cache operation duration: {duration:.4f}s")
    
    def test_ml_cache_performance(self):
        """ML cache performans testleri."""
        # ML prediction cache test
        start_time = time.time()
        
        # Test prediction data
        prediction_data = {
            'predicted_matches': 12,
            'confidence': 0.91,
            'difficulty': 'hard'
        }
        
        # Cache prediction
        ml_cache.cache_prediction(8, prediction_data)
        
        # Get cached prediction
        cached_prediction = ml_cache.get_cached_prediction(8)
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Assertions
        self.assertEqual(cached_prediction, prediction_data)
        self.assertLess(duration, 0.1)
        
        print(f"ML cache operation duration: {duration:.4f}s")
    
    def test_api_response_time(self):
        """API response time testleri."""
        # Tournament detail API test
        start_time = time.time()
        
        response = self.client.get(f'/api/tournaments/{self.tournament.id}/')
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLess(duration, 1.0)  # API should respond within 1 second
        
        print(f"Tournament detail API response time: {duration:.4f}s")
    
    def test_database_query_performance(self):
        """Database query performans testleri."""
        # Database monitoring test
        db_monitor.start_monitoring()
        
        # Perform some database operations
        tournaments = Tournament.objects.filter(user=self.user)
        tournament_count = tournaments.count()
        
        # Create some test data
        for i in range(5):
            Tournament.objects.create(
                user=self.user,
                name=f'Test Tournament {i}',
                category='Nature',
                is_active=False
            )
        
        # Query again
        updated_count = Tournament.objects.filter(user=self.user).count()
        
        db_stats = db_monitor.end_monitoring()
        
        # Assertions
        self.assertEqual(updated_count, tournament_count + 5)
        self.assertGreater(db_stats['query_count'], 0)
        self.assertLess(db_stats['avg_query_time'], 0.1)  # Average query time should be fast
        
        print(f"Database queries: {db_stats['query_count']}")
        print(f"Average query time: {db_stats['avg_query_time']:.4f}s")
    
    def test_system_monitoring(self):
        """System monitoring testleri."""
        # System stats test
        system_stats = system_monitor.get_system_stats()
        
        # Assertions
        self.assertIsInstance(system_stats, dict)
        self.assertIn('cpu_percent', system_stats)
        self.assertIn('memory_percent', system_stats)
        
        print(f"CPU Usage: {system_stats.get('cpu_percent', 0):.2f}%")
        print(f"Memory Usage: {system_stats.get('memory_percent', 0):.2f}%")
    
    def test_performance_monitoring(self):
        """Performance monitoring testleri."""
        # Performance monitoring test
        operation_name = 'test_operation'
        
        performance_monitor.start_timer(operation_name)
        
        # Simulate some work
        time.sleep(0.1)
        
        duration = performance_monitor.end_timer(operation_name)
        
        # Assertions
        self.assertGreater(duration, 0.09)  # Should be close to 0.1s
        self.assertLess(duration, 0.2)  # Should not be much more than 0.1s
        
        print(f"Monitored operation duration: {duration:.4f}s")
    
    def test_cache_invalidation(self):
        """Cache invalidation testleri."""
        # Test cache invalidation
        test_key = 'test_invalidation'
        test_data = {'test': 'data'}
        
        # Set cache
        cache_manager.set(test_key, test_data)
        
        # Verify cache exists
        cached_data = cache_manager.get(test_key)
        self.assertEqual(cached_data, test_data)
        
        # Invalidate cache
        cache_manager.delete(test_key)
        
        # Verify cache is cleared
        cached_data = cache_manager.get(test_key)
        self.assertIsNone(cached_data)
        
        print("Cache invalidation test passed")
    
    def test_concurrent_access(self):
        """Concurrent access testleri."""
        import threading
        
        results = []
        
        def cache_operation(thread_id):
            """Thread function for cache operations."""
            for i in range(10):
                key = f'thread_{thread_id}_key_{i}'
                data = {'thread_id': thread_id, 'iteration': i}
                
                cache_manager.set(key, data)
                cached_data = cache_manager.get(key)
                
                results.append(cached_data == data)
        
        # Create multiple threads
        threads = []
        for i in range(5):
            thread = threading.Thread(target=cache_operation, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Assertions
        self.assertEqual(len(results), 50)  # 5 threads * 10 operations
        self.assertTrue(all(results))  # All operations should succeed
        
        print(f"Concurrent access test: {len(results)} operations completed successfully")
    
    def test_memory_usage(self):
        """Memory usage testleri."""
        import psutil
        import os
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Perform cache operations
        for i in range(1000):
            key = f'memory_test_key_{i}'
            data = {'index': i, 'data': 'x' * 100}  # 100 bytes per entry
            cache_manager.set(key, data, timeout=60)
        
        # Get memory usage after operations
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # Assertions
        self.assertGreater(memory_increase, 0)  # Memory should increase
        self.assertLess(memory_increase, 100 * 1024 * 1024)  # Should not increase by more than 100MB
        
        print(f"Memory increase: {memory_increase / 1024 / 1024:.2f}MB")
    
    def tearDown(self):
        """Test cleanup."""
        # Clear all cache
        cache.clear()
        
        # Reset performance monitor
        performance_monitor.reset_metrics()

class LoadTestTestCase(TestCase):
    """Load testleri için test case."""
    
    def setUp(self):
        """Test setup."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='loadtestuser',
            email='loadtest@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_high_load_cache_operations(self):
        """Yüksek yük altında cache operasyonları testi."""
        start_time = time.time()
        
        # Perform 1000 cache operations
        for i in range(1000):
            key = f'load_test_key_{i}'
            data = {'index': i, 'timestamp': time.time()}
            cache_manager.set(key, data, timeout=60)
        
        # Read all cached data
        for i in range(1000):
            key = f'load_test_key_{i}'
            cached_data = cache_manager.get(key)
            self.assertIsNotNone(cached_data)
        
        end_time = time.time()
        total_duration = end_time - start_time
        
        # Assertions
        self.assertLess(total_duration, 10.0)  # Should complete within 10 seconds
        
        print(f"High load cache test: 2000 operations in {total_duration:.4f}s")
        print(f"Average operation time: {total_duration / 2000:.6f}s")
    
    def test_concurrent_api_requests(self):
        """Concurrent API request testleri."""
        import threading
        import queue
        
        # Create test tournament
        tournament = Tournament.objects.create(
            user=self.user,
            name='Load Test Tournament',
            category='Nature',
            is_active=True
        )
        
        results = queue.Queue()
        
        def api_request(thread_id):
            """Thread function for API requests."""
            try:
                start_time = time.time()
                response = self.client.get(f'/api/tournaments/{tournament.id}/')
                end_time = time.time()
                
                results.put({
                    'thread_id': thread_id,
                    'status_code': response.status_code,
                    'duration': end_time - start_time,
                    'success': response.status_code == 200
                })
            except Exception as e:
                results.put({
                    'thread_id': thread_id,
                    'error': str(e),
                    'success': False
                })
        
        # Create multiple threads for concurrent requests
        threads = []
        for i in range(20):  # 20 concurrent requests
            thread = threading.Thread(target=api_request, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Collect results
        successful_requests = 0
        total_duration = 0
        
        while not results.empty():
            result = results.get()
            if result['success']:
                successful_requests += 1
                total_duration += result['duration']
        
        # Assertions
        self.assertEqual(successful_requests, 20)  # All requests should succeed
        self.assertLess(total_duration / 20, 1.0)  # Average response time should be under 1 second
        
        print(f"Concurrent API test: {successful_requests}/20 requests successful")
        print(f"Average response time: {total_duration / 20:.4f}s")

if __name__ == '__main__':
    # Run performance tests
    import django
    django.setup()
    
    # Create test instance and run tests
    test_case = PerformanceTestCase()
    test_case.setUp()
    
    print("Running Performance Tests...")
    print("=" * 50)
    
    test_case.test_cache_performance()
    test_case.test_tournament_cache_performance()
    test_case.test_ml_cache_performance()
    test_case.test_api_response_time()
    test_case.test_database_query_performance()
    test_case.test_system_monitoring()
    test_case.test_performance_monitoring()
    test_case.test_cache_invalidation()
    test_case.test_concurrent_access()
    test_case.test_memory_usage()
    
    test_case.tearDown()
    
    print("=" * 50)
    print("Performance Tests Completed!") 