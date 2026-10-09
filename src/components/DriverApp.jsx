import React, { useState, useRef } from 'react';
import { 
  Bus, Camera, CheckCircle2, ShieldCheck, MapPin, Radio, 
  UserCheck, Lock, Play, ChevronRight, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DriverApp({ 
  busData, 
  students, 
  onVerifyBoarding, 
  onSimulateGeofenceArrival,
  onManualOverride,
  currentStopIndex
}) {
  const [locationOn, setLocationOn] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [overridePin, setOverridePin] = useState('');
  const [selectedStudentForManual, setSelectedStudentForManual] = useState(null);

  const videoRef = useRef(null);

  const currentStop = busData.stops[currentStopIndex] || busData.stops[2];
  const currentStopStudents = students.filter(s => s.pickupStop.includes(currentStop.name.split(' ')[0]));

  const startWebcam = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam camera preview simulation active:', err);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const handlePerformScan = (studentToScan) => {
    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanning(false);
      const confidence = (96.0 + Math.random() * 3.8).toFixed(1);
      const targetStudent = studentToScan || currentStopStudents.find(s => s.status === 'PENDING') || students[0];

      setScanResult({
        success: true,
        student: targetStudent,
        confidenceScore: parseFloat(confidence)
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      onVerifyBoarding(targetStudent.id, confidence);
    }, 1300);
  };

  const handleConfirmManualOverride = () => {
    if (selectedStudentForManual && overridePin === '1234') {
      onManualOverride(selectedStudentForManual.id);
      setShowManualModal(false);
      setOverridePin('');
      setSelectedStudentForManual(null);
      alert(`Manual verification saved for ${selectedStudentForManual.firstName}! Record updated.`);
    } else {
      alert('Invalid Conductor PIN. Use demo PIN: 1234');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      
      {/* Android Mobile Phone Container */}
      <div className="android-phone-frame text-white">
        
        {/* Android Speaker Notch */}
        <div className="android-notch">
          <div className="android-camera-lens" />
        </div>

        {/* Driver App Top Bar */}
        <div className="pt-9 px-5 pb-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/30">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">{busData.busNumber} Driver Portal</h2>
              <p className="text-xs text-slate-400">{busData.driverName} • {busData.route}</p>
            </div>
          </div>
        </div>

        {/* Main Operational Tasks Container */}
        <div className="flex-1 p-5 space-y-5 overflow-y-auto">
          
          {/* TASK 1: GPS LOCATION BROADCAST SWITCH */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className={`w-5 h-5 ${locationOn ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Bus Location Broadcast</h3>
                  <p className="text-[11px] text-slate-400">Parents can track bus position live on map</p>
                </div>
              </div>

              <button
                onClick={() => setLocationOn(!locationOn)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border ${
                  locationOn 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : 'bg-red-500/20 text-red-400 border-red-500/40'
                }`}
              >
                {locationOn ? '🟢 LOCATION IS ON' : '🔴 LOCATION IS OFF'}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Stop: <strong className="text-white">{currentStop.name}</strong></span>
              <button 
                onClick={onSimulateGeofenceArrival}
                className="text-amber-400 hover:underline font-bold text-[11px] flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-amber-400" />
                <span>Send Bus Arrived Alert</span>
              </button>
            </div>
          </div>

          {/* TASK 2: FACIAL RECOGNITION SYSTEM INTERFACE */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-extrabold text-white">Facial Recognition System</h3>
              </div>
              <button
                onClick={cameraActive ? stopWebcam : startWebcam}
                className="text-xs text-blue-400 hover:underline font-semibold"
              >
                {cameraActive ? 'Close Camera' : 'Use Live Camera'}
              </button>
            </div>

            {/* Camera Viewfinder Box */}
            <div className="relative h-[260px] rounded-2xl bg-black border-2 border-slate-700 overflow-hidden flex items-center justify-center shadow-inner">
              
              {scanning && <div className="laser-line" />}

              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  {scanResult?.success ? (
                    <img 
                      src={scanResult.student.avatarUrl} 
                      alt="Scanned Student" 
                      className="w-40 h-40 rounded-2xl object-cover border-4 border-emerald-500 shadow-2xl" 
                    />
                  ) : (
                    <div className="text-center space-y-2">
                      <img 
                        src={currentStopStudents.find(s => s.status === 'PENDING')?.avatarUrl || students[0].avatarUrl} 
                        alt="Student Face" 
                        className="w-32 h-32 rounded-2xl object-cover border-2 border-dashed border-emerald-400/60 mx-auto" 
                      />
                      <p className="text-xs text-slate-400 font-medium">Position student face inside frame</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bounding Target Bracket */}
              <div className="absolute w-48 h-48 border-2 border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                  <span className="w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                </div>
                {scanning && (
                  <div className="text-center">
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      MATCHING FACE VECTOR...
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                  <span className="w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br" />
                </div>
              </div>

              {/* Scan Match Notification Popup */}
              {scanResult && (
                <div className="absolute bottom-2 left-2 right-2 bg-emerald-950/95 border border-emerald-400 p-3 rounded-xl flex items-center justify-between text-white shadow-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold">{scanResult.student.firstName} {scanResult.student.lastName}</h4>
                      <p className="text-[10px] text-emerald-300">Boarded • {scanResult.confidenceScore}% Match</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-md">PARENT NOTIFIED</span>
                </div>
              )}

            </div>

            {/* SCAN ACTION BUTTON */}
            <button
              onClick={() => handlePerformScan(currentStopStudents.find(s => s.status === 'PENDING'))}
              disabled={scanning}
              className="w-full mobile-action-btn mobile-action-btn-success py-4 text-center justify-center text-sm font-extrabold shadow-emerald-600/40"
            >
              <Camera className="w-5 h-5 mr-2 inline" />
              <span>{scanning ? "Extracting & Verifying Face..." : "SCAN FACE TO VERIFY BOARDING"}</span>
            </button>

          </div>

          {/* STUDENT FACES ROSTER LIST */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>Student Faces Roster ({currentStopStudents.length})</span>
              </h3>
              <button
                onClick={() => setShowManualModal(true)}
                className="text-[11px] text-amber-400 hover:underline font-bold"
              >
                Manual PIN Override
              </button>
            </div>

            <div className="space-y-2.5">
              {currentStopStudents.map(student => (
                <div key={student.id} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={student.avatarUrl} alt={student.firstName} className="w-10 h-10 rounded-xl object-cover border border-slate-600" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{student.firstName} {student.lastName}</h4>
                      <p className="text-[10px] text-slate-400">{student.id} • {student.grade}</p>
                    </div>
                  </div>

                  {student.status === 'BOARDED' ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Boarded
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePerformScan(student)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
                    >
                      Scan Face
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Manual Override Modal */}
        {showManualModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/40 max-w-xs w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Conductor PIN Override
                </h3>
                <button onClick={() => setShowManualModal(false)} className="text-slate-400">✕</button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Select Student</label>
                <select
                  onChange={(e) => setSelectedStudentForManual(students.find(s => s.id === e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Conductor PIN (Demo: 1234)</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="1234"
                  value={overridePin}
                  onChange={(e) => setOverridePin(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-center font-mono text-base tracking-widest"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowManualModal(false)} className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                <button onClick={handleConfirmManualOverride} className="w-1/2 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold">Confirm</button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
