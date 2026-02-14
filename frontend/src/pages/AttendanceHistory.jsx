import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';

export default function AttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:8000/api/attendance/history/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching history:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => window.history.back()} className="mb-4 flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5 mr-2" />Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Attendance History
          </h1>

          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No attendance records found</p>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{record.course_code} - {record.course_title}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        {new Date(record.marked_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.status === 'present' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-semibold">Present</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl">
                          <XCircle className="h-5 w-5" />
                          <span className="font-semibold">Absent</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
