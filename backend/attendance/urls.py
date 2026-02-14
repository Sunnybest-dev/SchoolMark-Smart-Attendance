from django.urls import path
from .views import (
    verify_pin,
    generate_pin,
    mark_student_attendance,
    upload_excuse_file,
    close_attendance,
    get_attendance_history,
    get_course_sessions,
    get_absent_students,
    get_excuse_requests,
    cancel_excuse
)

urlpatterns = [
    path('verify-pin/', verify_pin, name='verify-pin'),
    path('generate-pin/', generate_pin, name='generate-pin'),
    path('mark/', mark_student_attendance, name='mark-attendance'),
    path('upload-excuse/', upload_excuse_file, name='upload-excuse'),
    path('close/<str:pin>/', close_attendance, name='close-attendance'),
    path('history/', get_attendance_history, name='attendance-history'),
    path('sessions/<int:course_id>/', get_course_sessions, name='course-sessions'),
    path('absent/<int:session_id>/', get_absent_students, name='absent-students'),
    path('excuse-requests/', get_excuse_requests, name='excuse-requests'),
    path('cancel-excuse/<int:excuse_id>/', cancel_excuse, name='cancel-excuse'),
]
