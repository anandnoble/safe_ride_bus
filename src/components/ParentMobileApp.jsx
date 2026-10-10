import React, { useState } from 'react';
import { 
  Bus, Bell, CheckCircle2, MapPin, Phone, ShieldCheck, Clock, Navigation, AlertTriangle, UserCheck, MessageSquare, ChevronRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateETAPrediction } from '../utils/aiEngine';

const parentBusIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -15],
});

const homeStopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1216/1216895.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

export default function ParentMobileApp({ 
  students = [], 
  busData, 
  notifications = [], 
  viewMode = 'MOBILE' 
}) {
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [activeBottomNav, setActiveBottomNav] = useState('TRACKER'); // 'TRACKER', 'ALERTS', 'SAFETY'
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentText, setIncidentText] = useState('');

  const currentStudent = students[selectedStudentIndex] || students[0];

  if (!currentStudent || !busData) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading Parent Safety Portal...
      </div>
    );
  }

  // Calculate AI ETA
  const aiEta = calculateETAPrediction(
    busData.currentCoords,
    currentStudent.pickupCoords || [12.9716, 77.5946],
    parseFloat(busData.speed) || 22
  );

  const childNotifs = notifications.filter(n => n.studentId === currentStudent.id || !n.studentId);
  const routePolyline = busData.stops ? busData.stops.map(s => s.coords) : [busData.currentCoords];

  const handleReportIncident = (e) => {
    e.preventDefault();
    if (!incidentText) return;
    alert(`Incident report submitted to School Transport Office: "${incidentText}"`);
    setIncidentText('');
    setShowIncidentModal(false);
  };

  const content = (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto">
      
      {/* Top Header & Child Switcher */}
      <div className="pt-3 px-5 pb-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={currentStudent.avatarUrl} 
            alt={currentStudent.firstName}
            className="w-11 h-11 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-white">{currentStudent.firstName} {currentStudent.lastName}</h2>
              <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">Authorized</span>
            </div>
            <p className="text-xs text-slate-400">{currentStudent.classSection} • {currentStudent.assignedBus}</p>
          </div>
        </div>

        <a 
          href={`tel:${busData.driverPhone}`}
          className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all"
          title="Call Driver"
        >
          <Phone className="w-4 h-4" />
        </a>
      </div>

      {/* Child Switcher Pill (if multiple children exist) */}
      {students.length > 1 && (
        <div className="bg-slate-950 px-5 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0">Switch Child:</span>
          {students.slice(0, 3).map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setSelectedStudentIndex(idx)}
              className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 ${
                selectedStudentIndex === idx
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s.firstName}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Body */}
      <div className="p-5 space-y-4 flex-1">
        
        {/* VIEW 1: LIVE BUS TRACKER & STATUS */}
        {activeBottomNav === 'TRACKER' && (
          <>
            {/* Status Card */}
            <div className={`p-5 rounded-3xl border shadow-xl flex flex-col items-center text-center space-y-3 ${
              currentStudent.status === 'BOARDED' 
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : currentStudent.status === 'DROPPED_OFF'
                ? 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
                : currentStudent.status === 'VERIFICATION_FAILED'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-amber-950/90 border-amber-500/50 text-amber-200'
            }`}>
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl shadow-inner">
                {currentStudent.status === 'BOARDED' ? '🚌' : currentStudent.status === 'DROPPED_OFF' ? '📍' : '⏳'}
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block mb-1">
                  LIVE TRANSPORT STATUS
                </span>
                <h3 className="text-xl font-black text-white">
                  {currentStudent.status === 'BOARDED' 
                    ? 'STUDENT BOARDED ✓' 
                    : currentStudent.status === 'DROPPED_OFF'
                    ? 'DROPPED OFF SAFELY ✓'
                    : currentStudent.status === 'BUS_ARRIVED'
                    ? 'BUS ARRIVED AT STOP 03'
                    : 'BUS APPROACHING'}
                </h3>
                <p className="text-xs mt-1 leading-relaxed">
                  {currentStudent.status === 'BOARDED' 
                    ? `Verified via facial recognition. Boarded ${currentStudent.assignedBus} at ${currentStudent.boardingTime || '8:12 AM'}.`
                    : currentStudent.status === 'DROPPED_OFF'
                    ? 'Your child has been safely dropped off at the designated stop.'
                    : `Bus 01 is en route to ${currentStudent.pickupStop}.`}
                </p>
              </div>

              {/* AI ETA Badge */}
              <div className="pt-2 border-t border-white/10 w-full flex items-center justify-between text-xs px-2">
                <span className="font-bold opacity-90">AI Predicted ETA:</span>
                <span className="font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full text-white font-mono">
                  {aiEta.formattedETA} ({aiEta.trafficCondition})
                </span>
              </div>
            </div>

            {/* BUS LOCATION MAP */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-blue-400" /> Bus GPS Telematics
                </span>
                <span className="text-emerald-400 font-bold font-mono">{busData.speed} • Live</span>
              </div>

              <div className="h-[220px] rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
                <MapContainer center={busData.currentCoords} zoom={14} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Polyline positions={routePolyline} color="#10b981" weight={4} dashArray="5, 8" />
                  
                  <Marker position={busData.currentCoords} icon={parentBusIcon}>
                    <Popup><strong>{busData.busNumber} (Active Location)</strong><br />Driver: {busData.driverName}</Popup>
                  </Marker>

                  <Marker position={currentStudent.pickupCoords} icon={homeStopIcon}>
                    <Popup><strong>{currentStudent.pickupStop}</strong></Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Driver: <strong className="text-white">{busData.driverName}</strong></span>
                <span>Next Stop: <strong className="text-white">{busData.nextStop}</strong></span>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: NOTIFICATIONS FEED */}
        {activeBottomNav === 'ALERTS' && (
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" /> Real-time Alert Feed
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-md">{childNotifs.length} Alerts</span>
            </div>

            <div className="space-y-2.5">
              {childNotifs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No alerts received yet today.</p>
              ) : (
                childNotifs.map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-3 rounded-2xl border-l-4 ${
                      notif.type === 'BOARDING_CONFIRMED' || notif.type === 'STUDENT_BOARDED' 
                        ? 'border-l-emerald-500 bg-emerald-950/30' 
                        : 'border-l-amber-500 bg-amber-950/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 pl-5 leading-relaxed">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: SAFETY & EMERGENCY INFO */}
        {activeBottomNav === 'SAFETY' && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Safety & Emergency Contacts
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-800 flex justify-between items-center">
                  <div>
                    <strong className="text-white block">Bus Driver (Suresh Kumar)</strong>
                    <span className="text-slate-400 text-[11px]">{busData.driverPhone}</span>
                  </div>
                  <a href={`tel:${busData.driverPhone}`} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold">Call</a>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800 flex justify-between items-center">
                  <div>
                    <strong className="text-white block">School Transport Helpline</strong>
                    <span className="text-slate-400 text-[11px]">+91 800-SAFE-RIDE</span>
                  </div>
                  <a href="tel:+918007233743" className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold">Call</a>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIncidentModal(true)}
              className="w-full p-4 rounded-3xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Report Safety Concern / Issue
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Accessible Bottom Navigation Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-2 flex justify-around items-center">
        <button
          onClick={() => setActiveBottomNav('TRACKER')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeBottomNav === 'TRACKER' ? 'text-blue-400' : 'text-slate-500'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span>Live Map</span>
        </button>

        <button
          onClick={() => setActiveBottomNav('ALERTS')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeBottomNav === 'ALERTS' ? 'text-blue-400' : 'text-slate-500'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span>Alerts ({childNotifs.length})</span>
        </button>

        <button
          onClick={() => setActiveBottomNav('SAFETY')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeBottomNav === 'SAFETY' ? 'text-blue-400' : 'text-slate-500'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Safety</span>
        </button>
      </div>

      {/* Incident Reporting Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-rose-500/40 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Report Safety Incident
              </h3>
              <button onClick={() => setShowIncidentModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-3 text-xs">
              <textarea
                required
                rows={4}
                placeholder="Describe safety concern or feedback..."
                value={incidentText}
                onChange={(e) => setIncidentText(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowIncidentModal(false)} className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-rose-600 text-white font-bold">Submit</button>
              </div>
            </form>
          </div>
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
