from django.contrib import admin
from .models import School, Course
from .models import School, Course, Enrollment


admin.site.register(School)
admin.site.register(Course)
admin.site.register(Enrollment)

