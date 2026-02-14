import { useState, useEffect } from 'react';
import { Users, BookOpen, School, TrendingUp } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard({ onLogout }) {
  const [stats, setStats] = useState({ totalStudents: 0, totalLecturers: 0, totalCourses: 0, avgAttendance: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get('http://localhost:8000/api/analytics/admin/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats({
        totalStudents: res.data.total_students || 0,
        totalLecturers: res.data.total_lecturers || 0,
        totalCourses: res.data.total_courses || 0,
        avgAttendance: res.data.avg_attendance || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your school system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lecturers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalLecturers}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <School className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Attendance</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgAttendance}%</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
