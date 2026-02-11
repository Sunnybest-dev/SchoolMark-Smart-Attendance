import { useState, useEffect } from 'react';
import { Users, BookOpen, School, TrendingUp, LogOut, Plus } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard({ onLogout }) {
  const [stats, setStats] = useState({ totalStudents: 0, totalLecturers: 0, totalCourses: 0, avgAttendance: 0 });
  const [courses, setCourses] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:8000/api/analytics/admin/lecturer-compliance/', {
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-blue-600">SchoolMark Admin</h1>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600 mt-1">Manage your school system</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5" />
            Add Course
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lecturers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalLecturers}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <School className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Attendance</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgAttendance}%</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Pending Approvals</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending approvals</p>
                ) : (
                  pendingUsers.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Approve</button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
