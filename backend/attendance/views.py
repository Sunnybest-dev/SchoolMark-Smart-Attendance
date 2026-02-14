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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_attendance_history(request):
    student = request.user.studentprofile
    records = AttendanceRecord.objects.filter(student=student).select_related('session__course').order_by('-marked_at')
    
    data = [{
        'id': r.id,
        'course_code': r.session.course.course_code,
        'course_title': r.session.course.course_title,
        'status': r.status,
        'marked_at': r.marked_at,
        'verified_by': r.verified_by
    } for r in records]
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_sessions(request, course_id):
    if not hasattr(request.user, 'lecturerprofile'):
        return Response({"detail": "Lecturer access only"}, status=403)
    sessions = AttendanceSession.objects.filter(course_id=course_id).order_by('-created_at')
    data = [{'id': s.id, 'session_pin': s.session_pin, 'created_at': s.created_at, 'is_closed': s.is_closed} for s in sessions]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_absent_students(request, session_id):
    if not hasattr(request.user, 'lecturerprofile'):
        return Response({"detail": "Lecturer access only"}, status=403)
    from accounts.models import StudentProfile
    session = AttendanceSession.objects.get(id=session_id)
    enrolled = session.course.students.all()
    present_ids = AttendanceRecord.objects.filter(session=session, status='present').values_list('student_id', flat=True)
    absent = enrolled.exclude(id__in=present_ids)
    data = [{'id': s.id, 'matric_number': s.matric_number, 'name': s.user.get_full_name()} for s in absent]
    return Response(data)


# --------------------------
# 1️⃣ Verify PIN
# --------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_pin(request):
    pin = request.data.get('pin')
    try:
        session = AttendanceSession.objects.get(session_pin=pin)
        if session.is_closed:
            return Response({"detail": "Attendance session is closed"}, status=403)
        return Response({"message": "Valid PIN"})
    except AttendanceSession.DoesNotExist:
        return Response({"detail": "Invalid PIN"}, status=404)


# --------------------------
# 2️⃣ Generate PIN
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
        return Response({"detail": "Only lecturers can upload excuses"}, status=403)

    matric_number = request.data.get('matric_number')
    student_name = request.data.get('student_name')
    course_code = request.data.get('course_code')
    file = request.FILES.get('file')

    if not all([matric_number, student_name, course_code, file]):
        return Response({"detail": "All fields are required"}, status=400)

    from accounts.models import StudentProfile
    from .models import ExcuseRequest
    
    try:
        student = StudentProfile.objects.get(matric_number=matric_number)
        course = Course.objects.get(course_code=course_code)
        
        # Find most recent absent session for this student and course
        absent_record = AttendanceRecord.objects.filter(
            student=student,
            session__course=course,
            status='absent'
        ).order_by('-session__date').first()
        
        if absent_record:
            # Mark as excused/present
            absent_record.status = 'excused'
            absent_record.verified_by = 'excuse'
            absent_record.reason_document = file
            absent_record.save()
            
            # Create excuse request for admin review
            ExcuseRequest.objects.create(
                student=student,
                course_code=course_code,
                student_name=student_name,
                matric_number=matric_number,
                excuse_file=file,
                submitted_by=request.user,
                attendance_record=absent_record,
                status='approved'
            )
            
            return Response({"message": "Excuse submitted and student marked present"})
        else:
            return Response({"detail": "No absent record found for this student in this course"}, status=404)
            
    except StudentProfile.DoesNotExist:
        return Response({"detail": "Student not found"}, status=404)
    except Course.DoesNotExist:
        return Response({"detail": "Course not found"}, status=404)


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


# --------------------------
# Admin: Get Excuse Requests
# --------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_excuse_requests(request):
    if not hasattr(request.user, 'adminprofile'):
        return Response({"detail": "Admin access only"}, status=403)
    
    from .models import ExcuseRequest
    requests = ExcuseRequest.objects.all().order_by('-created_at')
    data = [{
        'id': r.id,
        'student_name': r.student_name,
        'matric_number': r.matric_number,
        'course_code': r.course_code,
        'excuse_file': r.excuse_file.url if r.excuse_file else None,
        'submitted_by': r.submitted_by.get_full_name(),
        'status': r.status,
        'created_at': r.created_at
    } for r in requests]
    return Response(data)


# --------------------------
# Admin: Cancel Excuse
# --------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_excuse(request, excuse_id):
    if not hasattr(request.user, 'adminprofile'):
        return Response({"detail": "Admin access only"}, status=403)
    
    from .models import ExcuseRequest
    try:
        excuse = ExcuseRequest.objects.get(id=excuse_id)
        if excuse.attendance_record:
            excuse.attendance_record.status = 'absent'
            excuse.attendance_record.save()
        excuse.status = 'rejected'
        excuse.save()
        return Response({"message": "Excuse cancelled and attendance reverted to absent"})
    except ExcuseRequest.DoesNotExist:
        return Response({"detail": "Excuse request not found"}, status=404)
