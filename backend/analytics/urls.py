from django.urls import path
from .views import student_dashboard, lecturer_dashboard

urlpatterns = [
    path('student/', student_dashboard),
    path('lecturer/', lecturer_dashboard),
]
