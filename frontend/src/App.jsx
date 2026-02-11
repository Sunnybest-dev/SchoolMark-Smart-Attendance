import { useState } from "react";
import Login from "./screens/Login";
import Register from "./components/Register";
import StudentDashboard from "./components/StudentDashboard";
import LecturerDashboard from "./components/LecturerDashboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("accessToken"));
  const [showRegister, setShowRegister] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "student");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    setLoggedIn(false);
  };

  const handleLogin = (role) => {
    setLoggedIn(true);
    setUserRole(role);
    localStorage.setItem("userRole", role);
  };

  const renderDashboard = () => {
    switch(userRole) {
      case 'student':
        return <StudentDashboard onLogout={handleLogout} />;
      case 'lecturer':
        return <LecturerDashboard onLogout={handleLogout} />;
      case 'admin':
        return <AdminDashboard onLogout={handleLogout} />;
      default:
        return <StudentDashboard onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen">
      {loggedIn ? (
        renderDashboard()
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
  );
}

export default App;
