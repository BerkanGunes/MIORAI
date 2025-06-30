from django.contrib import admin
from .models import Tournament, TournamentImage, Match

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_public', 'play_count', 'is_completed', 'created_at')
    list_filter = ('is_public', 'is_completed', 'created_at')
    search_fields = ('name', 'user__email', 'user__first_name', 'user__last_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'play_count')
    
    fieldsets = (
        ('Temel Bilgiler', {
            'fields': ('name', 'user', 'is_public', 'play_count')
        }),
        ('Durum', {
            'fields': ('is_active', 'is_completed')
        }),
        ('Turnuva Detayları', {
            'fields': ('current_round', 'current_match_index', 'win_matrix'),
            'classes': ('collapse',)
        }),
        ('Tarihler', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(TournamentImage)  
class TournamentImageAdmin(admin.ModelAdmin):
    list_display = ('name', 'tournament', 'points', 'rounds_played', 'uploaded_at')
    list_filter = ('tournament__is_public', 'uploaded_at')
    search_fields = ('name', 'tournament__name', 'original_filename')
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at',)

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('tournament', 'round_number', 'match_index', 'image1', 'image2', 'winner', 'played_at')
    list_filter = ('round_number', 'played_at', 'tournament__is_public')
    search_fields = ('tournament__name', 'image1__name', 'image2__name')
    ordering = ('-played_at',)
