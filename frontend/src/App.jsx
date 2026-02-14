import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./screens/Login";
import Register from "./components/Register";
import StudentDashboard from "./components/StudentDashboard";
import LecturerDashboard from "./components/LecturerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import MarkAttendance from "./pages/MarkAttendance";
import GeneratePin from "./pages/GeneratePin";
import CourseManagement from "./pages/CourseManagement";
import StudentProfile from "./pages/StudentProfile";
import LecturerProfile from "./pages/LecturerProfile";
import AdminProfile from "./pages/AdminProfile";
import AttendanceHistory from "./pages/AttendanceHistory";
import ExcuseManagement from "./pages/ExcuseManagement";
import ExcuseRequests from "./pages/ExcuseRequests";
import UserManagement from "./pages/UserManagement";
import Navbar from "./components/Navbar";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const [showRegister, setShowRegister] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "student");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userRole");
    setLoggedIn(false);
  };

  const handleLogin = (role) => {
    setLoggedIn(true);
    setUserRole(role);
    localStorage.setItem("userRole", role);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {loggedIn ? (
          <>
            <Navbar user={{ role: userRole }} onLogout={handleLogout} />
            <Routes>
              <Route path="/student" element={userRole === 'student' ? <StudentDashboard onLogout={handleLogout} /> : <Navigate to="/" />} />
              <Route path="/student/mark-attendance" element={userRole === 'student' ? <MarkAttendance /> : <Navigate to="/" />} />
              <Route path="/student/history" element={userRole === 'student' ? <AttendanceHistory /> : <Navigate to="/" />} />
              <Route path="/student/profile" element={userRole === 'student' ? <StudentProfile /> : <Navigate to="/" />} />
              <Route path="/lecturer" element={userRole === 'lecturer' ? <LecturerDashboard onLogout={handleLogout} /> : <Navigate to="/" />} />
              <Route path="/lecturer/generate-pin" element={userRole === 'lecturer' ? <GeneratePin /> : <Navigate to="/" />} />
              <Route path="/lecturer/excuse" element={userRole === 'lecturer' ? <ExcuseManagement /> : <Navigate to="/" />} />
              <Route path="/lecturer/profile" element={userRole === 'lecturer' ? <LecturerProfile /> : <Navigate to="/" />} />
              <Route path="/admin" element={userRole === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/" />} />
              <Route path="/admin/courses" element={userRole === 'admin' ? <CourseManagement /> : <Navigate to="/" />} />
              <Route path="/admin/excuses" element={userRole === 'admin' ? <ExcuseRequests /> : <Navigate to="/" />} />
              <Route path="/admin/users" element={userRole === 'admin' ? <UserManagement /> : <Navigate to="/" />} />
              <Route path="/admin/profile" element={userRole === 'admin' ? <AdminProfile /> : <Navigate to="/" />} />
              <Route path="/" element={<Navigate to={`/${userRole}`} />} />
            </Routes>
          </>
        ) : showRegister ? (
          <>
            <Register onRegister={() => setShowRegister(false)} />
            <div className="fixed bottom-8 left-0 right-0 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button onClick={() => setShowRegister(false)} className="text-blue-600 font-semibold hover:underline">
                  Sign In
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <Login onLogin={handleLogin} />
            <div className="fixed bottom-8 left-0 right-0 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button onClick={() => setShowRegister(true)} className="text-blue-600 font-semibold hover:underline">
                  Register
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
