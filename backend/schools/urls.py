from django.urls import path
from .views import get_schools, get_school_courses

urlpatterns = [
    path('', get_schools, name='get_schools'),
    path('<int:school_id>/courses/', get_school_courses, name='get_school_courses'),
]
