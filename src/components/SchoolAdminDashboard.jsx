import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, UserCheck, Bus, MapPin, Navigation, Clock, AlertTriangle, 
  FileText, Settings, Search, UserPlus, ShieldCheck, CheckCircle2, XCircle, 
  Layers, ChevronRight, Activity, Filter, Eye, Camera, RefreshCw
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet Icons
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

export default function SchoolAdminDashboard({ 
  students, 
  buses, 
  notifications, 
  eventTimeline,
  onRegisterStudent,
  onResetData 
}) {
  const [activeNav, setActiveNav] = useState('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBus, setSelectedBus] = useState(buses[0]);

  // Form State for Add Student
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    studentId: `STU${Math.floor(100 + Math.random() * 900)}`,
    firstName: '',
    lastName: '',
    classVal: 'Class 8',
    sectionVal: 'Section A',
    parentName: '',
    parentContact: '+91 98765 43210',
    pickupStop: 'Stop 03 - Green Valley Apartments',
    dropStop: 'Stop 03 - Green Valley Apartments',
    assignedBus: 'Bus 01',
    emergencyContact: '+91 91234 56789',
    consentStatus: 'Approved by Parent',
  });
  const [faceEnrolled, setFaceEnrolled] = useState(false);
  const [enrollingFace, setEnrollingFace] = useState(false);

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'STUDENTS', label: 'Students', icon: Users },
    { id: 'PARENTS', label: 'Parents', icon: UserCheck },
    { id: 'DRIVERS', label: 'Drivers', icon: UserCheck },
    { id: 'BUSES', label: 'Buses', icon: Bus },
    { id: 'ROUTES', label: 'Routes & Stops', icon: MapPin },
    { id: 'LIVE_TRACKING', label: 'Live Tracking', icon: Navigation },
    { id: 'BOARDING_STATUS', label: 'Boarding Status', icon: Activity },
    { id: 'TRIP_HISTORY', label: 'Trip History', icon: Clock },
    { id: 'ALERTS', label: 'Alerts & Exceptions', icon: AlertTriangle },
    { id: 'REPORTS', label: 'Reports', icon: FileText },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  // Calculated Stats
  const activeBusesCount = buses.filter(b => b.status === 'On Route' || b.status === 'Arrived School').length;
  const totalExpected = 126;
  const totalBoarded = students.filter(s => s.status === 'BOARDED').length + 114;
  const totalNotBoarded = totalExpected - totalBoarded;

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.pickupStop.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && student.status === statusFilter;
  });

  const handleSimulateEnrollFace = () => {
    setEnrollingFace(true);
    setTimeout(() => {
      setEnrollingFace(false);
      setFaceEnrolled(true);
    }, 1200);
  };

  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!newStudentForm.firstName || !newStudentForm.lastName || !newStudentForm.parentName) {
      alert('Please fill out student and parent details.');
      return;
    }

    const created = {
      id: newStudentForm.studentId,
      firstName: newStudentForm.firstName,
      lastName: newStudentForm.lastName,
      classSection: `${newStudentForm.classVal} — ${newStudentForm.sectionVal}`,
      parentName: newStudentForm.parentName,
      parentPhone: newStudentForm.parentContact,
      parentEmail: 'parent@example.com',
      assignedBus: newStudentForm.assignedBus,
      busId: "BUS-01",
      pickupStop: newStudentForm.pickupStop,
      dropStop: newStudentForm.dropStop,
      pickupCoords: [12.9716, 77.5946],
      status: "PENDING",
      boardingTime: null,
      dropTime: null,
      verificationStatus: null,
      confidenceScore: null,
      avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80",
      faceRegistered: faceEnrolled,
      consentStatus: newStudentForm.consentStatus,
    };

    onRegisterStudent(created);
    setShowAddStudentModal(false);
    alert(`Student ${created.firstName} ${created.lastName} (${created.id}) registered successfully!`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[780px]">
      
      {/* OFFICIAL SIDEBAR NAVIGATION (12 Items) */}
      <aside className="w-full lg:w-64 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shrink-0 shadow-xl">
        <div className="space-y-4">
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black text-white uppercase tracking-wider">School Portal</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const IconComp = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="w-full btn-primary py-2.5 text-xs font-extrabold justify-center"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT WORKSPACE */}
      <main className="flex-1 space-y-6">
        
        {/* VIEW 1: DASHBOARD HOME */}
        {activeNav === 'DASHBOARD' && (
          <div className="space-y-6">
            
            {/* Summary Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Active Buses</p>
                <h3 className="text-2xl font-black text-white mt-1">4</h3>
                <span className="text-[10px] text-emerald-400 font-bold">In Transit</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Students Expected</p>
                <h3 className="text-2xl font-black text-white mt-1">126</h3>
                <span className="text-[10px] text-slate-400">Total Assigned</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Students Boarded</p>
                <h3 className="text-2xl font-black text-emerald-400 mt-1">{totalBoarded}</h3>
                <span className="text-[10px] text-emerald-400 font-bold">✓ Verified</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Not Yet Boarded</p>
                <h3 className="text-2xl font-black text-amber-400 mt-1">{totalNotBoarded}</h3>
                <span className="text-[10px] text-amber-400 font-bold">Pending Pickups</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Active Trips</p>
                <h3 className="text-2xl font-black text-blue-400 mt-1">4</h3>
                <span className="text-[10px] text-blue-400 font-bold">Live Monitoring</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Alerts</p>
                <h3 className="text-2xl font-black text-red-400 mt-1">2</h3>
                <span className="text-[10px] text-red-400 font-bold">Requires Action</span>
              </div>

            </div>

            {/* Live Bus Tracking Map Section */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Live Bus Tracking Fleet Overview</h3>
                  <p className="text-xs text-slate-400">Real-time smartphone GPS telematics broadcast across all active routes</p>
                </div>
                <div className="text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  Monitoring: <strong className="text-white">{selectedBus.busNumber}</strong> ({selectedBus.driverName})
                </div>
              </div>

              <div className="h-[300px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
                <MapContainer center={selectedBus.currentCoords} zoom={13} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {buses.map(bus => (
                    <Marker 
                      key={bus.id} 
                      position={bus.currentCoords} 
                      icon={busIcon}
                      eventHandlers={{ click: () => setSelectedBus(bus) }}
                    >
                      <Popup>
                        <div className="text-slate-900 p-1 text-xs">
                          <strong>{bus.busNumber}</strong><br />
                          <span>Driver: {bus.driverName}</span><br />
                          <span>Current Stop: {bus.currentStop}</span><br />
                          <span>Next Stop: {bus.nextStop}</span><br />
                          <span className="text-blue-600 font-bold">Status: {bus.status}</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Bus Status Pill */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Bus className="w-5 h-5 text-blue-400" />
                  <div>
                    <strong className="text-white text-sm">{selectedBus.busNumber}</strong>
                    <p className="text-slate-400">Driver: {selectedBus.driverName} • Route: {selectedBus.route}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Current Stop</span>
                    <strong className="text-white">{selectedBus.currentStop}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Next Stop</span>
                    <strong className="text-white">{selectedBus.nextStop}</strong>
                  </div>
                  <span className="status-badge status-boarded">{selectedBus.status}</span>
                </div>
              </div>
            </div>

            {/* Boarding Status Table */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white">Boarding Status Roster</h3>
                <button onClick={() => setActiveNav('STUDENTS')} className="text-xs text-blue-400 font-bold hover:underline">View All Students →</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Bus</th>
                      <th className="py-3 px-4">Stop</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-white">{s.firstName} {s.lastName} ({s.id})</td>
                        <td className="py-3 px-4 text-blue-400 font-semibold">{s.assignedBus}</td>
                        <td className="py-3 px-4">{s.pickupStop}</td>
                        <td className="py-3 px-4">
                          {s.status === 'BOARDED' ? (
                            <span className="status-badge status-boarded">BOARDED</span>
                          ) : s.status === 'NOT_BOARDED' ? (
                            <span className="status-badge status-not-boarded">NOT BOARDED</span>
                          ) : s.status === 'VERIFICATION_FAILED' ? (
                            <span className="status-badge status-failed">VERIFICATION FAILED</span>
                          ) : (
                            <span className="status-badge status-pending">PENDING</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">{s.boardingTime || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: DEDICATED LIVE TRACKING SCREEN */}
        {activeNav === 'LIVE_TRACKING' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-extrabold text-white">Live Fleet Tracking</h3>
              
              <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
                <MapContainer center={[12.9750, 77.5890]} zoom={13} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {buses.map(b => (
                    <Marker key={b.id} position={b.currentCoords} icon={busIcon} eventHandlers={{ click: () => setSelectedBus(b) }}>
                      <Popup>
                        <strong className="text-sm">{b.busNumber}</strong><br />
                        Driver: {b.driverName}<br />
                        Current Stop: {b.currentStop}<br />
                        Next Stop: {b.nextStop}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Selected Bus Inspection Card */}
              <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h4 className="text-base font-bold text-white">{selectedBus.busNumber} Inspection Card</h4>
                  <span className="status-badge status-boarded">{selectedBus.status}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div><span className="text-slate-400 block">Driver Name</span><strong className="text-white text-sm">{selectedBus.driverName}</strong></div>
                  <div><span className="text-slate-400 block">Route Name</span><strong className="text-white text-sm">{selectedBus.route}</strong></div>
                  <div><span className="text-slate-400 block">Current Stop</span><strong className="text-white text-sm">{selectedBus.currentStop}</strong></div>
                  <div><span className="text-slate-400 block">Next Stop</span><strong className="text-white text-sm">{selectedBus.nextStop}</strong></div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-700">
                  <div><span className="text-slate-400 block">Students Expected</span><strong className="text-white font-mono">{selectedBus.studentsExpected}</strong></div>
                  <div><span className="text-slate-400 block">Students Boarded</span><strong className="text-emerald-400 font-mono">{selectedBus.studentsBoarded}</strong></div>
                  <div><span className="text-slate-400 block">Students Not Boarded</span><strong className="text-amber-400 font-mono">{selectedBus.studentsNotBoarded}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: STUDENTS MANAGEMENT TABLE */}
        {(activeNav === 'STUDENTS' || activeNav === 'BOARDING_STATUS') && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">Registered Students Roster</h3>
                <p className="text-xs text-slate-400">Official student transport roster managed exclusively by School Administration</p>
              </div>

              <button onClick={() => setShowAddStudentModal(true)} className="btn-primary text-xs py-2.5">
                <UserPlus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">ID & Class</th>
                    <th className="py-3 px-4">Parent Info</th>
                    <th className="py-3 px-4">Assigned Bus & Stop</th>
                    <th className="py-3 px-4">Boarding Status</th>
                    <th className="py-3 px-4 text-right">Consent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-3">
                        <img src={s.avatarUrl} alt={s.firstName} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                        <div>
                          <p>{s.firstName} {s.lastName}</p>
                          <span className="text-[10px] text-emerald-400">Face Vector Registered</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">{s.id}<br /><span className="text-slate-400 font-normal">{s.classSection}</span></td>
                      <td className="py-3.5 px-4">{s.parentName}<br /><span className="text-slate-400">{s.parentPhone}</span></td>
                      <td className="py-3.5 px-4"><span className="text-blue-400 font-bold">{s.assignedBus}</span><br /><span className="text-slate-400">{s.pickupStop}</span></td>
                      <td className="py-3.5 px-4">
                        {s.status === 'BOARDED' ? <span className="status-badge status-boarded">BOARDED</span> : <span className="status-badge status-pending">PENDING</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right"><span className="text-emerald-400 font-bold">{s.consentStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: TRIP HISTORY & AUDIT TIMELINE */}
        {activeNav === 'TRIP_HISTORY' && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-extrabold text-white">Transportation Audit Event History</h3>
            
            <div className="space-y-3">
              {eventTimeline.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 flex items-center gap-4 text-xs">
                  <span className="font-mono text-emerald-400 font-bold w-16 shrink-0">{item.time}</span>
                  <div className="flex-1 text-slate-200">{item.event}</div>
                  <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-[10px]">{item.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FALLBACK FOR OTHER SIDEBAR NAV TABS */}
        {!['DASHBOARD', 'LIVE_TRACKING', 'STUDENTS', 'BOARDING_STATUS', 'TRIP_HISTORY'].includes(activeNav) && (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Activity className="w-10 h-10 text-blue-400 mx-auto" />
            <h3 className="text-lg font-extrabold text-white">{activeNav} View</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">This official module is populated real-time from active bus trips and driver face scans.</p>
          </div>
        )}

      </main>

      {/* STUDENT REGISTRATION FORM MODAL (Students -> Add Student) */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-blue-500/40 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                Add Student & Enroll Biometrics
              </h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Student Official ID *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.studentId}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, studentId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Class & Section *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.classVal}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, classVal: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav"
                    value={newStudentForm.firstName}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, firstName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma"
                    value={newStudentForm.lastName}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, lastName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={newStudentForm.parentName}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Parent Contact *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.parentContact}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parentContact: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Assigned Bus *</label>
                  <select
                    value={newStudentForm.assignedBus}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, assignedBus: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Bus 01">Bus 01</option>
                    <option value="Bus 02">Bus 02</option>
                    <option value="Bus 03">Bus 03</option>
                    <option value="Bus 04">Bus 04</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Pickup Stop *</label>
                  <select
                    value={newStudentForm.pickupStop}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, pickupStop: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Stop 03 - Green Valley Apartments">Stop 03 - Green Valley Apartments</option>
                    <option value="Stop 02 - Oakwood Park Gate">Stop 02 - Oakwood Park Gate</option>
                    <option value="Stop 04 - Sunrise Circle">Stop 04 - Sunrise Circle</option>
                  </select>
                </div>
              </div>

              {/* Face Enrollment Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="font-bold flex items-center gap-1.5"><Camera className="w-4 h-4" /> Face Biometric Vector Extraction</span>
                  <span className="text-[10px] text-slate-400">Strict Privacy Protocol</span>
                </div>

                {faceEnrolled ? (
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-center border border-emerald-500/40">
                    ✓ 512-Dimensional Facial Vector Generated
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulateEnrollFace}
                    className="w-full py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold"
                  >
                    {enrollingFace ? "Extracting 512-d Face Vector..." : "Capture Photo & Extract Vector"}
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddStudentModal(false)} className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
                <button type="submit" className="w-1/2 btn-primary py-2.5">Save Student Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
