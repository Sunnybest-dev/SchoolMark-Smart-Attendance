import random
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from .utils import calculate_distance
from .models import AttendanceSession, AttendanceRecord


# -------------------------------------------------
# 1️⃣ GENERATE ATTENDANCE SESSION
# -------------------------------------------------
def generate_attendance_pin(course, lecturer, start_time, end_time):
    """
    Generate a 6-digit PIN for an attendance session
    """

    if course.school.attendance_control.attendance_locked:
        raise PermissionDenied("Attendance has been locked by school management")

    pin = str(random.randint(100000, 999999))

    session = AttendanceSession.objects.create(
        course=course,
        session_pin=pin,
        start_time=start_time,
        end_time=end_time,
        created_by=lecturer,
        radius=course.default_radius if hasattr(course, 'default_radius') else 70
    )
    return session


# -------------------------------------------------
# 2️⃣ MARK ATTENDANCE (GPS + FACE/FINGERPRINT)
# -------------------------------------------------
def mark_attendance(student, pin, student_lat, student_lon, verified_by):
    # 🔐 Enforce verification method
    if verified_by not in ['face', 'fingerprint']:
        raise PermissionDenied("Face or Fingerprint verification required")

    try:
        session = AttendanceSession.objects.get(session_pin=pin)
    except AttendanceSession.DoesNotExist:
        raise ValueError("Invalid PIN")

    # ❌ Prevent double attendance
    if AttendanceRecord.objects.filter(session=session, student=student).exists():
        raise ValueError("Attendance already marked")

    # ⏰ Time validation
    now = timezone.localtime().time()
    if not (session.start_time <= now <= session.end_time):
        raise PermissionDenied("Attendance window has closed")

    # 📍 Lecturer / course location
    lecturer_lat = session.course.latitude
    lecturer_lon = session.course.longitude

    # 📏 Radius (SESSION BASED ✔)
    max_radius = session.radius

    # 🧮 Distance check
    distance = calculate_distance(
        lecturer_lat,
        lecturer_lon,
        student_lat,
        student_lon
    )

    if distance > max_radius:
        raise PermissionDenied("You are outside the attendance radius")

    # ✅ Mark attendance
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
    Automatically marks all unmarked students as ABSENT
    """
    students = session.course.students.all()

    for student in students:
        AttendanceRecord.objects.get_or_create(
            session=session,
            student=student,
            defaults={
                'status': 'absent',
                'verified_by': 'none'
            }
        )


# -------------------------------------------------
# 4️⃣ UPLOAD EXCUSE
# -------------------------------------------------
def upload_excuse(student, session_id, file):
    try:
        session = AttendanceSession.objects.get(id=session_id)
    except AttendanceSession.DoesNotExist:
        raise ValueError("Attendance session not found")

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
    attended = records.filter(
        status__in=['present', 'excused']
    ).count()

    if total_classes == 0:
        return 0

    return round((attended / total_classes) * 100, 2)


def close_attendance_session(session: AttendanceSession):
    """
    Marks all students who haven't attended as absent
    """
    # Get all enrolled students
    enrolled_students = [e.student for e in session.course.enrollments.all()]

    for student in enrolled_students:
        record, created = AttendanceRecord.objects.get_or_create(
            session=session,
            student=student,
            defaults={"status": "absent"}
        )
        if not created:
            # Do not overwrite present/excused
            continue

    session.closed_at = timezone.now()
    session.save()