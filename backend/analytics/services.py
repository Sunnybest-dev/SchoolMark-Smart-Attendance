from accounts.models import StudentProfile
from attendance.services import get_attendance_percentage

def get_student_dashboard(student):
    """Return list of courses, attendance %, eligibility for student"""
    from attendance.models import AttendanceRecord
    data = []
    enrollments = student.user.enrollments.all()
    for e in enrollments:
        course = e.course
        total_sessions = course.attendance_sessions.count()
        present_count = AttendanceRecord.objects.filter(
            student=student,
            session__course=course,
            status='present'
        ).count()
        attendance_percent = round((present_count / total_sessions * 100), 2) if total_sessions > 0 else 0
        
        data.append({
            'course_code': course.course_code,
            'course_title': course.course_title,
            'attendance_percent': attendance_percent,
            'present': present_count,
            'total': total_sessions,
            'eligible': attendance_percent >= 75
        })
    return data


def get_lecturer_dashboard(lecturer):
    """Return courses and completion stats for lecturer"""
    courses = lecturer.user.assigned_courses.all()
    data = []
    for course in courses:
        total_classes_set = course.total_classes_set
        classes_held = course.classes_held()
        completion = course.completion_percentage()
        data.append({
            'id': course.id,
            'course_code': course.course_code,
            'course_title': course.course_title,
            'total_classes_set': total_classes_set,
            'classes_held': classes_held,
            'completion_percent': completion
        })
    return data


def get_admin_dashboard(school):
    """Return admin dashboard statistics"""
    from accounts.models import StudentProfile, LecturerProfile
    from schools.models import Course
    from attendance.models import AttendanceRecord
    
    total_students = StudentProfile.objects.filter(school=school).count()
    total_lecturers = LecturerProfile.objects.filter(school=school).count()
    total_courses = Course.objects.filter(school=school).count()
    
    # Calculate average attendance across all courses
    all_records = AttendanceRecord.objects.filter(session__course__school=school)
    present_count = all_records.filter(status='present').count()
    total_count = all_records.count()
    avg_attendance = round((present_count / total_count * 100), 2) if total_count > 0 else 0
    
    return {
        'total_students': total_students,
        'total_lecturers': total_lecturers,
        'total_courses': total_courses,
        'avg_attendance': avg_attendance
    }
