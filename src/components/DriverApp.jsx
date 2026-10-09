import React, { useState, useRef } from 'react';
import { 
  Bus, Camera, CheckCircle2, ShieldCheck, MapPin, Radio, 
  UserCheck, Lock, Play, ChevronRight, LogOut, ScanLine, ArrowRight, Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DriverApp({ 
  busData, 
  students, 
  onVerifyBoarding, 
  onSimulateGeofenceArrival,
  onManualOverride,
  currentStopIndex,
  viewMode = 'MOBILE'
}) {
  const [driverLoggedIn, setDriverLoggedIn] = useState(false);
  const [busNumberInput, setBusNumberInput] = useState('Bus 01');
  const [driverNameInput, setDriverNameInput] = useState('Suresh Kumar');

  const [locationAccessActive, setLocationAccessActive] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [overridePin, setOverridePin] = useState('');
  const [selectedStudentForManual, setSelectedStudentForManual] = useState(null);

  const videoRef = useRef(null);

  const currentStop = busData.stops[currentStopIndex] || busData.stops[2];
  const currentStopStudents = students.filter(s => s.pickupStop.includes(currentStop.name.split(' ')[0]));

  const handleStartShiftLogin = (e) => {
    e.preventDefault();
    if (!busNumberInput || !driverNameInput) {
      alert('Please enter Bus Number and Driver Name.');
      return;
    }
    setDriverLoggedIn(true);
  };

  const startWebcam = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera preview simulation mode active:', err);
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
      const confidence = (96.8 + Math.random() * 2.8).toFixed(1);
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
      alert(`Manual override verified for ${selectedStudentForManual.firstName}! Record saved.`);
    } else {
      alert('Invalid Conductor PIN. Use demo PIN: 1234');
    }
  };

  const content = (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto">
      
      {/* SCREEN 1: INITIAL DRIVER DETAILS INTERFACE */}
      {!driverLoggedIn ? (
        <div className="p-6 flex flex-col justify-between flex-1 space-y-6">
          <div className="space-y-6 my-auto">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-blue-700 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-600/40">
                <Bus className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">Driver Portal Setup</h2>
              <p className="text-xs text-slate-400">Enter shift details to start route & enable live location tracking</p>
            </div>

            <form onSubmit={handleStartShiftLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Bus Number *</label>
                <div className="relative">
                  <Bus className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bus 01"
                    value={busNumberInput}
                    onChange={(e) => setBusNumberInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Driver / Conductor Name *</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={driverNameInput}
                    onChange={(e) => setDriverNameInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full app-btn app-btn-primary py-4 text-center justify-center text-sm font-black mt-2"
              >
                <span>START SHIFT & OPEN SCANNER</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center text-[11px] text-slate-400">
            ⚡ Starting shift activates real-time GPS location sharing for parents
          </div>
        </div>
      ) : (
        /* SCREEN 2: ACTIVE SCANNER & GPS ACCESS INTERFACE */
        <div className="flex-1 flex flex-col justify-between overflow-y-auto">
          
          {/* Top Bar with Logged In Driver Info & Exit Button */}
          <div className="pt-3 px-5 pb-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">{busNumberInput}</h3>
                <p className="text-[11px] text-slate-400">Driver: {driverNameInput}</p>
              </div>
            </div>

            <button
              onClick={() => setDriverLoggedIn(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700 flex items-center gap-1 text-xs font-semibold"
              title="Log Out / Change Shift Details"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>

          {/* Operational Area */}
          <div className="p-5 space-y-4">
            
            {/* TASK 1: LOCATION ACCESS SWITCH */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className={`w-5 h-5 ${locationAccessActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Bus Location Access</h4>
                    <p className="text-[10px] text-slate-400">Broadcasting live GPS to parent map</p>
                  </div>
                </div>

                <button
                  onClick={() => setLocationAccessActive(!locationAccessActive)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black border transition-all ${
                    locationAccessActive 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : 'bg-red-500/20 text-red-400 border-red-500/40'
                  }`}
                >
                  {locationAccessActive ? '🟢 LOCATION ACTIVE' : '🔴 LOCATION OFF'}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Pickup Stop: <strong className="text-white">{currentStop.name}</strong></span>
                <button 
                  onClick={onSimulateGeofenceArrival}
                  className="text-amber-400 hover:underline font-bold flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-amber-400" />
                  <span>Send Bus Arrived Alert</span>
                </button>
              </div>
            </div>

            {/* TASK 2: FACIAL RECOGNITION SYSTEM INTERFACE */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Face Recognition Scanner</h4>
                </div>
                <button
                  onClick={cameraActive ? stopWebcam : startWebcam}
                  className="text-[11px] text-blue-400 hover:underline font-semibold"
                >
                  {cameraActive ? 'Close Camera' : 'Webcam Mode'}
                </button>
              </div>

              {/* Viewfinder Frame */}
              <div className="relative h-[250px] rounded-2xl bg-black border-2 border-slate-700 overflow-hidden flex items-center justify-center shadow-2xl">
                
                {scanning && <div className="scan-laser" />}

                {cameraActive ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center p-3">
                    {scanResult?.success ? (
                      <img 
                        src={scanResult.student.avatarUrl} 
                        alt="Scanned Student" 
                        className="w-36 h-36 rounded-2xl object-cover border-4 border-emerald-500 shadow-2xl" 
                      />
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto animate-pulse">
                          <ScanLine className="w-9 h-9" />
                        </div>
                        <p className="text-xs text-slate-300 font-bold">Ready to Scan Student Face</p>
                        <p className="text-[10px] text-slate-500">Tap button below to verify boarding</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bounding Box Brackets */}
                <div className="absolute w-44 h-44 border-2 border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                    <span className="w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                  </div>
                  {scanning && (
                    <div className="text-center">
                      <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        MATCHING BIOMETRIC VECTOR...
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                    <span className="w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br" />
                  </div>
                </div>

                {/* Verification Popup */}
                {scanResult && (
                  <div className="absolute bottom-2 left-2 right-2 bg-emerald-950/95 border border-emerald-400 p-2.5 rounded-xl flex items-center justify-between text-white shadow-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <h5 className="text-xs font-bold">{scanResult.student.firstName} {scanResult.student.lastName}</h5>
                        <p className="text-[10px] text-emerald-300">Boarded • {scanResult.confidenceScore}% Match</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-md">PARENT NOTIFIED</span>
                  </div>
                )}

              </div>

              {/* ACTION SCANNER BUTTON */}
              <button
                onClick={() => handlePerformScan(currentStopStudents.find(s => s.status === 'PENDING'))}
                disabled={scanning}
                className="w-full app-btn app-btn-success py-4 text-center justify-center text-sm font-black"
              >
                <ScanLine className="w-5 h-5 mr-2 inline" />
                <span>{scanning ? "Scanning Student Face..." : "SCAN STUDENT FACE"}</span>
              </button>

            </div>

            {/* EXPECTED STUDENT FACES ROSTER */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Student Faces Roster ({currentStopStudents.length})</span>
                </h4>
                <button
                  onClick={() => setShowManualModal(true)}
                  className="text-[11px] text-amber-400 hover:underline font-bold"
                >
                  Manual PIN Override
                </button>
              </div>

              <div className="space-y-2">
                {currentStopStudents.map(student => (
                  <div key={student.id} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={student.avatarUrl} alt={student.firstName} className="w-9 h-9 rounded-xl object-cover border border-slate-600" />
                      <div>
                        <h5 className="text-xs font-bold text-white">{student.firstName} {student.lastName}</h5>
                        <p className="text-[10px] text-slate-400">{student.id} • {student.grade}</p>
                      </div>
                    </div>

                    {student.status === 'BOARDED' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center gap-1 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Boarded
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePerformScan(student)}
                        className="px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
                      >
                        Scan
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

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
  );

  return viewMode === 'MOBILE' ? (
    <div className="android-device-frame">
      {/* Status Bar */}
      <div className="android-status-bar">
        <span>07:42 AM</span>
        <div className="android-notch-pill" />
        <span>100% 🔋</span>
      </div>
      {content}
    </div>
  ) : (
    <div className="glass-container p-6 max-w-4xl mx-auto">
      {content}
    </div>
  );
}
