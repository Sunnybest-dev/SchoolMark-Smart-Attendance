import { useState } from 'react';
import { Upload, Search } from 'lucide-react';

export default function ExcuseManagement() {
  const [matricNumber, setMatricNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!matricNumber || !studentName || !courseCode || !file) {
      setMessage('All fields are required');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('matric_number', matricNumber);
    formData.append('student_name', studentName);
    formData.append('course_code', courseCode);
    formData.append('file', file);

    const token = localStorage.getItem('access_token');
    const res = await fetch('http://localhost:8000/api/attendance/upload-excuse/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();
    setLoading(false);
    setMessage(res.ok ? 'Excuse submitted successfully. Student marked present.' : data.detail || 'Submission failed');
    if (res.ok) {
      setMatricNumber('');
      setStudentName('');
      setCourseCode('');
      setFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Submit Excuse</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter student full name" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Matric Number</label>
              <input type="text" value={matricNumber} onChange={(e) => setMatricNumber(e.target.value)} placeholder="Enter matric number" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
              <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. CSC301" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Excuse Document</label>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            {message && (
              <div className={`p-4 rounded-xl ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50">
              <Upload className="h-5 w-5" />
              {loading ? 'Submitting...' : 'Submit Excuse'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
