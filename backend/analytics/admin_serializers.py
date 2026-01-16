from rest_framework import serializers

class LecturerComplianceSerializer(serializers.Serializer):
    lecturer_name = serializers.CharField()
    course_code = serializers.CharField()
    classes_held = serializers.IntegerField()
    expected_classes = serializers.IntegerField()
