from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
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

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    
    if request.method == 'PUT':
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.email = request.data.get('email', user.email)
        user.save()
        
        if hasattr(user, 'studentprofile'):
            user.studentprofile.phone_number = request.data.get('phone_number', user.studentprofile.phone_number)
            user.studentprofile.save()
        elif hasattr(user, 'lecturerprofile'):
            user.lecturerprofile.phone_number = request.data.get('phone_number', user.lecturerprofile.phone_number)
            user.lecturerprofile.save()
        
        return Response({'message': 'Profile updated'})
    
    profile_data = {
        'user': {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }
    }
    
    if hasattr(user, 'studentprofile'):
        profile = user.studentprofile
        profile_data.update({
            'matric_number': profile.matric_number,
            'level': profile.level,
            'department': {'name': profile.department},
            'school': {'name': profile.school.name},
            'phone_number': profile.phone_number
        })
    elif hasattr(user, 'lecturerprofile'):
        profile = user.lecturerprofile
        profile_data.update({
            'staff_id': profile.staff_id,
            'department': {'name': profile.department.name if profile.department else 'N/A'},
            'school': {'name': profile.school.name},
            'phone_number': profile.phone_number
        })
    elif hasattr(user, 'adminprofile'):
        profile = user.adminprofile
        profile_data.update({
            'school': {'name': profile.school.name},
            'phone_number': getattr(profile, 'phone_number', None)
        })
    
    return Response(profile_data)