from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import School, Course, Enrollment

@api_view(['GET'])
def get_schools(request):
    schools = School.objects.all()
    data = [{'id': s.id, 'name': s.name, 'short_name': s.short_name} for s in schools]
    
    # If requesting courses for a specific school
    school_id = request.GET.get('school_id')
    if school_id:
        courses = Course.objects.filter(school_id=school_id)
        return Response({
            'schools': data,
            'courses': [{'id': c.id, 'course_code': c.course_code, 'course_title': c.course_title} for c in courses]
        })
    
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course(request):
    if not hasattr(request.user, 'adminprofile'):
        return Response({"detail": "Admin access only"}, status=403)
    
    school = request.user.adminprofile.school
    course = Course.objects.create(
        school=school,
        course_code=request.data['course_code'],
        course_title=request.data['course_title'],
        department=request.data.get('department', ''),
        level=request.data.get('level', ''),
        total_classes_set=request.data.get('total_classes_set', 30)
    )
    
    # Auto-enroll students in same department and level
    from accounts.models import StudentProfile
    students = StudentProfile.objects.filter(
        school=school,
        department=course.department,
        level=course.level
    )
    
    for student in students:
        Enrollment.objects.get_or_create(
            student=student.user,
            course=course,
            defaults={'level': student.level}
        )
    
    return Response({'message': f'Course created and {students.count()} students enrolled'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_courses(request):
    if not hasattr(request.user, 'adminprofile'):
        return Response({"detail": "Admin access only"}, status=403)
    
    school = request.user.adminprofile.school
    courses = Course.objects.filter(school=school)
    data = [{
        'id': c.id,
        'course_code': c.course_code,
        'course_title': c.course_title,
        'department': c.department,
        'level': c.level,
        'enrolled_count': c.enrollments.count()
    } for c in courses]
    return Response(data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course(request, course_id):
    if not hasattr(request.user, 'adminprofile'):
        return Response({"detail": "Admin access only"}, status=403)
    
    try:
        course = Course.objects.get(id=course_id, school=request.user.adminprofile.school)
        course.delete()
        return Response({'message': 'Course deleted'})
    except Course.DoesNotExist:
        return Response({'detail': 'Course not found'}, status=404)
