import { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, Plus, LogOut } from 'lucide-react';
import axios from 'axios';

export default function LecturerDashboard({ onLogout }) {
  const [stats, setStats] = useState({ totalCourses: 0, totalSessions: 0, avgCompletion: 0 });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get('http://localhost:8000/api/analytics/lecturer/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data.courses || []);
      setStats({
        totalCourses: res.data.courses?.length || 0,
        totalSessions: res.data.total_sessions || 0,
        avgCompletion: res.data.avg_completion || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Lecturer Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your courses and attendance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalSessions}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgCompletion}%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl">
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-900">My Courses</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div>
                    <h4 className="font-semibold text-gray-900">{course.course_code}</h4>
                    <p className="text-sm text-gray-600">{course.course_title}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Classes</p>
                      <p className="text-lg font-bold text-gray-900">{course.classes_held}/{course.total_classes_set}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Completion</p>
                      <p className="text-lg font-bold text-gray-900">{course.completion_percent}%</p>
                    </div>
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
