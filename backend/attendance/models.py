from django.db import models
from django.contrib.auth.models import User
from schools.models import Course
from accounts.models import StudentProfile

class AttendanceSession(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance_sessions')
    session_pin = models.CharField(max_length=6, unique=True)
    session_qr = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    is_closed = models.BooleanField(default=False)

    date = models.DateField(auto_now_add=True)
    start_time = models.TimeField()
    end_time = models.TimeField()

    lecturer_latitude = models.FloatField(null=True, blank=True)
    lecturer_longitude = models.FloatField(null=True, blank=True)
    radius = models.PositiveIntegerField(default=50) 

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.course.course_code} - {self.date}"


class AttendanceRecord(models.Model):
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='attendance_records')
    verified_by = models.CharField(max_length=20, choices=(('face','Face'),('fingerprint','Fingerprint'),('excuse','Excuse')))
    status = models.CharField(max_length=20, choices=(('present','Present'),('absent','Absent'),('excused','Excused'),))
    reason_document = models.FileField(upload_to='attendance_excuses/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    marked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session', 'student')

    def __str__(self):
        return f"{self.student.matric_number} - {self.session.course.course_code}"


class ExcuseRequest(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    course_code = models.CharField(max_length=20)
    student_name = models.CharField(max_length=200)
    matric_number = models.CharField(max_length=50)
    excuse_file = models.FileField(upload_to='excuses/')
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE)
    attendance_record = models.ForeignKey(AttendanceRecord, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=(('pending','Pending'),('approved','Approved'),('rejected','Rejected')), default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.matric_number} - {self.course_code}"
