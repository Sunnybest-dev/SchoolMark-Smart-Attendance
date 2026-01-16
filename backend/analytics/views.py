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
    get_lecturer_dashboard
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    student = request.user.studentprofile
    data = get_student_dashboard(student)
    serializer = StudentDashboardSerializer(data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lecturer_dashboard(request):
    lecturer = request.user.lecturerprofile
    data = get_lecturer_dashboard(lecturer)
    serializer = LecturerDashboardSerializer(data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_lecturer_compliance(request):
    school = request.user.adminprofile.school
    data = lecturers_with_incomplete_classes(school)
    serializer = LecturerComplianceSerializer(data, many=True)
    return Response(serializer.data)
