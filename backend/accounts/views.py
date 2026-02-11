from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import UserProfile, StudentProfile, AdminProfile
from schools.models import School, Course, Enrollment

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    
    try:
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )
        
        UserProfile.objects.create(
            user=user,
            role=data.get('role', 'student')
        )
        
        if data.get('role') == 'admin':
            school = School.objects.create(
                name=data['school_name'],
                short_name=data['school_abbreviation']
            )
            AdminProfile.objects.create(
                user=user,
                school=school
            )
        elif data.get('role') == 'student':
            student_profile = StudentProfile.objects.create(
                user=user,
                school_id=data['selected_school'],
                matric_number=data['matric_number'],
                department=data['department'],
                level=data['level']
            )
            
            if data.get('selected_course'):
                Enrollment.objects.create(
                    student=user,
                    course_id=data['selected_course'],
                    level=data['level']
                )
        
        return Response({"message": "Registration successful"}, status=201)
    except Exception as e:
        return Response({"detail": str(e)}, status=400)