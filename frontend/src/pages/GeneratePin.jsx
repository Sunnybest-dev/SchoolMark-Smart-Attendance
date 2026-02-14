import { useState, useEffect } from 'react';
import { QrCode, Copy, X, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function GeneratePin() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [radius, setRadius] = useState(50);
  const [pin, setPin] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:8000/api/analytics/lecturer/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error.response?.data);
    }
  };

  const generatePin = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const token = localStorage.getItem('accessToken');
      const res = await axios.post('http://localhost:8000/api/attendance/generate-pin/', {
        course_id: selectedCourse,
        lecturer_latitude: position.coords.latitude,
        lecturer_longitude: position.coords.longitude,
        radius: radius
      }, { headers: { Authorization: `Bearer ${token}` } });
      setPin(res.data.pin);
      setSessionActive(true);
    } catch (error) {
      console.error('Generate PIN error:', error.response?.data);
      alert(error.response?.data?.detail || 'Failed to generate PIN');
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`http://localhost:8000/api/attendance/close/${pin}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessionActive(false);
      setPin('');
    } catch (error) {
      alert('Failed to close session');
    }
  };

  const copyPin = () => {
    navigator.clipboard.writeText(pin);
    alert('PIN copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => window.history.back()} className="mb-4 flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5 mr-2" />Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Generate Attendance PIN</h1>

          {!sessionActive ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Course</label>
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full px-4 py-3 border-2 rounded-xl mb-4">
                <option value="">Choose a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.course_code} - {course.course_title}</option>
                ))}
              </select>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Attendance Radius: {radius}m</label>
              <input type="range" value={radius} onChange={(e) => setRadius(e.target.value)} min="10" max="500" step="10" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2" />
              <div className="flex justify-between text-xs text-gray-500 mb-6">
                <span>10m</span>
                <span>500m</span>
              </div>
              <button onClick={generatePin} disabled={!selectedCourse || loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50">
                {loading ? 'Generating...' : 'Generate PIN'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 mb-6">
                <QrCode className="h-16 w-16 mx-auto text-purple-600 mb-4" />
                <p className="text-sm text-gray-600 mb-2">Attendance PIN</p>
                <div className="text-6xl font-bold text-gray-900 mb-4 font-mono">{pin}</div>
                <button onClick={copyPin} className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition">
                  <Copy className="h-5 w-5" />Copy PIN
                </button>
              </div>
              <button onClick={closeSession} className="w-full bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                <X className="h-5 w-5" />Close Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
