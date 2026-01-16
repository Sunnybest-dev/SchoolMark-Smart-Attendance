from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from schools.models import Course
from .services import generate_attendance_pin, upload_excuse


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_pin(request):
    course_id = request.data.get('course_id')

    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response(
            {"detail": "Course not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        session = generate_attendance_pin(course, request.user.lecturerprofile)
    except PermissionError as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_403_FORBIDDEN
        )

    return Response({
        "message": "Attendance PIN generated",
        "pin": session.pin
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_student_attendance(request):
    pin = request.data.get('pin')
    verified_by = request.data.get('verified_by', 'face')  # default face
    student = request.user.studentprofile

    if not pin:
        return Response({"detail": "PIN is required"}, status=400)

    try:
        record = mark_attendance(student, pin, verified_by)
    except ValueError as e:
        return Response({"detail": str(e)}, status=400)

    return Response({
        "message": "Attendance marked successfully",
        "course": record.session.course.course_code,
        "status": record.status
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_excuse_file(request):
    """
    Lecturer uploads an excuse for a student
    """
    student_id = request.data.get('student_id')
    session_id = request.data.get('session_id')
    file = request.FILES.get('file')

    if not student_id or not session_id or not file:
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
