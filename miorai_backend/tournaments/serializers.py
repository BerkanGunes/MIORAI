from rest_framework import serializers
from .models import Tournament, TournamentImage, Match

class TournamentImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TournamentImage
        fields = ['id', 'name', 'original_filename', 'image_url', 'points', 'rounds_played', 'order_index']
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

class MatchSerializer(serializers.ModelSerializer):
    image1 = TournamentImageSerializer(read_only=True)
    image2 = TournamentImageSerializer(read_only=True)
    winner = TournamentImageSerializer(read_only=True)
    
    class Meta:
        model = Match
        fields = ['id', 'image1', 'image2', 'winner', 'round_number', 'match_index', 'played_at']

class TournamentSerializer(serializers.ModelSerializer):
    images = TournamentImageSerializer(many=True, read_only=True)
    matches = MatchSerializer(many=True, read_only=True)
    
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'created_at', 'updated_at', 'is_active', 'is_completed', 
                 'current_round', 'current_match_index', 'images', 'matches']

class TournamentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['name']

class ImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentImage
        fields = ['image', 'name']
    
    def validate_image(self, value):
        # Dosya boyutu kontrolü (16MB)
        if value.size > 16 * 1024 * 1024:
            raise serializers.ValidationError("Dosya boyutu 16MB'dan büyük olamaz.")
        
        # Dosya formatı kontrolü
        if not value.content_type in ['image/jpeg', 'image/png']:
            raise serializers.ValidationError("Sadece JPG ve PNG formatları desteklenmektedir.")
        
        return value 