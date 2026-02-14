import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    course_code: '',
    course_title: '',
    department: '',
    level: '',
    total_classes_set: 30
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch('http://localhost:8000/api/courses/list/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setCourses(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const res = await fetch('http://localhost:8000/api/courses/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    alert(data.message || 'Course created');
    setShowForm(false);
    setFormData({ course_code: '', course_title: '', department: '', level: '', total_classes_set: 30 });
    fetchCourses();
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course? All enrollments will be removed.')) return;
    const token = localStorage.getItem('access_token');
    await fetch(`http://localhost:8000/api/courses/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCourses();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700">
              <Plus className="h-5 w-5" />{showForm ? 'Cancel' : 'Add Course'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-blue-50 p-6 rounded-xl mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Course Code</label>
                  <input type="text" value={formData.course_code} onChange={(e) => setFormData({...formData, course_code: e.target.value})} required className="w-full px-4 py-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Total Classes</label>
                  <input type="number" value={formData.total_classes_set} onChange={(e) => setFormData({...formData, total_classes_set: e.target.value})} required className="w-full px-4 py-3 border rounded-xl" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Course Title</label>
                <input type="text" value={formData.course_title} onChange={(e) => setFormData({...formData, course_title: e.target.value})} required className="w-full px-4 py-3 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Department</label>
                  <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} placeholder="e.g. Computer Science" required className="w-full px-4 py-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Level</label>
                  <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} required className="w-full px-4 py-3 border rounded-xl">
                    <option value="">Select Level</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">Create Course</button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-600 border-b">
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Level</th>
                  <th className="pb-3">Enrolled</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id} className="border-t">
                    <td className="py-4 font-semibold">{course.course_code}</td>
                    <td className="py-4">{course.course_title}</td>
                    <td className="py-4 text-sm text-gray-600">{course.department}</td>
                    <td className="py-4 text-sm text-gray-600">{course.level}</td>
                    <td className="py-4 text-sm text-gray-600">{course.enrolled_count} students</td>
                    <td className="py-4">
                      <button onClick={() => deleteCourse(course.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
