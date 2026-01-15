from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
