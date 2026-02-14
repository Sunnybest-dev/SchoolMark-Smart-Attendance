from django.urls import path
from .views import get_schools, create_course, list_courses, delete_course

urlpatterns = [
    path('schools/', get_schools, name='get_schools'),
    path('courses/', create_course, name='create_course'),
    path('courses/list/', list_courses, name='list_courses'),
    path('courses/<int:course_id>/', delete_course, name='delete_course'),
]
