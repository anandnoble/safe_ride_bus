import React, { useState } from 'react';
import { 
  Bus, Users, CheckCircle2, Clock, AlertTriangle, Search, Filter, UserPlus, 
  MapPin, ShieldCheck, FileText, ChevronRight, RefreshCw, Smartphone
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Leaflet Icons
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -15],
});

const stopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -25],
});

export default function SchoolAdminPortal({ 
  students, 
  busData, 
  notifications, 
  onOpenRegisterModal,
  onResetData 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter students based on search and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.pickupStop.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && student.status === statusFilter;
  });

  // Calculate statistics
  const totalStudents = students.length;
  const boardedCount = students.filter(s => s.status === 'BOARDED').length;
  const pendingCount = students.filter(s => s.status === 'PENDING').length;
  const droppedCount = students.filter(s => s.status === 'DROPPED_OFF').length;
  const mismatchCount = students.filter(s => s.status === 'MISMATCH').length;

  // Route polyline coordinates for map
  const routePolyline = busData.stops.map(stop => stop.coords);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-info">Central Control Center</span>
            <span className="text-xs text-slate-400">Live Transportation Roster</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            School Transportation Safety Dashboard
          </h2>
          <p className="text-sm text-slate-400">
            Real-time biometric boarding verification, fleet location, and safety audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-xs font-medium transition-all"
            title="Reset demonstration state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Student & Enroll Face</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Card 1: Active Buses */}
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Fleet Buses</p>
            <h3 className="text-2xl font-bold text-white mt-1">1 / 1</h3>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Bus 01 In Transit
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Bus className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Students Boarded */}
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Boarded Onboard</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{boardedCount}</h3>
            <span className="text-[11px] text-slate-400 mt-1">Verified via Biometrics</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Pending Pickups */}
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending Pickups</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</h3>
            <span className="text-[11px] text-slate-400 mt-1">Expected at Stops</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Dropped Off */}
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Dropped Off</p>
            <h3 className="text-2xl font-bold text-cyan-400 mt-1">{droppedCount}</h3>
            <span className="text-[11px] text-slate-400 mt-1">Reached Home Stop</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        {/* Card 5: Mismatches & Alerts */}
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Safety Alerts</p>
            <h3 className="text-2xl font-bold text-red-400 mt-1">{mismatchCount}</h3>
            <span className="text-[11px] text-slate-400 mt-1">Exceptions Flagged</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Grid: Map & Live Roster Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fleet Tracking Map (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Live Fleet GPS Map</h3>
              <span className="badge badge-success text-[10px]">Real-time Tracking</span>
            </div>
            <div className="text-xs text-slate-400">
              Active Bus: <strong className="text-white">{busData.busNumber}</strong> ({busData.driverName})
            </div>
          </div>

          <div className="h-[340px] rounded-xl overflow-hidden border border-slate-700/60 shadow-inner">
            <MapContainer
              center={busData.currentCoords}
              zoom={13}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Route Polyline */}
              <Polyline positions={routePolyline} color="#3b82f6" weight={4} dashArray="6, 8" />

              {/* Bus Location Marker */}
              <Marker position={busData.currentCoords} icon={busIcon}>
                <Popup>
                  <div className="text-slate-900 p-1">
                    <strong className="text-sm">{busData.busNumber}</strong><br />
                    <span>Driver: {busData.driverName}</span><br />
                    <span>Speed: {busData.speed}</span><br />
                    <span className="text-xs text-blue-600 font-semibold">GPS Location Broadcast: ACTIVE</span>
                  </div>
                </Popup>
              </Marker>

              {/* Stop Markers */}
              {busData.stops.map(stop => (
                <Marker key={stop.id} position={stop.coords} icon={stopIcon}>
                  <Popup>
                    <div className="text-slate-900 p-1">
                      <strong className="text-sm">{stop.name}</strong><br />
                      <span>Sequence Order: Stop #{stop.order}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Real-time Safety Notifications Feed (1 col) */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Safety Event Log</h3>
              </div>
              <span className="badge badge-info text-[10px]">Real-Time Audit</span>
            </div>

            <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No transportation events recorded yet today.</p>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className="glass-card p-3 flex items-start gap-3 border-l-4 border-l-blue-500"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                      {notif.type === 'STUDENT_BOARDED' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Bus className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white truncate">{notif.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>Automated FCM Alerts: <strong className="text-emerald-400">CONNECTED</strong></span>
            <FileText className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Student Daily Transportation Roster Table */}
      <div className="glass-panel p-6 space-y-4">
        
        {/* Table Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Daily Student Transportation Roster</h3>
            <p className="text-xs text-slate-400">Real-time status of enrolled students across all assigned buses</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student, ID or stop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              {['ALL', 'BOARDED', 'PENDING', 'DROPPED_OFF'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status === 'BOARDED' ? 'Boarded' : status === 'PENDING' ? 'Pending' : 'Dropped'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">ID / Grade</th>
                <th className="py-3 px-4">Parent Info</th>
                <th className="py-3 px-4">Assigned Bus & Stop</th>
                <th className="py-3 px-4">Boarding Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Biometric Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No students match the selected search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                    
                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={student.avatarUrl} 
                          alt={student.firstName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700" 
                        />
                        <div>
                          <p className="font-bold text-white">{student.firstName} {student.lastName}</p>
                          <span className="text-[10px] text-emerald-400">Face Vector Enrolled</span>
                        </div>
                      </div>
                    </td>

                    {/* ID & Grade */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-200">{student.id}</p>
                      <p className="text-[11px] text-slate-400">{student.grade}</p>
                    </td>

                    {/* Parent Info */}
                    <td className="py-3 px-4">
                      <p className="text-slate-200 font-medium">{student.parentName}</p>
                      <p className="text-[11px] text-slate-400">{student.parentPhone}</p>
                    </td>

                    {/* Bus & Pickup Stop */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-blue-400">{student.assignedBus}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]" title={student.pickupStop}>
                        {student.pickupStop}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {student.status === 'BOARDED' ? (
                        <span className="badge badge-success">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Boarded (Verified)
                        </span>
                      ) : student.status === 'DROPPED_OFF' ? (
                        <span className="badge badge-info">
                          <MapPin className="w-3.5 h-3.5" />
                          Dropped Off
                        </span>
                      ) : student.status === 'MISMATCH' ? (
                        <span className="badge badge-danger">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Flagged Mismatch
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <Clock className="w-3.5 h-3.5" />
                          Pending Pickup
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-200">
                        {student.boardingTime || '--:--'}
                      </p>
                    </td>

                    {/* Confidence Score */}
                    <td className="py-3 px-4 text-right">
                      {student.confidenceScore ? (
                        <span className="font-bold text-emerald-400">
                          {student.confidenceScore}%
                        </span>
                      ) : (
                        <span className="text-slate-500">--</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
