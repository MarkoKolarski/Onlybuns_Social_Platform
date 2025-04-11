from django.urls import path
from .views import ChangePasswordView, LoginView, PostDetailView, PostListView, RegistrationView, UserProfileView, update_user_name, activate_account, index, toggle_like_post, HomePageUserView, user_profile, followed_user_posts, create_post, update_post, delete_post, get_registered_users, create_comment, network_trends, follow_user, send_post_to_agencies
from django_prometheus.exports import ExportToDjangoView



urlpatterns = [
    path('', index, name='index'),
    path('posts/<int:post_id>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:post_id>/like/', toggle_like_post, name='like-post'),
    path('register/', RegistrationView.as_view(), name='register'),
    path('activate/<str:activation_token>/', activate_account, name='activate-account'),
    path('login/', LoginView.as_view(), name='login'),
    path('posts/', PostListView.as_view(), name='post-list'),
    path('homepageuser/', HomePageUserView, name='home-page-user'),
    path('api/user-profile/', user_profile, name='user-profile'),
    path('api/followed-user-posts/', followed_user_posts, name='followed-user-posts'),
    path('api/create-post/', create_post, name='create-post'),
    path('posts/<int:post_id>/update/', update_post, name='update-post'),
    path('posts/<int:post_id>/delete/', delete_post, name='delete-post'),
    path('admin/registered-users/', get_registered_users, name='registered-users'),
    path('profile/<str:username>/', UserProfileView.as_view(), name='user-profile-detail'),
    path('update-name/', update_user_name, name='update-user-name'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('profile/<str:username>/follow/', follow_user, name='follow-user'),
    path('posts/<int:post_id>/comment/', create_comment, name='create-comment'),
    path('network-trends/', network_trends, name='network-trends'),
    path('send-post/', send_post_to_agencies, name='send_post_to_agencies'),
    path('metrics/', ExportToDjangoView  , name='django-metrics')
]