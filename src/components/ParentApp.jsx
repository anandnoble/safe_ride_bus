import React from 'react';
import { 
  Bus, Bell, CheckCircle2, MapPin, Phone, ShieldCheck, Clock, Navigation
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

export default function ParentApp({ student, busData, notifications }) {
  const childNotifs = notifications.filter(n => n.studentId === student.id || !n.studentId);
  const routePolyline = busData.stops.map(s => s.coords);

  return (
    <div className="app-mobile-container">
      
      {/* Top Parent Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={student.avatarUrl} 
            alt={student.firstName}
            className="w-10 h-10 rounded-xl object-cover border-2 border-blue-500 shadow-md"
          />
          <div>
            <h2 className="text-sm font-bold text-white">{student.firstName} {student.lastName}</h2>
            <p className="text-xs text-slate-400">{student.grade} • {student.assignedBus}</p>
          </div>
        </div>

        <a 
          href={`tel:${busData.driverPhone}`}
          className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30"
          title="Call Driver"
        >
          <Phone className="w-4 h-4" />
        </a>
      </div>

      {/* Main Content Vertical Stack */}
      <div className="p-4 space-y-4">
        
        {/* BLOCK 1: CHILD BOARDING STATUS BADGE */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
          student.status === 'BOARDED' 
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            : 'bg-amber-950/90 border-amber-500/50 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              student.status === 'BOARDED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {student.status === 'BOARDED' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5 animate-pulse" />}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {student.status === 'BOARDED' ? 'Boarding Confirmed' : 'Pickup Status'}
              </span>
              <h4 className="text-xs font-bold text-white">
                {student.status === 'BOARDED' ? `Onboard ${student.assignedBus}` : 'Bus Approaching Stop'}
              </h4>
              <p className="text-[11px] opacity-90">
                {student.status === 'BOARDED' ? `Verified at ${student.boardingTime} via Biometrics` : `Pickup: ${student.pickupStop}`}
              </p>
            </div>
          </div>
        </div>

        {/* BLOCK 2: LIVE BUS LOCATION TRACKING MAP */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase">Bus Live Location Tracking Map</h3>
            </div>
            <span className="text-xs font-bold text-emerald-400">Speed: {busData.speed}</span>
          </div>

          <div className="h-[240px] rounded-xl overflow-hidden border border-slate-700 shadow-inner">
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

        {/* BLOCK 3: CHILD BOARDING NOTIFICATIONS LIST */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase">Child Boarding Notifications Feed</h3>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">{childNotifs.length} Alerts</span>
          </div>

          <div className="space-y-2">
            {childNotifs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Waiting for bus arrival alerts...</p>
            ) : (
              childNotifs.map(notif => (
                <div 
                  key={notif.id}
                  className={`p-3 rounded-xl border-l-4 ${
                    notif.type === 'STUDENT_BOARDED' ? 'border-l-emerald-500 bg-emerald-950/30' : 'border-l-amber-500 bg-amber-950/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {notif.type === 'STUDENT_BOARDED' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Bus className="w-3.5 h-3.5 text-amber-400" />}
                      {notif.title}
                    </h5>
                    <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 pl-5 leading-relaxed">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
