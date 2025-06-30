from django.db import models
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class Tournament(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tournaments')
    name = models.CharField(max_length=200, default='Resim Turnuvası')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_completed = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    play_count = models.IntegerField(default=0)
    current_round = models.IntegerField(default=1)
    current_match_index = models.IntegerField(default=0)
    win_matrix = models.TextField(default='[]')  # JSON string olarak saklayacağız
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.name}"
    
    def get_win_matrix(self):
        """Win matrix'i Python listesi olarak döndür"""
        try:
            return json.loads(self.win_matrix)
        except:
            return []
    
    def set_win_matrix(self, matrix):
        """Win matrix'i JSON string olarak sakla"""
        self.win_matrix = json.dumps(matrix)

class TournamentImage(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='tournament_images/')
    name = models.CharField(max_length=200)
    original_filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    points = models.IntegerField(default=0)
    rounds_played = models.IntegerField(default=0)
    order_index = models.IntegerField(default=0)  # Orijinal sırayı korumak için
    
    class Meta:
        ordering = ['order_index']
    
    def __str__(self):
        return f"{self.tournament.name} - {self.name}"

class Match(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    image1 = models.ForeignKey(TournamentImage, on_delete=models.CASCADE, related_name='matches_as_image1')
    image2 = models.ForeignKey(TournamentImage, on_delete=models.CASCADE, related_name='matches_as_image2')
    winner = models.ForeignKey(TournamentImage, on_delete=models.CASCADE, related_name='won_matches', null=True, blank=True)
    round_number = models.IntegerField()
    match_index = models.IntegerField()
    played_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['round_number', 'match_index']
    
    def __str__(self):
        return f"Round {self.round_number} - {self.image1.name} vs {self.image2.name}"
