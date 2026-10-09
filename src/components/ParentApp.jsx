import React, { useState } from 'react';
import { 
  Bus, Bell, CheckCircle2, MapPin, Phone, ShieldCheck, Clock, AlertTriangle, 
  ChevronRight, Navigation, Crosshair, HeartPulse, User
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Map Icons for Parent App
const parentBusIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -15],
});

const homeStopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1216/1216895.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30],
});

export default function ParentApp({ 
  student, 
  busData, 
  notifications,
  onUpdatePickupLocation 
}) {
  const [activeTab, setActiveTab] = useState('LIVE'); // LIVE, NOTIFS, PROFILE
  const [editingLocation, setEditingLocation] = useState(false);

  // Filter notifications relevant to this parent's child
  const childNotifs = notifications.filter(n => n.studentId === student.id || !n.studentId);

  // Polyline route coordinates
  const routePolyline = busData.stops.map(s => s.coords);

  return (
    <div className="max-w-md mx-auto space-y-5">
      
      {/* Smartphone Device Frame */}
      <div className="glass-panel p-5 space-y-5 border-2 border-emerald-500/30 shadow-2xl rounded-3xl relative overflow-hidden">
        
        {/* Top Mobile Status Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide uppercase">Parent Safety Portal</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">LIVE SYNC</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Child Profile Info Card */}
        <div className="glass-card p-4 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={student.avatarUrl} 
                alt={student.firstName}
                className="w-13 h-13 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[9px] text-white font-bold">✓</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{student.firstName} {student.lastName}</h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md font-semibold">{student.grade}</span>
              </div>
              <p className="text-xs text-slate-400">Assigned: <strong className="text-white">{student.assignedBus}</strong> ({busData.driverName})</p>
            </div>
          </div>

          <a 
            href={`tel:${busData.driverPhone}`}
            className="p-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition-all"
            title="Call Bus Driver"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        {/* Real-time Child Status Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
          student.status === 'BOARDED' 
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
            : student.status === 'DROPPED_OFF'
            ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
            : 'bg-amber-950/80 border-amber-500/50 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              student.status === 'BOARDED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {student.status === 'BOARDED' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-spin" />}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {student.status === 'BOARDED' ? 'Boarding Confirmed' : 'Pickup Status'}
              </span>
              <h4 className="text-sm font-extrabold text-white">
                {student.status === 'BOARDED' 
                  ? `Safely Onboard ${student.assignedBus}` 
                  : student.status === 'DROPPED_OFF'
                  ? 'Dropped Off at Registered Stop'
                  : 'Bus Approaching Pickup Stop'}
              </h4>
              <p className="text-[11px] opacity-90 mt-0.5">
                {student.status === 'BOARDED' 
                  ? `Verified at ${student.boardingTime} via Face Biometrics` 
                  : `Expected at ${student.pickupStop}`}
              </p>
            </div>
          </div>
        </div>

        {/* Live Navigation & Map Tracking View */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live Bus Tracker Navigation</h4>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">Speed: {busData.speed}</span>
          </div>

          <div className="h-[240px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner">
            <MapContainer
              center={busData.currentCoords}
              zoom={14}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Polyline positions={routePolyline} color="#10b981" weight={4} dashArray="5, 8" />

              {/* Bus Location */}
              <Marker position={busData.currentCoords} icon={parentBusIcon}>
                <Popup>
                  <div className="text-slate-900 p-1">
                    <strong className="text-xs">{busData.busNumber} (Active Location)</strong><br />
                    <span>Speed: {busData.speed}</span>
                  </div>
                </Popup>
              </Marker>

              {/* Home Pickup Stop */}
              <Marker position={student.pickupCoords} icon={homeStopIcon}>
                <Popup>
                  <div className="text-slate-900 p-1">
                    <strong className="text-xs">Registered Pickup Stop</strong><br />
                    <span>{student.pickupStop}</span>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* Dual-Tier Real-Time Notifications Stream */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Real-Time Parent Push Alerts</h4>
            </div>
            <span className="badge badge-success text-[9px]">{childNotifs.length} Alerts Fired</span>
          </div>

          <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
            {childNotifs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Waiting for bus arrival alerts...</p>
            ) : (
              childNotifs.map(notif => (
                <div 
                  key={notif.id}
                  className={`glass-card p-3 border-l-4 ${
                    notif.type === 'STUDENT_BOARDED' 
                      ? 'border-l-emerald-500 bg-emerald-950/20' 
                      : 'border-l-amber-500 bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {notif.type === 'STUDENT_BOARDED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Bus className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <h5 className="text-xs font-bold text-white">{notif.title}</h5>
                    </div>
                    <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 pl-6 leading-relaxed">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Emergency SOS & Support Trigger */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => alert("SOS Alert dispatched to School Admin & Bus Driver!")}
            className="w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <HeartPulse className="w-4 h-4 text-red-400" />
            <span>Emergency 1-Tap School Transport SOS</span>
          </button>
        </div>

      </div>

    </div>
  );
}
