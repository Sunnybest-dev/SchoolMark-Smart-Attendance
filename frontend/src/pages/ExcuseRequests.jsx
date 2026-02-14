import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';

export default function ExcuseRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch('http://localhost:8000/api/attendance/excuse-requests/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this excuse and revert attendance to absent?')) return;
    
    const token = localStorage.getItem('access_token');
    const res = await fetch(`http://localhost:8000/api/attendance/cancel-excuse/${id}/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.ok) {
      fetchRequests();
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Excuse Requests</h2>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matric No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map(req => (
                <tr key={req.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{req.student_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{req.matric_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{req.course_code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{req.submitted_by}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-800' : req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {req.excuse_file && (
                      <a href={`http://localhost:8000${req.excuse_file}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        View
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {req.status === 'approved' && (
                      <button onClick={() => handleCancel(req.id)} className="flex items-center gap-1 text-red-600 hover:text-red-800">
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
