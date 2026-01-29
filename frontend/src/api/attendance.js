// src/api/attendance.js
import axios from "axios";

// Base URL for your backend
const API_BASE = "http://localhost:8000/api/attendance/";

export const generatePIN = async (courseId, startTime, endTime, token) => {
  try {
    const res = await axios.post(
      `${API_BASE}generate-pin/`,
      { course_id: courseId, start_time: startTime, end_time: endTime },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    throw err.response ? err.response.data : err;
  }
};
