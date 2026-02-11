import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ course_code: '', course_title: '', duration_years: 4 });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:8000/api/analytics/admin/courses/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch (error) {
      console.error('Error fetching courses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://localhost:8000/api/analytics/admin/create-course/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      setFormData({ course_code: '', course_title: '', duration_years: 4 });
      fetchCourses();
    } catch (error) {
      alert('Failed to create course');
    }
  };

  const deleteCourse = async (id) => {
    if (confirm('Delete this course?')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`http://localhost:8000/api/analytics/admin/delete-course/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCourses();
      } catch (error) {
        alert('Failed to delete course');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => window.history.back()} className="mb-4 flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5 mr-2" />Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2">
              <Plus className="h-5 w-5" />{showForm ? 'Cancel' : 'Add Course'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-blue-50 p-6 rounded-xl mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Course Code</label>
                  <input type="text" value={formData.course_code} onChange={(e) => setFormData({...formData, course_code: e.target.value})} required className="w-full px-4 py-3 border-2 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Duration (Years)</label>
                  <input type="number" value={formData.duration_years} onChange={(e) => setFormData({...formData, duration_years: e.target.value})} required className="w-full px-4 py-3 border-2 rounded-xl" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Course Title</label>
                <input type="text" value={formData.course_title} onChange={(e) => setFormData({...formData, course_title: e.target.value})} required className="w-full px-4 py-3 border-2 rounded-xl" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">Create Course</button>
            </form>
          )}

          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div>
                  <h3 className="font-bold text-lg">{course.course_code}</h3>
                  <p className="text-gray-600">{course.course_title}</p>
                  <p className="text-sm text-gray-500">{course.duration_years} years</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Edit className="h-5 w-5" /></button>
                  <button onClick={() => deleteCourse(course.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 className="h-5 w-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
