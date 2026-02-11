import random
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from .utils import calculate_distance
from .models import AttendanceSession, AttendanceRecord

# -----------------------------------------------
# SCHOOL ABBREVIATION SESSION
#-----------------------------------------------
def get_school_abbreviation(school_name):
    words = school_name.split()
    if len(words) == 1:
        return words[0][:3].upper()
    return ''.join(word[0] for word in words).upper()


# -------------------------------------------------
# 1️⃣ GENERATE ATTENDANCE SESSION
# -------------------------------------------------
def generate_attendance_pin(course, lecturer, lat, lon, radius=50):
    if course.school.attendance_control.attendance_locked:
        raise PermissionDenied("Attendance has been locked by school management")

    while True:
        pin = str(random.randint(100000, 999999))
        if not AttendanceSession.objects.filter(session_pin=pin).exists():
            break

    now = timezone.localtime()
    session = AttendanceSession.objects.create(
        course=course,
        session_pin=pin,
        start_time=now.time(),
        end_time=(now + timezone.timedelta(hours=2)).time(),
        lecturer_latitude=lat,
        lecturer_longitude=lon,
        radius=radius,
        created_by=lecturer.user,
        is_closed=False
    )
    return session


# -------------------------------------------------
# 2️⃣ MARK ATTENDANCE (GPS + FACE/FINGERPRINT)
# -------------------------------------------------
def mark_attendance(student, pin, student_lat, student_lon, verified_by):
    if verified_by not in ['face', 'fingerprint']:
        raise PermissionDenied("Face or Fingerprint verification required")

    try:
        session = AttendanceSession.objects.get(session_pin=pin)
    except AttendanceSession.DoesNotExist:
        raise PermissionDenied("Invalid PIN")

    if session.is_closed:
        raise PermissionDenied("Attendance session is closed")

    if AttendanceRecord.objects.filter(session=session, student=student).exists():
        raise PermissionDenied("Attendance already marked")

    now = timezone.localtime().time()
    if not (session.start_time <= now <= session.end_time):
        raise PermissionDenied("Attendance window has closed")

    distance = calculate_distance(
        session.lecturer_latitude,
        session.lecturer_longitude,
        student_lat,
        student_lon
    )

    if distance > session.radius:
        raise PermissionDenied("You are outside the attendance radius")

    return AttendanceRecord.objects.create(
        session=session,
        student=student,
        verified_by=verified_by,
        status='present'
    )


# -------------------------------------------------
# 3️⃣ AUTO-MARK ABSENTEES (STEP 2 ✔)
# -------------------------------------------------
def close_attendance_session(session):
    """
    Marks all students who didn't attend as ABSENT
    """

    if session.is_closed:
        return

    enrolled_students = [
        enrollment.student for enrollment in session.course.enrollments.all()
    ]

    for student in enrolled_students:
        AttendanceRecord.objects.get_or_create(
            session=session,
            student=student,
            defaults={'status': 'absent'}
        )

    session.is_closed = True
    session.save()


# -------------------------------------------------
# 4️⃣ UPLOAD EXCUSE
# -------------------------------------------------
def upload_excuse(student, session_id, file):
    try:
        session = AttendanceSession.objects.get(id=session_id)
    except AttendanceSession.DoesNotExist:
        raise PermissionDenied("Attendance session not found")

    record, _ = AttendanceRecord.objects.get_or_create(
        student=student,
        session=session,
        defaults={'status': 'excused'}
    )

    record.status = 'excused'
    record.reason_document = file
    record.save()
    return record


# -------------------------------------------------
# 5️⃣ ATTENDANCE PERCENTAGE (ANALYTICS)
# -------------------------------------------------
def get_attendance_percentage(student, course):
    records = AttendanceRecord.objects.filter(
        student=student,
        session__course=course
    )

    total_classes = course.total_classes_set
    attended = records.filter(status__in=['present', 'excused']).count()

    if total_classes == 0:
        return 0

    return round((attended / total_classes) * 100, 2)
