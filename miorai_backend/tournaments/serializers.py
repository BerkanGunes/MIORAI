from rest_framework import serializers
from .models import Tournament, TournamentImage, Match, CATEGORY_CHOICES

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
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'category', 'category_display', 'created_at', 'updated_at', 'is_active', 'is_completed', 
                 'current_round', 'current_match_index', 'images', 'matches', 'is_from_public']

class PublicTournamentSerializer(serializers.ModelSerializer):
    images = TournamentImageSerializer(many=True, read_only=True)
    user_name = serializers.SerializerMethodField()
    first_image = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'category', 'category_display', 'user_name', 'play_count', 'created_at', 'images', 'first_image']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email
    
    def get_first_image(self, obj):
        real_images = [img for img in obj.images.all() if not img.name.startswith('BOŞ_')]
        if real_images:
            return TournamentImageSerializer(real_images[0], context=self.context).data
        return None

class TournamentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['name', 'category']

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

class CategorySerializer(serializers.Serializer):
    """Kategori listesi için serializer"""
    value = serializers.CharField()
    label = serializers.CharField()

class MatchPredictionSerializer(serializers.Serializer):
    """ML tahmin sonuçları için serializer - Güven aralığı yaklaşımı"""
    n_images = serializers.IntegerField()
    prediction = serializers.DictField(allow_null=True)
    message = serializers.CharField(allow_null=True, required=False)
    error = serializers.CharField(allow_null=True, required=False)

 