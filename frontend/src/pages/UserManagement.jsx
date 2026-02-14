import { useState, useEffect } from 'react';
import { UserPlus, BookOpen, RefreshCw } from 'lucide-react';

export default function UserManagement() {
  const [students, setStudents] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token:', token ? 'exists' : 'missing');
      
      const res = await fetch('http://localhost:8000/api/users/', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-cache'
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const text = await res.text();
        console.error('Error response:', text);
        alert(`Error ${res.status}: Check console for details`);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      console.log('Response data:', data);
      
      setStudents(data.students || []);
      setLecturers(data.lecturers || []);
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Network error: Make sure Django server is running on port 8000');
    }
    setLoading(false);
  };

  const handleAssign = async () => {
    const token = localStorage.getItem('access_token');
    await fetch('http://localhost:8000/api/assign-course/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: selectedUser.id,
        course_id: selectedCourse,
        user_type: userType
      })
    });
    setShowAssignModal(false);
    fetchUsers();
  };

  const openAssignModal = (user, type) => {
    setSelectedUser(user);
    setUserType(type);
    setShowAssignModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <button onClick={fetchUsers} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Students ({students.length})</h3>
            </div>
            <div className="p-6 overflow-x-auto">
              {students.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No students registered</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Matric No</th>
                      <th className="pb-3">School</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id} className="border-t">
                        <td className="py-3">{s.name}</td>
                        <td className="py-3">{s.matric_number}</td>
                        <td className="py-3 text-sm text-gray-600">{s.school}</td>
                        <td className="py-3">
                          <button onClick={() => openAssignModal(s, 'student')} className="text-blue-600 hover:underline flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            Enroll
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Lecturers ({lecturers.length})</h3>
            </div>
            <div className="p-6 overflow-x-auto">
              {lecturers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No lecturers registered</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Staff ID</th>
                      <th className="pb-3">School</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecturers.map(l => (
                      <tr key={l.id} className="border-t">
                        <td className="py-3">{l.name}</td>
                        <td className="py-3">{l.staff_id}</td>
                        <td className="py-3 text-sm text-gray-600">{l.school}</td>
                        <td className="py-3">
                          <button onClick={() => openAssignModal(l, 'lecturer')} className="text-blue-600 hover:underline flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Assign Course</h3>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full px-4 py-3 border rounded-xl mb-4">
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.course_code} - {c.course_title}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowAssignModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-xl">Cancel</button>
              <button onClick={handleAssign} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
