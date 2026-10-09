import React, { useState, useRef } from 'react';
import { 
  Bus, Camera, CheckCircle2, ShieldCheck, MapPin, Play, 
  Lock, Radio, UserCheck, PhoneCall, ChevronRight, Navigation, Sparkles
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
  const [activeTask, setActiveTask] = useState('DASHBOARD'); // DASHBOARD, SCANNER, ROSTER
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [overridePin, setOverridePin] = useState('');
  const [selectedStudentForManual, setSelectedStudentForManual] = useState(null);
  const [gpsActive, setGpsActive] = useState(true);

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
      console.warn('Webcam preview simulation mode active:', err);
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
      const confidence = (95.0 + Math.random() * 4.8).toFixed(1);
      const targetStudent = studentToScan || currentStopStudents.find(s => s.status === 'PENDING') || students[0];

      setScanResult({
        success: true,
        student: targetStudent,
        confidenceScore: parseFloat(confidence)
      });

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });

      onVerifyBoarding(targetStudent.id, confidence);
    }, 1400);
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
    <div className="android-phone-frame text-white">
      
      {/* Android Top Speaker Notch */}
      <div className="android-notch">
        <div className="android-camera-lens" />
      </div>

      {/* App Mobile Header */}
      <div className="pt-9 px-5 pb-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">{busData.busNumber} Driver App</h2>
            <p className="text-xs text-slate-400">{busData.driverName} • {busData.route}</p>
          </div>
        </div>

        {/* GPS Live Toggle */}
        <button
          onClick={() => setGpsActive(!gpsActive)}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 border transition-all ${
            gpsActive 
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : 'bg-red-500/15 border-red-500/40 text-red-400'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${gpsActive ? 'animate-pulse' : ''}`} />
          <span>{gpsActive ? 'GPS ON' : 'GPS OFF'}</span>
        </button>
      </div>

      {/* Main Task Content Area */}
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        
        {/* VIEW 1: TASK DASHBOARD */}
        {activeTask === 'DASHBOARD' && (
          <div className="space-y-5">
            
            {/* Current Route & Stop Status Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Current Stop Geofence</span>
                <span className="text-emerald-400 font-bold">12m Inside Stop Radius</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{currentStop.name}</h3>
                <p className="text-xs text-slate-400">Sequence: Stop #{currentStop.order} of {busData.stops.length}</p>
              </div>

              {/* Task Button: Trigger Geofence Arrival */}
              <button
                onClick={onSimulateGeofenceArrival}
                className="w-full mobile-action-btn mobile-action-btn-warning mt-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Play className="w-5 h-5 fill-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white uppercase">Task 1: Geofence Arrival</p>
                    <p className="text-xs text-amber-100 font-medium">Send Alert #1 (Bus Arrived) to Parents</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-80" />
              </button>
            </div>

            {/* Core Driver Action Buttons */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Driver Actions</p>

              {/* Task 2: Open Facial Recognition Scanner */}
              <button
                onClick={() => setActiveTask('SCANNER')}
                className="w-full mobile-action-btn mobile-action-btn-primary"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-extrabold text-white">Scan Student Face</p>
                    <p className="text-xs text-blue-100 font-normal">Biometric Boarding Verification</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Task 3: View Expected Student Roster */}
              <button
                onClick={() => setActiveTask('ROSTER')}
                className="w-full mobile-action-btn"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-700 flex items-center justify-center text-blue-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Expected Student Roster</p>
                    <p className="text-xs text-slate-400 font-normal">{currentStopStudents.length} Students Assigned at Stop</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>

              {/* Task 4: Conductor Manual PIN Override */}
              <button
                onClick={() => setShowManualModal(true)}
                className="w-full mobile-action-btn"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-700 flex items-center justify-center text-amber-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Conductor PIN Override</p>
                    <p className="text-xs text-slate-400 font-normal">Manual verification for scan failure</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
            </div>

          </div>
        )}

        {/* VIEW 2: FACIAL RECOGNITION SCANNER */}
        {activeTask === 'SCANNER' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setActiveTask('DASHBOARD')}
                className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
              >
                ← Back to Tasks
              </button>
              <span className="text-xs text-slate-400">Point phone camera at student</span>
            </div>

            {/* Camera Viewfinder Screen */}
            <div className="relative h-[320px] rounded-3xl bg-black border-2 border-slate-700 overflow-hidden flex items-center justify-center shadow-2xl">
              
              {scanning && <div className="laser-line" />}

              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                  {scanResult?.success ? (
                    <img 
                      src={scanResult.student.avatarUrl} 
                      alt="Scanned Student" 
                      className="w-44 h-44 rounded-2xl object-cover border-4 border-emerald-500 shadow-2xl animate-pulse" 
                    />
                  ) : (
                    <div className="text-center space-y-3">
                      <img 
                        src={currentStopStudents.find(s => s.status === 'PENDING')?.avatarUrl || students[0].avatarUrl} 
                        alt="Student Target" 
                        className="w-36 h-36 rounded-3xl object-cover border-2 border-dashed border-emerald-400/60 mx-auto" 
                      />
                      <p className="text-xs text-slate-400 font-medium">Position student face in center</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bounding Corner Target */}
              <div className="absolute w-56 h-56 border-2 border-emerald-400/80 rounded-3xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <span className="w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <span className="w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                </div>
                {scanning && (
                  <div className="text-center">
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      512-D VECTOR MATCHING...
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <span className="w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                </div>
              </div>

              {/* Success Result Popup */}
              {scanResult && (
                <div className="absolute bottom-3 left-3 right-3 bg-emerald-950/95 border border-emerald-400 p-3.5 rounded-2xl flex items-center justify-between text-white shadow-2xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold">{scanResult.student.firstName} {scanResult.student.lastName}</h4>
                      <p className="text-[11px] text-emerald-300">Boarded • {scanResult.confidenceScore}% Biometric Match</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2.5 py-1 rounded-full">ALERT #2 SENT</span>
                </div>
              )}

            </div>

            {/* Scan Action Buttons */}
            <button
              onClick={() => handlePerformScan(currentStopStudents.find(s => s.status === 'PENDING'))}
              disabled={scanning}
              className="w-full mobile-action-btn mobile-action-btn-success py-4 text-center justify-center text-base font-extrabold shadow-emerald-600/40"
            >
              <Camera className="w-5 h-5 mr-2 inline" />
              <span>{scanning ? "Extracting & Matching..." : "Tap to Scan Student Face"}</span>
            </button>
          </div>
        )}

        {/* VIEW 3: EXPECTED ROSTER */}
        {activeTask === 'ROSTER' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setActiveTask('DASHBOARD')}
                className="text-xs font-bold text-blue-400 hover:underline"
              >
                ← Back to Tasks
              </button>
              <span className="text-xs text-slate-400">{currentStopStudents.length} Students</span>
            </div>

            <div className="space-y-3">
              {currentStopStudents.map(student => (
                <div key={student.id} className="p-4 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={student.avatarUrl} alt={student.firstName} className="w-12 h-12 rounded-2xl object-cover border border-slate-600" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{student.firstName} {student.lastName}</h4>
                      <p className="text-xs text-slate-400">{student.id} • {student.grade}</p>
                    </div>
                  </div>

                  {student.status === 'BOARDED' ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Boarded
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveTask('SCANNER');
                        handlePerformScan(student);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
                    >
                      Scan Face
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Android Bottom Navigation Bar */}
      <div className="android-bottom-nav">
        <button 
          onClick={() => setActiveTask('DASHBOARD')}
          className={`android-nav-item ${activeTask === 'DASHBOARD' ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <Bus className="w-5 h-5" />
          </div>
          <span>Tasks</span>
        </button>

        <button 
          onClick={() => setActiveTask('SCANNER')}
          className={`android-nav-item ${activeTask === 'SCANNER' ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <Camera className="w-5 h-5" />
          </div>
          <span>Scan Face</span>
        </button>

        <button 
          onClick={() => setActiveTask('ROSTER')}
          className={`android-nav-item ${activeTask === 'ROSTER' ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <UserCheck className="w-5 h-5" />
          </div>
          <span>Roster</span>
        </button>
      </div>

      {/* Manual Override Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/40 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Conductor PIN Manual Override
              </h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400">✕</button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Select Student</label>
              <select
                onChange={(e) => setSelectedStudentForManual(students.find(s => s.id === e.target.value))}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
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
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-center font-mono text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowManualModal(false)} className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
              <button onClick={handleConfirmManualOverride} className="w-1/2 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold">Confirm Boarding</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
