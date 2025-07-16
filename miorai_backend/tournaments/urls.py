from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.TournamentCreateView.as_view(), name='tournament-create'),
    path('detail/', views.TournamentDetailView.as_view(), name='tournament-detail'),
    path('upload-image/', views.ImageUploadView.as_view(), name='upload-image'),
    path('delete-image/<int:image_id>/', views.ImageDeleteView.as_view(), name='delete-image'),
    path('update-image-name/<int:image_id>/', views.ImageUpdateNameView.as_view(), name='update-image-name'),
    path('start/', views.StartTournamentView.as_view(), name='start-tournament'),
    path('submit-result/<int:match_id>/', views.SubmitMatchResultView.as_view(), name='submit-result'),
    path('current-match/', views.GetCurrentMatchView.as_view(), name='current-match'),
    path('public/', views.PublicTournamentsListView.as_view(), name='public-tournaments'),
    path('make-public/', views.MakeTournamentPublicView.as_view(), name='make-public'),
    path('create-from-public/<int:tournament_id>/', views.CreateTournamentFromPublicView.as_view(), name='create-from-public'),
    path('delete/', views.DeleteTournamentView.as_view(), name='delete-tournament'),
] 