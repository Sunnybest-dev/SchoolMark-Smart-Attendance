from accounts.models import StudentProfile
from schools.models import Course

def get_student_dashboard(student):
    data = []
    enrollments = student.enrollments.all()
    for e in enrollments:
        course = e.course
        attendance_percent = student.get_attendance_percentage(course)
        eligibility = student.is_eligible(course)
        data.append({
            'course_code': course.course_code,
            'course_title': course.course_title,
            'attendance_percent': attendance_percent,
            'eligible': eligibility
        })
    return data

def get_lecturer_dashboard(lecturer):
    courses = lecturer.assigned_courses.all()
    data = []
    for course in courses:
        total_classes_set = course.total_classes_set
        classes_held = course.classes_held()
        completion = course.completion_percentage()
        data.append({
            'course_code': course.course_code,
            'course_title': course.course_title,
            'total_classes_set': total_classes_set,
            'classes_held': classes_held,
            'completion_percent': completion
        })
    return data
