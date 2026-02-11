from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import School, Course

@api_view(['GET'])
@permission_classes([AllowAny])
def get_schools(request):
    schools = School.objects.filter(is_active=True)
    data = [{
        'id': school.id,
        'name': school.name,
        'short_name': school.short_name
    } for school in schools]
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_school_courses(request, school_id):
    courses = Course.objects.filter(school_id=school_id)
    data = [{
        'id': course.id,
        'course_code': course.course_code,
        'course_title': course.course_title,
        'duration_years': course.duration_years
    } for course in courses]
    return Response(data)
