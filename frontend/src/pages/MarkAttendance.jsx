import { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

export default function MarkAttendance() {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState('');
  const [location, setLocation] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin.length === 6) setStep(2);
  };

  const verifyLocation = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      setStep(3);
    } catch (error) {
      alert('Location access denied');
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setCameraStarted(true);
  };

  const captureFace = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://localhost:8000/api/attendance/mark/', {
        pin, latitude: location.latitude, longitude: location.longitude, verified_by: 'face'
      }, { headers: { Authorization: `Bearer ${token}` } });
      setStep(4);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => window.history.back()} className="mb-4 flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5 mr-2" />Back
        </button>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div className="text-center">
              <MapPin className="h-16 w-16 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold mb-4">Enter PIN</h2>
              <form onSubmit={handlePinSubmit}>
                <input type="text" value={pin} onChange={(e) => setPin(e.target.value.toUpperCase())} maxLength={6} className="w-full text-center text-2xl font-mono px-4 py-3 border-2 rounded-xl mb-4" placeholder="XXXXXX" />
                {error && <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">Continue</button>
              </form>
            </div>
          )}
          {step === 2 && (
            <div className="text-center">
              <MapPin className="h-16 w-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold mb-4">Verify Location</h2>
              <button onClick={verifyLocation} disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold">{loading ? 'Verifying...' : 'Verify Location'}</button>
            </div>
          )}
          {step === 3 && (
            <div className="text-center">
              <Camera className="h-16 w-16 mx-auto text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold mb-4">Face Verification</h2>
              <video ref={videoRef} autoPlay className="w-full rounded-xl mb-4" style={{ display: cameraStarted ? 'block' : 'none' }} />
              {!cameraStarted && <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-4"><Camera className="h-12 w-12 text-gray-400" /></div>}
              {error && <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
              <div className="space-y-3">
                {!cameraStarted && <button onClick={startCamera} className="w-full bg-purple-600 text-white py-3 rounded-xl">Start Camera</button>}
                {cameraStarted && <button onClick={captureFace} disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-xl">{loading ? 'Capturing...' : 'Capture Face'}</button>}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold mb-4">Success!</h2>
              <p className="text-gray-600 mb-6">Attendance marked successfully</p>
              <button onClick={() => window.history.back()} className="w-full bg-blue-600 text-white py-3 rounded-xl">Back to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
