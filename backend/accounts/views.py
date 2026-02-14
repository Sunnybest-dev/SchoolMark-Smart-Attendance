from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import UserProfile, StudentProfile, AdminProfile, LecturerProfile
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
        elif data.get('role') == 'lecturer':
            school = School.objects.get(id=data.get('selected_school'))
            lecturer_count = LecturerProfile.objects.filter(school=school).count() + 1
            staff_id = f"{school.short_name}-{lecturer_count:04d}"
            
            LecturerProfile.objects.create(
                user=user,
                school=school,
                staff_id=staff_id,
                department=data.get('department', ''),
                phone_number=data.get('phone_number', '')
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
    try:
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
                'department': profile.department,
                'school': {'name': profile.school.name},
                'phone_number': profile.phone_number
            })
        elif hasattr(user, 'lecturerprofile'):
            profile = user.lecturerprofile
            profile_data.update({
                'staff_id': profile.staff_id,
                'department': profile.department or 'N/A',
                'school': {'name': profile.school.name},
                'phone_number': profile.phone_number or 'N/A'
            })
        elif hasattr(user, 'adminprofile'):
            profile = user.adminprofile
            profile_data.update({
                'school': {'name': profile.school.name},
                'phone_number': getattr(profile, 'phone_number', None)
            })
        
        return Response(profile_data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    if not hasattr(request.user, 'adminprofile'):
        return Response({"detail": "Admin access only"}, status=403)
    
    school = request.user.adminprofile.school
    students = StudentProfile.objects.all().select_related('user', 'school')
    lecturers = LecturerProfile.objects.all().select_related('user', 'school')
    courses = Course.objects.filter(school=school)
    
    data = {
        'students': [{
            'id': s.user.id,
            'name': s.user.get_full_name(),
            'email': s.user.email,
            'matric_number': s.matric_number,
            'department': s.department,
            'level': s.level,
            'school': s.school.name
        } for s in students],
        'lecturers': [{
            'id': l.user.id,
            'name': l.user.get_full_name(),
            'email': l.user.email,
            'staff_id': l.staff_id,
            'department': l.department,
            'school': l.school.name
        } for l in lecturers],
        'courses': [{
            'id': c.id,
            'course_code': c.course_code,
            'course_title': c.course_title
        } for c in courses]
    }
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_course(request):
    if not hasattr(request.user, 'adminprofile'):
        return Response({"detail": "Admin access only"}, status=403)
    
    course_id = request.data.get('course_id')
    user_id = request.data.get('user_id')
    user_type = request.data.get('user_type')  # 'student' or 'lecturer'
    
    try:
        course = Course.objects.get(id=course_id)
        user = User.objects.get(id=user_id)
        
        if user_type == 'lecturer':
            course.lecturer = user
            course.save()
            return Response({'message': 'Course assigned to lecturer'})
        elif user_type == 'student':
            Enrollment.objects.get_or_create(
                student=user,
                course=course,
                defaults={'level': user.studentprofile.level}
            )
            return Response({'message': 'Student enrolled in course'})
        else:
            return Response({'detail': 'Invalid user_type'}, status=400)
    except Course.DoesNotExist:
        return Response({'detail': 'Course not found'}, status=404)
    except User.DoesNotExist:
        return Response({'detail': 'User not found'}, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])
def debug_users(request):
    """Debug endpoint to see all users by school"""
    from schools.models import School
    schools = School.objects.all()
    data = {}
    
    for school in schools:
        students = StudentProfile.objects.filter(school=school).select_related('user')
        lecturers = LecturerProfile.objects.filter(school=school).select_related('user')
        
        data[school.name] = {
            'school_id': school.id,
            'students': [{
                'name': f"{s.user.first_name} {s.user.last_name}",
                'username': s.user.username,
                'matric': s.matric_number
            } for s in students],
            'lecturers': [{
                'name': f"{l.user.first_name} {l.user.last_name}",
                'username': l.user.username,
                'staff_id': l.staff_id
            } for l in lecturers]
        }
    
    return Response(data)