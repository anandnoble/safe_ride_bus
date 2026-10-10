import React, { useState, useRef, useEffect } from 'react';
import { 
  Bus, Camera, CheckCircle2, ShieldCheck, MapPin, Radio, 
  UserCheck, Lock, Play, LogOut, ScanLine, ArrowRight, AlertTriangle, UserX, ChevronRight, AlertOctagon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateBusGPSInDB } from '../lib/supabaseClient';

export default function DriverMobileApp({ 
  busData, 
  students = [], 
  onFinalizeBoardingBatch, 
  onSimulateGeofenceArrival,
  onSOSTriggered,
  viewMode = 'MOBILE'
}) {
  // Screen state: 'TRIP_SETUP', 'ACTIVE_TRIP', 'SCANNING_ROSTER', 'CONFIRMATION'
  const [driverScreen, setDriverScreen] = useState('TRIP_SETUP');
  
  // Driver Details Input
  const [driverNameInput, setDriverNameInput] = useState('Rahul Kumar');
  const [selectedStopInput, setSelectedStopInput] = useState('Stop 03');
  const [locationActive, setLocationActive] = useState(true);
  const [gpsCoords, setGpsCoords] = useState(busData ? busData.currentCoords : [12.9716, 77.5946]);
  const [gpsAccuracy, setGpsAccuracy] = useState('High (3m)');
  const [busArrivedAtStop, setBusArrivedAtStop] = useState(false);

  // Scanning Session State (Multiple Student Scanning)
  const [scannedQueue, setScannedQueue] = useState([]);
  const [scanningActive, setScanningActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [overridePin, setOverridePin] = useState('');
  const [selectedStudentForManual, setSelectedStudentForManual] = useState(null);

  const videoRef = useRef(null);

  // Real Browser Device Geolocation watchPosition
  useEffect(() => {
    let watchId = null;
    if (locationActive && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setGpsCoords([newLat, newLng]);
          setGpsAccuracy(`High (${Math.round(pos.coords.accuracy)}m)`);
          
          if (busData && busData.id) {
            updateBusGPSInDB(busData.id, newLat, newLng, '24 km/h');
          }
        },
        (err) => {
          console.warn('Browser GPS permission fallback active:', err.message);
          setGpsAccuracy('Simulated GPS');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [locationActive, busData]);

  const handleStartTrip = (e) => {
    e.preventDefault();
    if (!driverNameInput) {
      alert('Please enter Driver Name.');
      return;
    }
    setDriverScreen('ACTIVE_TRIP');
  };

  const handleTriggerArrival = () => {
    setBusArrivedAtStop(true);
    onSimulateGeofenceArrival();
  };

  const startWebcam = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera preview simulation active:', err);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  // Multiple Student Scanning Handler
  const handleScanSingleStudent = (studentObj) => {
    setScanningActive(true);
    setTimeout(() => {
      setScanningActive(false);
      
      if (scannedQueue.some(item => item.id === studentObj.id)) return;

      const newItem = {
        id: studentObj.id,
        firstName: studentObj.firstName,
        lastName: studentObj.lastName,
        assignedBus: studentObj.assignedBus,
        verificationStatus: studentObj.assignedBus === 'Bus 01' ? 'VERIFIED' : 'WRONG_BUS',
      };

      setScannedQueue(prev => [...prev, newItem]);
    }, 900);
  };

  const handleScanUnregisteredStudent = () => {
    setScanningActive(true);
    setTimeout(() => {
      setScanningActive(false);
      const unregItem = {
        id: 'UNKNOWN_99',
        firstName: 'Unregistered Student',
        lastName: '',
        assignedBus: 'None',
        verificationStatus: 'UNREGISTERED',
      };
      setScannedQueue(prev => [...prev, unregItem]);
    }, 900);
  };

  const handleProceedBatch = () => {
    const validStudents = scannedQueue.filter(s => s.verificationStatus === 'VERIFIED');
    
    if (validStudents.length === 0) {
      alert('No valid registered students in the scan queue to process.');
      return;
    }

    onFinalizeBoardingBatch(validStudents);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    setDriverScreen('CONFIRMATION');
  };

  const handleEmergencySOS = () => {
    if (confirm('🚨 EMERGENCY SOS: Dispatch high-priority emergency alert to School Administration & Parents?')) {
      if (onSOSTriggered) onSOSTriggered(driverNameInput);
      else alert('🚨 EMERGENCY SOS BROADCASTED TO TRANSPORT CONTROL');
    }
  };

  const content = (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto">
      
      {/* SCREEN 1: DRIVER FIRST SCREEN */}
      {driverScreen === 'TRIP_SETUP' && (
        <div className="p-6 flex flex-col justify-between flex-1 space-y-6">
          <div className="space-y-6 my-auto">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-600/40">
                <Bus className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">Driver Shift Setup</h2>
              <p className="text-xs text-slate-400">Enter driver name & select stop number to start trip</p>
            </div>

            <form onSubmit={handleStartTrip} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1 uppercase tracking-wider">Driver Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter Driver Name"
                  value={driverNameInput}
                  onChange={(e) => setDriverNameInput(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1 uppercase tracking-wider">Bus Stop Number *</label>
                <select
                  value={selectedStopInput}
                  onChange={(e) => setSelectedStopInput(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Stop 01">Stop 01 - Blueberry Hills</option>
                  <option value="Stop 02">Stop 02 - Oakwood Park Gate</option>
                  <option value="Stop 03">Stop 03 - Green Valley Apartments</option>
                  <option value="Stop 04">Stop 04 - Sunrise Circle</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-4 text-center justify-center text-sm font-black mt-2"
              >
                <span>START SHIFT</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center text-[11px] text-slate-400">
            ⚡ Starting trip broadcasts smartphone GPS location live to parents
          </div>
        </div>
      )}

      {/* SCREEN 2: ACTIVE TRIP & GEOFENCE ARRIVAL */}
      {driverScreen === 'ACTIVE_TRIP' && (
        <div className="p-5 space-y-4">
          
          {/* Top Driver HUD Header */}
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Trip Active • Bus 01</h3>
                <p className="text-[11px] text-slate-400">Driver: {driverNameInput}</p>
              </div>
            </div>

            <button
              onClick={() => setDriverScreen('TRIP_SETUP')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-semibold"
            >
              End Trip
            </button>
          </div>

          {/* GPS Live Status Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current GPS: <strong className="text-white">{gpsAccuracy}</strong></span>
              <button
                onClick={() => setLocationActive(!locationActive)}
                className={`status-badge ${locationActive ? 'status-boarded' : 'status-failed'}`}
              >
                {locationActive ? 'GPS ACTIVE' : 'GPS OFF'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
              <div><span className="text-slate-400 block">Current Stop</span><strong className="text-white">{selectedStopInput}</strong></div>
              <div><span className="text-slate-400 block">Next Stop</span><strong className="text-white">Stop 04</strong></div>
            </div>
          </div>

          {/* Stop Arrival Geofence Box */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">{selectedStopInput} Status</span>
              {busArrivedAtStop ? (
                <span className="status-badge status-boarded">ARRIVED</span>
              ) : (
                <span className="status-badge status-pending">APPROACHING</span>
              )}
            </div>

            {!busArrivedAtStop ? (
              <button
                onClick={handleTriggerArrival}
                className="w-full btn-primary py-3.5 text-xs font-black justify-center"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>SIMULATE STOP ARRIVAL (Alert #1)</span>
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-emerald-400 font-bold">Bus arrived at {selectedStopInput}. Alert sent to parents.</p>
                <button
                  onClick={() => setDriverScreen('SCANNING_ROSTER')}
                  className="w-full btn-success py-3.5 text-xs font-black justify-center"
                >
                  <ScanLine className="w-5 h-5" />
                  <span>START STUDENT VERIFICATION</span>
                </button>
              </div>
            )}
          </div>

          {/* Red SOS Emergency Trigger */}
          <button
            onClick={handleEmergencySOS}
            className="w-full p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-rose-900"
          >
            <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />
            <span>EMERGENCY SOS BROADCAST</span>
          </button>

        </div>
      )}

      {/* SCREEN 3: MULTIPLE STUDENT SCANNING INTERFACE */}
      {driverScreen === 'SCANNING_ROSTER' && (
        <div className="p-5 space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white">Scan Students</h3>
              <p className="text-xs text-slate-400">Scan students boarding at {selectedStopInput}</p>
            </div>
            <button
              onClick={() => setDriverScreen('ACTIVE_TRIP')}
              className="text-xs text-slate-400 hover:text-white underline font-semibold"
            >
              Back
            </button>
          </div>

          {/* Camera Viewfinder Screen */}
          <div className="relative h-[220px] rounded-2xl bg-black border-2 border-slate-700 overflow-hidden flex items-center justify-center">
            {scanningActive && <div className="laser-sweep" />}

            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-2">
                <ScanLine className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
                <p className="text-xs font-bold text-white">Position face inside camera frame</p>
                <p className="text-[10px] text-slate-400">Multi-student scan mode active</p>
              </div>
            )}

            {/* Bounding Box */}
            <div className="absolute w-40 h-40 border-2 border-emerald-400 rounded-xl pointer-events-none" />
          </div>

          {/* Trigger Scan Buttons for Demo */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleScanSingleStudent(students[0])}
              disabled={scanningActive}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold hover:bg-slate-700"
            >
              + Scan Aarav (STU001)
            </button>
            <button
              onClick={() => handleScanSingleStudent(students[1])}
              disabled={scanningActive}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold hover:bg-slate-700"
            >
              + Scan Ananya (STU002)
            </button>
            <button
              onClick={() => handleScanSingleStudent(students[4])}
              disabled={scanningActive}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-rose-300 font-bold hover:bg-slate-700"
            >
              Test Wrong Bus
            </button>
            <button
              onClick={handleScanUnregisteredStudent}
              disabled={scanningActive}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-rose-400 font-bold hover:bg-slate-700"
            >
              Test Unregistered
            </button>
          </div>

          {/* Scanned Queue Counter & List */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Students Scanned: {scannedQueue.length}</span>
              <span className="text-[10px] text-slate-400">Batch Queue</span>
            </div>

            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 text-xs">
              {scannedQueue.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No students scanned yet in this batch.</p>
              ) : (
                scannedQueue.map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-white">{item.firstName} {item.lastName}</h5>
                      <span className="text-[10px] text-slate-400">{item.id}</span>
                    </div>

                    {item.verificationStatus === 'VERIFIED' ? (
                      <span className="status-badge status-boarded">✓ Verified</span>
                    ) : item.verificationStatus === 'WRONG_BUS' ? (
                      <span className="status-badge status-failed">⚠️ Wrong Bus</span>
                    ) : (
                      <span className="status-badge status-failed">✕ Unregistered</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PROCEED BUTTON */}
          <button
            onClick={handleProceedBatch}
            disabled={scannedQueue.filter(s => s.verificationStatus === 'VERIFIED').length === 0}
            className="w-full btn-primary py-4 text-center justify-center text-sm font-black disabled:opacity-40"
          >
            <span>PROCEED ({scannedQueue.filter(s => s.verificationStatus === 'VERIFIED').length} Valid Students)</span>
            <ChevronRight className="w-5 h-5" />
          </button>

        </div>
      )}

      {/* SCREEN 4: BOARDING CONFIRMATION SCREEN */}
      {driverScreen === 'CONFIRMATION' && (
        <div className="p-6 text-center space-y-6 my-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-2xl animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Boarding Confirmed</h2>
            <p className="text-xs text-emerald-300 font-bold mt-1">
              {scannedQueue.filter(s => s.verificationStatus === 'VERIFIED').length} students verified & recorded.
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Parents notified via push alert. Database logs updated.
            </p>
          </div>

          <button
            onClick={() => {
              setScannedQueue([]);
              setDriverScreen('ACTIVE_TRIP');
            }}
            className="w-full btn-primary py-3.5 text-xs font-black justify-center"
          >
            <span>Continue Trip</span>
          </button>
        </div>
      )}

    </div>
  );

  return viewMode === 'MOBILE' ? (
    <div className="android-device-frame">
      <div className="android-status-bar">
        <span>8:12 AM</span>
        <div className="android-notch-pill" />
        <span>100% 🔋</span>
      </div>
      {content}
    </div>
  ) : (
    <div className="saferide-card p-6 max-w-2xl mx-auto">
      {content}
    </div>
  );
}
