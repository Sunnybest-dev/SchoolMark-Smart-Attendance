from django.urls import path
from .views import generate_pin
from .views import mark_student_attendance,upload_excuse_file

urlpatterns = [
    path('generate-pin/', generate_pin),
    path('mark/', mark_student_attendance),
    path('upload-excuse/', upload_excuse_file),

]
