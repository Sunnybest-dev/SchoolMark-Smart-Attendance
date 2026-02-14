import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, ArrowLeft, Edit2, Save, X } from 'lucide-react';
import axios from 'axios';

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:8000/api/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setFormData({
        first_name: res.data.user.first_name,
        last_name: res.data.user.last_name,
        email: res.data.user.email,
        phone_number: res.data.phone_number || ''
      });
    } catch (error) {
      console.error('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put('http://localhost:8000/api/profile/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchProfile();
      setEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => window.history.back()} className="mb-4 flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5 mr-2" />Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <Shield className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile?.user?.first_name} {profile?.user?.last_name}</h1>
                <p className="text-gray-600">Administrator</p>
              </div>
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
                <Edit2 className="h-4 w-4" />Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
                  <Save className="h-4 w-4" />Save
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700">
                  <X className="h-4 w-4" />Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Mail className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Email</p>
                {editing ? (
                  <input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-2 py-1 border rounded" />
                ) : (
                  <p className="font-semibold">{profile?.user?.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Phone className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Phone</p>
                {editing ? (
                  <input value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="w-full px-2 py-1 border rounded" />
                ) : (
                  <p className="font-semibold">{profile?.phone_number || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl col-span-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">School</p>
                <p className="font-semibold">{profile?.school?.name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
