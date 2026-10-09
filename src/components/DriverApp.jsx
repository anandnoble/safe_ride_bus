import React, { useState, useRef } from 'react';
import { 
  Bus, Camera, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, Play, 
  RotateCcw, Lock, RefreshCw, Radio, UserCheck, XCircle, Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DriverApp({ 
  busData, 
  students, 
  onVerifyBoarding, 
  onSimulateGeofenceArrival,
  onManualOverride,
  currentStopIndex,
  onAdvanceStop
}) {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { success: bool, student: obj, confidence: number }
  const [showManualModal, setShowManualModal] = useState(false);
  const [overridePin, setOverridePin] = useState('');
  const [selectedStudentForManual, setSelectedStudentForManual] = useState(null);
  
  const videoRef = useRef(null);

  const currentStop = busData.stops[currentStopIndex] || busData.stops[2];

  // Get students expected at current stop
  const currentStopStudents = students.filter(s => s.pickupStop.includes(currentStop.name.split(' ')[0]));

  // Start real webcam stream if requested
  const startWebcam = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam permission not granted or unavailable, using high-tech camera preview simulation:', err);
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  // Perform facial recognition scan
  const handlePerformFaceScan = (studentToScan) => {
    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanning(false);
      const confidence = (94.5 + Math.random() * 5).toFixed(1);
      
      const targetStudent = studentToScan || currentStopStudents.find(s => s.status === 'PENDING') || students[0];

      setScanResult({
        success: true,
        student: targetStudent,
        confidenceScore: parseFloat(confidence)
      });

      // Trigger confetti celebration on driver app!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Call parent verify boarding handler (updates shared state)
      onVerifyBoarding(targetStudent.id, confidence);
    }, 1500);
  };

  // Submit manual conductor PIN override
  const handleConfirmManualOverride = () => {
    if (selectedStudentForManual && overridePin === '1234') {
      onManualOverride(selectedStudentForManual.id);
      setShowManualModal(false);
      setOverridePin('');
      setSelectedStudentForManual(null);
      alert(`Manual override successful for ${selectedStudentForManual.firstName}! Record saved as VERIFIED_MANUAL.`);
    } else {
      alert('Invalid Conductor PIN. Use demo PIN: 1234');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Mobile Device Viewport Wrapper */}
      <div className="glass-panel p-6 space-y-6 border-2 border-blue-500/30 shadow-2xl">
        
        {/* Driver HUD Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{busData.busNumber} HUD</h2>
                <span className="badge badge-success text-[10px]">Active Shift</span>
              </div>
              <p className="text-xs text-slate-400">{busData.route} ({busData.driverName})</p>
            </div>
          </div>

          {/* GPS Broadcast Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>GPS BROADCAST: ON</span>
          </div>
        </div>

        {/* Current Stop & Geofence Controller */}
        <div className="glass-card p-4 space-y-3 bg-slate-900/80 border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Current Stop Geofence</span>
                <h3 className="text-sm font-bold text-white">{currentStop.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onSimulateGeofenceArrival}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Trigger Stop Geofence Arrival (Sends Alert #1)"
              >
                <Play className="w-3.5 h-3.5 fill-amber-300" />
                <span>Trigger Geofence Arrival</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Stop #{currentStop.order} of {busData.stops.length}</span>
            <span>Speed: <strong className="text-white">{busData.speed}</strong></span>
            <span>Distance to Stop: <strong className="text-emerald-400">12 meters (INSIDE GEOFENCE)</strong></span>
          </div>
        </div>

        {/* Main Biometric Face Scanner Workspace */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Biometric Face Recognition System</h3>
            </div>

            <div className="flex items-center gap-2">
              {!cameraActive ? (
                <button
                  onClick={startWebcam}
                  className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  Enable Real Camera
                </button>
              ) : (
                <button
                  onClick={stopWebcam}
                  className="text-xs text-red-400 hover:text-red-300 underline font-medium"
                >
                  Close Camera
                </button>
              )}
            </div>
          </div>

          {/* Camera Viewfinder Screen */}
          <div className="relative h-[280px] rounded-2xl bg-black border-2 border-slate-700 overflow-hidden flex items-center justify-center shadow-inner">
            
            {/* Animated Face Scanner Overlay Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            {/* Scanning Laser Line */}
            {scanning && <div className="animate-scan-line" />}

            {/* Camera Video Stream or Simulated Student Target */}
            {cameraActive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {scanResult?.success ? (
                  <img 
                    src={scanResult.student.avatarUrl} 
                    alt="Scanned Student" 
                    className="w-44 h-44 rounded-2xl object-cover border-4 border-emerald-500 shadow-2xl" 
                  />
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <img 
                      src={currentStopStudents.find(s => s.status === 'PENDING')?.avatarUrl || students[0].avatarUrl} 
                      alt="Student Target" 
                      className="w-32 h-32 rounded-2xl object-cover border-2 border-dashed border-blue-400/60 mx-auto" 
                    />
                    <p className="text-xs text-slate-400">Position student face within camera frame</p>
                  </div>
                )}
              </div>
            )}

            {/* Bounding Box Face Target */}
            <div className="absolute w-52 h-52 border-2 border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <div className="flex justify-between">
                <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
              </div>
              {scanning && (
                <div className="text-center">
                  <span className="bg-emerald-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    ANALYZING 512-D EMBEDDING...
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
              </div>
            </div>

            {/* Verification Result Banner Overlay */}
            {scanResult && (
              <div className="absolute bottom-3 left-3 right-3 bg-emerald-900/90 backdrop-blur-md border border-emerald-400 text-white p-3 rounded-xl flex items-center justify-between animate-bounce">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                  <div>
                    <h4 className="text-xs font-bold">{scanResult.student.firstName} {scanResult.student.lastName}</h4>
                    <p className="text-[10px] text-emerald-200">Boarding Verified • {scanResult.confidenceScore}% Biometric Match</p>
                  </div>
                </div>
                <span className="badge badge-success text-[10px]">Parent Alerted</span>
              </div>
            )}

          </div>

          {/* Action Scanning Controls */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handlePerformFaceScan(currentStopStudents.find(s => s.status === 'PENDING'))}
              disabled={scanning}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
              <span>{scanning ? "Scanning Vector..." : "Scan Student Face"}</span>
            </button>

            <button
              onClick={() => setShowManualModal(true)}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Conductor PIN Override</span>
            </button>
          </div>
        </div>

        {/* Current Stop Expected Students Roster */}
        <div className="space-y-3 pt-4 border-t border-slate-700/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Stop Roster: Expected Students</span>
            </h3>
            <span className="text-xs text-slate-400">{currentStopStudents.length} Students Assigned</span>
          </div>

          <div className="space-y-2">
            {currentStopStudents.map(student => (
              <div 
                key={student.id}
                className="glass-card p-3 flex items-center justify-between hover:bg-slate-800/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={student.avatarUrl} 
                    alt={student.firstName} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{student.firstName} {student.lastName}</h4>
                    <p className="text-[11px] text-slate-400">{student.id} • {student.grade}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {student.status === 'BOARDED' ? (
                    <span className="badge badge-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Boarded ({student.boardingTime})
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePerformFaceScan(student)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
                    >
                      Scan & Verify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Manual Override Conductor Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 border-amber-500/40">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2 text-amber-400">
                <Lock className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Conductor Manual Override</h3>
              </div>
              <button 
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Use manual verification if facial scan fails due to physical bandage, extreme sunlight, or camera issue.
            </p>

            {/* Select Student */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Select Student</label>
              <select
                onChange={(e) => setSelectedStudentForManual(students.find(s => s.id === e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose Student from Roster --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.id})</option>
                ))}
              </select>
            </div>

            {/* Enter Conductor PIN */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Conductor Security PIN (Demo: 1234)</label>
              <input
                type="password"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={overridePin}
                onChange={(e) => setOverridePin(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-center tracking-widest text-base font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowManualModal(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmManualOverride}
                className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30"
              >
                Confirm Manual Boarding
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
