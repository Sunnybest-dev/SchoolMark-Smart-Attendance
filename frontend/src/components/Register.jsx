import { useState, useEffect } from "react";
import { UserPlus, School, User, GraduationCap } from 'lucide-react';
import axios from "axios";

export default function Register({ onRegister }) {
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolAbbreviation, setSchoolAbbreviation] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [schools, setSchools] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === 'student') {
      fetchSchools();
    }
  }, [role]);

  const fetchSchools = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/accounts/schools/');
      setSchools(res.data);
    } catch (error) {
      console.error('Error fetching schools');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/accounts/register/", {
        username,
        email,
        password,
        role,
        first_name: firstName,
        last_name: lastName,
        school_name: schoolName,
        school_abbreviation: schoolAbbreviation,
        selected_school: selectedSchool,
        matric_number: matricNumber,
        department,
        level
      });

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        if (onRegister) onRegister();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600 text-lg">Join SchoolMark Attendance System</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">I am a:</label>
              <div className="grid grid-cols-3 gap-3">
                {[{value: 'student', label: 'Student', icon: GraduationCap}, 
                  {value: 'lecturer', label: 'Lecturer', icon: User}, 
                  {value: 'admin', label: 'Admin', icon: School}].map(({value, label, icon: Icon}) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      role === value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-semibold text-sm">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none" />
              </div>
            </div>

            {role === 'student' && (
              <div className="bg-blue-50 p-4 rounded-xl space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select School</label>
                  <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)} required className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none">
                    <option value="">Choose a school</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Matric Number</label>
                    <input type="text" value={matricNumber} onChange={(e) => setMatricNumber(e.target.value)} required className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
                    <select value={level} onChange={(e) => setLevel(e.target.value)} required className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none">
                      <option value="">Select level</option>
                      <option value="100">100</option>
                      <option value="200">200</option>
                      <option value="300">300</option>
                      <option value="400">400</option>
                      <option value="500">500</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} required className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none" />
                </div>
              </div>
            )}

            {role === 'admin' && (
              <div className="grid grid-cols-2 gap-4 bg-indigo-50 p-4 rounded-xl">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">School Name</label>
                  <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">School Code</label>
                  <input type="text" placeholder="e.g. FUTO" value={schoolAbbreviation} onChange={(e) => setSchoolAbbreviation(e.target.value)} required className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none" />
              </div>
            </div>

            {error && <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}
            {success && <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">{success}</div>}

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          © 2024 SchoolMark. All rights reserved.
        </p>
      </div>
    </div>
  );
}
