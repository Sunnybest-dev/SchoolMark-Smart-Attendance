from django.db import models
from django.contrib.auth.models import User


class School(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=50)
    logo = models.ImageField(upload_to='school_logos/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Course(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='courses')
    course_code = models.CharField(max_length=20)
    course_title = models.CharField(max_length=255)
    department = models.CharField(max_length=100, blank=True)
    level = models.CharField(max_length=20, blank=True)  # e.g. 100, 200, 300
    lecturer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_courses'
    )
    total_classes_set = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'course_code')

    def __str__(self):
        return f"{self.course_code} - {self.course_title}"
    
    def classes_held(self):
        return self.attendance_sessions.count()
    
    def completion_percentage(self):
        if self.total_classes_set == 0:
            return 0
        return round((self.classes_held() / self.total_classes_set) * 100, 2)

class Enrollment(models.Model):
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    level = models.CharField(max_length=20)  # e.g. 100, 200, 300
    is_carry_over = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} → {self.course.course_code}"

class AttendanceControl(models.Model):
    school = models.OneToOneField(
        School,
        on_delete=models.CASCADE,
        related_name='attendance_control'
    )
    attendance_locked = models.BooleanField(default=False)
    locked_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.school.name} - Attendance Control"
