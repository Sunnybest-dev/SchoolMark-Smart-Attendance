from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import PermissionDenied
from django.utils import timezone

from schools.models import Course
from .services import generate_attendance_pin, upload_excuse, mark_attendance, close_attendance_session
from .models import AttendanceSession, AttendanceRecord


# --------------------------
# 1️⃣ Generate PIN
# --------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_pin(request):
    if not hasattr(request.user, 'lecturerprofile'):
        return Response({"detail": "Lecturer access only"}, status=403)
    
    course_id = request.data.get('course_id')
    lat = request.data.get('lecturer_latitude')
    lon = request.data.get('lecturer_longitude')
    radius = request.data.get('radius', 50)

    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        session = generate_attendance_pin(course, request.user.lecturerprofile, lat, lon, radius)
    except PermissionDenied as e:
        return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)

    return Response({"message": "Attendance PIN generated", "pin": session.session_pin})


# --------------------------
# 2️⃣ Mark Attendance (Student)
# --------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_student_attendance(request):
    if not hasattr(request.user, 'studentprofile'):
        return Response(
        {"detail": "Only students can mark attendance"},
        status=403
    )
    pin = request.data.get('pin')
    verified_by = request.data.get('verified_by', 'face')
    student_lat = request.data.get('latitude')
    student_lon = request.data.get('longitude')
    student = request.user.studentprofile

    if not all([pin, student_lat, student_lon]):
        return Response({"detail": "PIN, latitude, and longitude are required"}, status=400)
    if verified_by not in ['face', 'fingerprint']: 
        return Response( {"detail": "verified_by must be 'face' or 'fingerprint'"}, status=400 )
    
    try:
        record = mark_attendance(
            student,
            pin,
            float(student_lat),
            float(student_lon),
            verified_by
        )
    except (ValueError, PermissionDenied) as e:
        return Response({"detail": str(e)}, status=403)

    return Response({
        "message": "Attendance marked successfully",
        "course": record.session.course.course_code,
        "status": record.status
    })


# --------------------------
# 3️⃣ Upload Excuse (Lecturer)
# --------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_excuse_file(request):
    if not hasattr(request.user, 'lecturerprofile'):
        return Response(
        {"detail": "Only lecturers can upload excuses"},
        status=403
    )

    student_id = request.data.get('student_id')
    session_id = request.data.get('session_id')
    file = request.FILES.get('file')

    if not all([student_id, session_id, file]):
        return Response({"detail": "student_id, session_id, and file are required"}, status=400)

    from accounts.models import StudentProfile
    try:
        student = StudentProfile.objects.get(id=student_id)
    except StudentProfile.DoesNotExist:
        return Response({"detail": "Student not found"}, status=404)

    try:
        record = upload_excuse(student, session_id, file)
    except ValueError as e:
        return Response({"detail": str(e)}, status=400)

    return Response({
        "message": "Excuse uploaded successfully",
        "student": student.user.get_full_name(),
        "status": record.status
    })


# --------------------------
# 4️⃣ Close Attendance Session (Admin / Auto-Absentees)
# --------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def close_attendance(request, pin):
    try:
        session = AttendanceSession.objects.get(session_pin=pin)
    except AttendanceSession.DoesNotExist:
        return Response({"detail": "Session not found"}, status=404)

    close_attendance_session(session)
    return Response({"message": f"Session {session.session_pin} closed. Absentees marked."})
