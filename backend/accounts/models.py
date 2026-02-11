from django.db import models
from django.contrib.auth.models import User
from schools.models import School
from schools.models import Enrollment
# from attendance.models import AttendanceSession, AttendanceRecord
from django.db.models import Count, Q

# UserProfile for roles
class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('admin', 'School Admin'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


# StudentProfile for student details
class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='students')
    matric_number = models.CharField(max_length=20, unique=True)  # given by school
    department = models.CharField(max_length=100)  # mandatory
    level = models.CharField(max_length=10)  # mandatory, e.g., 100, 200, 300
    phone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.matric_number}"


# AdminProfile for admin details
class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='admin')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accounts_adminprofile'

    def __str__(self):
        return f"{self.user.username} - {self.school.name} Admin"


def get_attendance_percentage(self, course):
    from attendance.models import AttendanceSession, AttendanceRecord  # import inside
    total_sessions = AttendanceSession.objects.filter(course=course).count()
    attended_sessions = AttendanceRecord.objects.filter(
        student=self,
        session__course=course,
        status='present'
    ).count()
    
    if total_sessions == 0:
        return 0
    return round((attended_sessions / total_sessions) * 100, 2)

def is_eligible(self, course, min_percentage=75):
    return self.get_attendance_percentage(course) >= min_percentage

StudentProfile.get_attendance_percentage = get_attendance_percentage
StudentProfile.is_eligible = is_eligible
