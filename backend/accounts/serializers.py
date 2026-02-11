from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.response import Response

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        try:
            from .models import UserProfile, StudentProfile, AdminProfile
            profile = UserProfile.objects.get(user=self.user)
            role = profile.role
            
            school_info = None
            if role == 'student':
                try:
                    student_profile = StudentProfile.objects.get(user=self.user)
                    school_info = {
                        'id': student_profile.school.id,
                        'name': student_profile.school.name,
                        'short_name': student_profile.school.short_name
                    }
                except StudentProfile.DoesNotExist:
                    pass
            elif role == 'admin':
                try:
                    admin_profile = AdminProfile.objects.get(user=self.user)
                    school_info = {
                        'id': admin_profile.school.id,
                        'name': admin_profile.school.name,
                        'short_name': admin_profile.school.short_name
                    }
                except AdminProfile.DoesNotExist:
                    pass
                    
        except Exception as e:
            role = 'student'
            school_info = None
            
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'firstName': self.user.first_name,
            'lastName': self.user.last_name,
            'role': role,
            'school': school_info,
        }
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except Exception as e:
            return Response(
                {'detail': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
