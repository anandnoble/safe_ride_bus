import React from 'react';
import { 
  Bus, Bell, CheckCircle2, MapPin, Phone, ShieldCheck, Clock, Navigation, AlertTriangle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

export default function ParentMobileApp({ student, busData, notifications, viewMode = 'MOBILE' }) {
  const childNotifs = notifications.filter(n => n.studentId === student.id || !n.studentId);
  const routePolyline = busData.stops.map(s => s.coords);

  const content = (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto">
      
      {/* Top Mobile Bar */}
      <div className="pt-3 px-5 pb-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={student.avatarUrl} 
            alt={student.firstName}
            className="w-10 h-10 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
          />
          <div>
            <h2 className="text-base font-extrabold text-white">{student.firstName} {student.lastName}</h2>
            <p className="text-xs text-slate-400">{student.classSection} • {student.assignedBus}</p>
          </div>
        </div>

        <a 
          href={`tel:${busData.driverPhone}`}
          className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30"
          title="Call Driver"
        >
          <Phone className="w-4 h-4" />
        </a>
      </div>

      {/* Main Workspace */}
      <div className="p-5 space-y-4">
        
        {/* LARGE PREMIUM STATUS CARD */}
        <div className={`p-5 rounded-3xl border shadow-xl flex flex-col items-center text-center space-y-3 ${
          student.status === 'BOARDED' 
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            : student.status === 'DROPPED_OFF'
            ? 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
            : student.status === 'VERIFICATION_FAILED'
            ? 'bg-red-950/90 border-red-500/50 text-red-200'
            : 'bg-amber-950/90 border-amber-500/50 text-amber-200'
        }`}>
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl shadow-inner">
            {student.status === 'BOARDED' ? '🚌' : student.status === 'DROPPED_OFF' ? '📍' : '⏳'}
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-widest opacity-80 block mb-1">
              CURRENT TRANSPORT STATUS
            </span>
            <h3 className="text-xl font-black text-white">
              {student.status === 'BOARDED' 
                ? 'BOARDED ✓' 
                : student.status === 'DROPPED_OFF'
                ? 'DROPPED OFF ✓'
                : student.status === 'BUS_ARRIVED'
                ? 'BUS ARRIVED AT STOP 03'
                : 'BUS APPROACHING'}
            </h3>
            <p className="text-xs mt-1 leading-relaxed">
              {student.status === 'BOARDED' 
                ? `Your child has successfully boarded ${student.assignedBus} at ${student.boardingTime || '8:12 AM'}.`
                : student.status === 'DROPPED_OFF'
                ? 'Your child has been recorded as dropped off at the registered stop.'
                : `Bus 01 is currently on route to ${student.pickupStop}.`}
            </p>
          </div>
        </div>

        {/* BUS LOCATION MAP */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-400" /> Bus Location Tracker
            </span>
            <span className="text-emerald-400 font-bold">{busData.speed}</span>
          </div>

          <div className="h-[230px] rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
            <MapContainer center={busData.currentCoords} zoom={14} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline positions={routePolyline} color="#10b981" weight={4} dashArray="5, 8" />
              
              <Marker position={busData.currentCoords} icon={parentBusIcon}>
                <Popup><strong>{busData.busNumber} (Active Location)</strong></Popup>
              </Marker>

              <Marker position={student.pickupCoords} icon={homeStopIcon}>
                <Popup><strong>{student.pickupStop}</strong></Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> Notifications Feed
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-md">{childNotifs.length} Alerts</span>
          </div>

          <div className="space-y-2">
            {childNotifs.map(notif => (
              <div key={notif.id} className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <strong className="text-white">{notif.title}</strong>
                  <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

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
