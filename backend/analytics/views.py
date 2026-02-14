from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .admin_services import lecturers_with_incomplete_classes
from .admin_serializers import LecturerComplianceSerializer

from .serializers import (
    StudentDashboardSerializer,
    LecturerDashboardSerializer
)
from .services import (
    get_student_dashboard,
    get_lecturer_dashboard,
    get_admin_dashboard
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    student = request.user.studentprofile
    data = get_student_dashboard(student)
    
    total_present = sum(1 for c in data if c.get('attendance_percent', 0) >= 75)
    total_absent = len(data) - total_present
    overall = sum(c.get('attendance_percent', 0) for c in data) / len(data) if data else 0
    
    return Response({
        'courses': data,
        'total_present': total_present,
        'total_absent': total_absent,
        'overall_percentage': round(overall, 2)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lecturer_dashboard(request):
    lecturer = request.user.lecturerprofile
    data = get_lecturer_dashboard(lecturer)
    
    total_sessions = sum(c['classes_held'] for c in data)
    avg_completion = sum(c['completion_percent'] for c in data) / len(data) if data else 0
    
    return Response({
        'courses': data,
        'total_sessions': total_sessions,
        'avg_completion': round(avg_completion, 2)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if not hasattr(request.user, 'adminprofile'):
        return Response({"detail": "Admin access only"}, status=403)
    
    admin = request.user.adminprofile
    data = get_admin_dashboard(admin.school)
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_lecturer_compliance(request):
    school = request.user.adminprofile.school
    data = lecturers_with_incomplete_classes(school)
    serializer = LecturerComplianceSerializer(data, many=True)
    return Response(serializer.data)
