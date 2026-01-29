import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await axios.get(
          "http://localhost:8000/api/attendance/dashboard/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCourses(res.data); // store response in state
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div>
      <h2>My Courses & Attendance</h2>
      <ul>
        {courses.map((c) => (
          <li key={c.course_code}>
            {c.course_code} - {c.course_title} : {c.attendance_percent}%
          </li>
        ))}
      </ul>
    </div>
  );
}
