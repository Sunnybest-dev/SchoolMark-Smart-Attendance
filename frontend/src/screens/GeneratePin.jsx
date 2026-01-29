import { useState } from "react";
import { generatePIN } from "../api/attendance";

export default function GeneratePin({ token }) {
  const [courseId, setCourseId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [pin, setPin] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    try {
      setError(null);
      const data = await generatePIN(courseId, startTime, endTime, token);
      setPin(data.pin);
    } catch (err) {
      setError(err.detail || "Failed to generate PIN");
    }
  };

  return (
    <div className="container">
      <h2>Generate Attendance PIN</h2>
      <input
        type="text"
        placeholder="Course ID"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
      />
      <input
        type="time"
        placeholder="Start Time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      <input
        type="time"
        placeholder="End Time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
      <button onClick={handleGenerate}>Generate PIN</button>

      {pin && <p>PIN: <strong>{pin}</strong></p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
