import random
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from .models import AttendanceSession, AttendanceRecord


def generate_attendance_pin(course, lecturer, start_time, end_time):
    """
    Generate a 6-digit PIN for a session.
    Checks if school locked attendance first.
    """
    if course.school.attendance_control.attendance_locked:
        raise PermissionDenied(
            "Attendance has been locked by school management"
        )

    pin = str(random.randint(100000, 999999))
    session = AttendanceSession.objects.create(
        course=course,
        session_pin=pin,
        start_time=start_time,
        end_time=end_time,
        created_by=lecturer
    )
    return session


def mark_attendance(student, pin, verified_by='face'):
    """Mark attendance for a student using session PIN"""
    try:
        session = AttendanceSession.objects.get(session_pin=pin)
    except AttendanceSession.DoesNotExist:
        raise ValueError("Invalid PIN")

    now = timezone.now().time()
    if not (session.start_time <= now <= session.end_time):
        raise PermissionDenied("Attendance session is closed")

    if AttendanceRecord.objects.filter(student=student, session=session).exists():
        raise ValueError("Attendance already marked")

    record = AttendanceRecord.objects.create(
        session=session,
        student=student,
        verified_by=verified_by,
        status='present'
    )
    return record


def upload_excuse(student, session_id, file):
    """Upload excuse document for a student who was absent"""
    try:
        session = AttendanceSession.objects.get(id=session_id)
    except AttendanceSession.DoesNotExist:
        raise ValueError("Attendance session not found")

    record, created = AttendanceRecord.objects.get_or_create(
        student=student,
        session=session,
        defaults={'status': 'excused'}
    )

    record.status = 'excused'
    record.reason_document = file
    record.save()
    return record


def get_attendance_percentage(student, course):
    """Calculate attendance percentage for a student in a course"""
    records = AttendanceRecord.objects.filter(
        student=student,
        session__course=course
    )

    total_classes = course.total_classes_set
    attended = records.filter(status__in=['present', 'excused']).count()
    if total_classes == 0:
        return 0
    return round((attended / total_classes) * 100, 2)
