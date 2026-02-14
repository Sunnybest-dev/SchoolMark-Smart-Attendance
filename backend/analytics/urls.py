from django.urls import path
from .views import student_dashboard, lecturer_dashboard, admin_dashboard
from .views import admin_lecturer_compliance

urlpatterns = [
    path('student/', student_dashboard),
    path('lecturer/', lecturer_dashboard),
    path('admin/', admin_dashboard),
    path('admin/lecturer-compliance/', admin_lecturer_compliance),
]
