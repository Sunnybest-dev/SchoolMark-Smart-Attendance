from rest_framework import serializers


class StudentDashboardSerializer(serializers.Serializer):
    course_code = serializers.CharField()
    course_title = serializers.CharField()
    attendance_percent = serializers.FloatField()
    eligible = serializers.BooleanField()


class LecturerDashboardSerializer(serializers.Serializer):
    course_code = serializers.CharField()
    course_title = serializers.CharField()
    total_classes_set = serializers.IntegerField()
    classes_held = serializers.IntegerField()
    completion_percent = serializers.FloatField()
