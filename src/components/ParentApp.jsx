import React from 'react';
import { 
  Bus, Bell, CheckCircle2, MapPin, Phone, ShieldCheck, Clock, Navigation, AlertCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const parentBusIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -15],
});

const homeStopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1216/1216895.png',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -28],
});

export default function ParentApp({ student, busData, notifications, viewMode = 'MOBILE' }) {
  const childNotifs = notifications.filter(n => n.studentId === student.id || !n.studentId);
  const routePolyline = busData.stops.map(s => s.coords);

  const content = (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto">
      
      {/* Top Header */}
      <div className="pt-3 px-5 pb-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
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
          className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30"
          title="Call Bus Driver"
        >
          <Phone className="w-4 h-4" />
        </a>
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-4">
        
        {/* Child Status Banner */}
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
                {student.status === 'BOARDED' ? `Verified at ${student.boardingTime} via Biometrics` : `Pickup: ${student.pickupStop}`}
              </p>
            </div>
          </div>
        </div>

        {/* Feature 1: Live Bus Map */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Bus Live Navigation Map</h3>
            </div>
            <span className="text-xs font-bold text-emerald-400">Speed: {busData.speed}</span>
          </div>

          <div className="h-[250px] rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
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

        {/* Feature 2: Child Boarding Notifications List */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Child Boarding Notifications</h3>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-md">{childNotifs.length} Alerts</span>
          </div>

          <div className="space-y-2.5">
            {childNotifs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Waiting for bus arrival alerts...</p>
            ) : (
              childNotifs.map(notif => (
                <div 
                  key={notif.id}
                  className={`p-3 rounded-2xl border-l-4 ${
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

  return viewMode === 'MOBILE' ? (
    <div className="android-device-frame">
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
