import { useState } from "react";
import Login from "./screens/Login";
import Register from "./components/Register";
import StudentDashboard from "./components/StudentDasboard";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("accessToken"));
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setLoggedIn(false);
  };

  return (
    <div className="App">
      {loggedIn ? (
        <>
          <button onClick={handleLogout}>Logout</button>
          <StudentDashboard />
        </>
      ) : showRegister ? (
        <>
          <Register onRegister={() => setShowRegister(false)} />
          <p>
            Already have an account?{" "}
            <button onClick={() => setShowRegister(false)}>Login</button>
          </p>
        </>
      ) : (
        <>
          <Login onLogin={() => setLoggedIn(true)} />
          <p>
            Don't have an account?{" "}
            <button onClick={() => setShowRegister(true)}>Register</button>
          </p>
        </>
      )}
    </div>
  );
}

export default App;
