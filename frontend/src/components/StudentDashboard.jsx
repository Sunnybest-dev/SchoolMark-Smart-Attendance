import { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, BookOpen, LogOut } from 'lucide-react';
import axios from 'axios';

export default function StudentDashboard({ onLogout }) {
  const [stats, setStats] = useState({ totalCourses: 0, avgAttendance: 0, present: 0, absent: 0 });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:8000/api/analytics/student/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data.courses || []);
      setStats({
        totalCourses: res.data.courses?.length || 0,
        avgAttendance: res.data.overall_percentage || 0,
        present: res.data.total_present || 0,
        absent: res.data.total_absent || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-blue-600">SchoolMark</h1>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </nav> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Student Dashboard</h2>
          <p className="text-gray-600 mt-1">Track your attendance and performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Attendance</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgAttendance}%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.present}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.absent}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">My Courses</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {courses.map((course, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div>
                    <h4 className="font-semibold text-gray-900">{course.course_code}</h4>
                    <p className="text-sm text-gray-600">{course.course_title}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${course.attendance_percent >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                      {course.attendance_percent}%
                    </p>
                    <p className="text-xs text-gray-500">{course.present}/{course.total} classes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
