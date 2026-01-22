from django.urls import path
from .views import (
    generate_pin,
    mark_student_attendance,
    upload_excuse_file,
    close_attendance
)

urlpatterns = [
    path('generate-pin/', generate_pin, name='generate-pin'),
    path('mark/', mark_student_attendance, name='mark-attendance'),
    path('upload-excuse/', upload_excuse_file, name='upload-excuse'),
    path('close/<int:session_id>/', close_attendance, name='close-attendance'),
]
