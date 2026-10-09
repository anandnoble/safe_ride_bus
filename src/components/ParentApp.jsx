import React, { useState } from 'react';
import { 
  Bus, Bell, CheckCircle2, MapPin, Phone, ShieldCheck, Clock, 
  Navigation, HeartPulse, ChevronRight, User, AlertTriangle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

export default function ParentApp({ student, busData, notifications }) {
  const [activeTask, setActiveTask] = useState('MAP'); // MAP, ALERTS, PROFILE

  const childNotifs = notifications.filter(n => n.studentId === student.id || !n.studentId);
  const routePolyline = busData.stops.map(s => s.coords);

  return (
    <div className="android-phone-frame text-white">
      
      {/* Android Top Speaker Notch */}
      <div className="android-notch">
        <div className="android-camera-lens" />
      </div>

      {/* App Mobile Header */}
      <div className="pt-9 px-5 pb-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={student.avatarUrl} 
            alt={student.firstName}
            className="w-10 h-10 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
          />
          <div>
            <h2 className="text-base font-extrabold text-white">{student.firstName} {student.lastName}</h2>
            <p className="text-xs text-slate-400">{student.grade} • {student.assignedBus}</p>
          </div>
        </div>

        <a 
          href={`tel:${busData.driverPhone}`}
          className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center"
          title="Call Driver"
        >
          <Phone className="w-4 h-4" />
        </a>
      </div>

      {/* Main Task Workspace */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto">
        
        {/* Child Real-Time Status Banner */}
        <div className={`p-4 rounded-3xl border flex items-center justify-between shadow-xl ${
          student.status === 'BOARDED' 
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            : 'bg-amber-950/90 border-amber-500/50 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              student.status === 'BOARDED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {student.status === 'BOARDED' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {student.status === 'BOARDED' ? 'Boarding Confirmed' : 'Pickup Status'}
              </span>
              <h4 className="text-sm font-extrabold text-white">
                {student.status === 'BOARDED' ? `Onboard ${student.assignedBus}` : 'Bus Approaching Stop'}
              </h4>
              <p className="text-[11px] opacity-90">
                {student.status === 'BOARDED' ? `Verified at ${student.boardingTime}` : `Pickup: ${student.pickupStop}`}
              </p>
            </div>
          </div>
        </div>

        {/* TASK 1: LIVE MAP NAVIGATION TRACKER */}
        {activeTask === 'MAP' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Live Bus GPS Navigation</span>
              <span className="text-xs font-bold text-emerald-400">Speed: {busData.speed}</span>
            </div>

            <div className="h-[340px] rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl">
              <MapContainer center={busData.currentCoords} zoom={14} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={routePolyline} color="#10b981" weight={4} dashArray="5, 8" />
                
                <Marker position={busData.currentCoords} icon={parentBusIcon}>
                  <Popup><strong>{busData.busNumber} (Active Location)</strong></Popup>
                </Marker>

                <Marker position={student.pickupCoords} icon={homeStopIcon}>
                  <Popup><strong>Registered Pickup Stop</strong></Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* TASK 2: PUSH ALERTS FEED */}
        {activeTask === 'ALERTS' && (
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Dual-Tier Real-Time Push Alerts</span>

            <div className="space-y-3">
              {childNotifs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Waiting for bus arrival alerts...</p>
              ) : (
                childNotifs.map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-4 rounded-2xl border-l-4 ${
                      notif.type === 'STUDENT_BOARDED' ? 'border-l-emerald-500 bg-emerald-950/30' : 'border-l-amber-500 bg-amber-950/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white">{notif.title}</h5>
                      <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TASK 3: CHILD PROFILE */}
        {activeTask === 'PROFILE' && (
          <div className="space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Student Transportation Details</span>

            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-700">
                <span className="text-slate-400">Student Official ID</span>
                <span className="font-bold text-white">{student.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700">
                <span className="text-slate-400">Grade & Section</span>
                <span className="font-bold text-white">{student.grade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700">
                <span className="text-slate-400">Parent / Guardian</span>
                <span className="font-bold text-white">{student.parentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700">
                <span className="text-slate-400">Assigned Bus</span>
                <span className="font-bold text-blue-400">{student.assignedBus}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Pickup Stop</span>
                <span className="font-bold text-white truncate max-w-[160px]">{student.pickupStop}</span>
              </div>
            </div>
          </div>
        )}

        {/* TASK BUTTON: EMERGENCY SOS */}
        <button
          onClick={() => alert("SOS Emergency Alert sent to School Administration & Bus Driver!")}
          className="w-full py-3.5 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-2"
        >
          <HeartPulse className="w-4 h-4 text-red-400" />
          <span>Emergency 1-Tap School SOS</span>
        </button>

      </div>

      {/* Android Bottom Navigation Bar */}
      <div className="android-bottom-nav">
        <button onClick={() => setActiveTask('MAP')} className={`android-nav-item ${activeTask === 'MAP' ? 'active' : ''}`}>
          <div className="nav-icon-wrapper"><Navigation className="w-5 h-5" /></div>
          <span>Live Map</span>
        </button>

        <button onClick={() => setActiveTask('ALERTS')} className={`android-nav-item ${activeTask === 'ALERTS' ? 'active' : ''}`}>
          <div className="nav-icon-wrapper"><Bell className="w-5 h-5" /></div>
          <span>Alerts</span>
        </button>

        <button onClick={() => setActiveTask('PROFILE')} className={`android-nav-item ${activeTask === 'PROFILE' ? 'active' : ''}`}>
          <div className="nav-icon-wrapper"><User className="w-5 h-5" /></div>
          <span>Profile</span>
        </button>
      </div>

    </div>
  );
}
