def lecturers_with_incomplete_classes(school):
    report = []

    for course in school.courses.all():
        if course.classes_held() < course.total_classes_set:
            lecturer = course.lecturer
            report.append({
                'lecturer_name': lecturer.user.get_full_name(),
                'course_code': course.course_code,
                'classes_held': course.classes_held(),
                'expected_classes': course.total_classes_set
            })

    return report
