from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.TournamentCreateView.as_view(), name='tournament-create'),
    path('detail/', views.TournamentDetailView.as_view(), name='tournament-detail'),
    path('upload-image/', views.ImageUploadView.as_view(), name='upload-image'),
    path('delete-image/<int:image_id>/', views.ImageDeleteView.as_view(), name='delete-image'),
    path('start/', views.StartTournamentView.as_view(), name='start-tournament'),
    path('submit-result/<int:match_id>/', views.SubmitMatchResultView.as_view(), name='submit-result'),
    path('current-match/', views.GetCurrentMatchView.as_view(), name='current-match'),
] 