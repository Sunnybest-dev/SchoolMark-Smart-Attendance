from django.urls import path
from .views import register_user, get_profile, list_users, assign_course, debug_users
from .serializers import CustomTokenObtainPairView
from schools.views import get_schools

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('schools/', get_schools, name='get_schools'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('profile/', get_profile, name='get_profile'),
    path('users/', list_users, name='list_users'),
    path('assign-course/', assign_course, name='assign_course'),
    path('debug-users/', debug_users, name='debug_users'),
]
