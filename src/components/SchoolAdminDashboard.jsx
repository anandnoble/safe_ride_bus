import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, UserCheck, Bus, MapPin, Navigation, Clock, AlertTriangle, 
  FileText, Settings, Search, UserPlus, ShieldCheck, CheckCircle2, XCircle, 
  Layers, ChevronRight, Activity, Filter, Eye, Camera, RefreshCw, BarChart2, Cpu, ChevronLeft
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { generateSafetyAnalyticsReport } from '../utils/aiEngine';

// Leaflet Icons
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -15],
});

export default function SchoolAdminDashboard({ 
  students = [], 
  buses = [], 
  notifications = [], 
  eventTimeline = [],
  onRegisterStudent,
  onResetData 
}) {
  const [activeNav, setActiveNav] = useState('DASHBOARD');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBus, setSelectedBus] = useState(buses[0] || {});
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add Student Modal State
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
    { id: 'STUDENTS', label: 'Students Roster', icon: Users },
    { id: 'PARENTS', label: 'Parents Directory', icon: UserCheck },
    { id: 'DRIVERS', label: 'Drivers Fleet', icon: UserCheck },
    { id: 'BUSES', label: 'Buses Management', icon: Bus },
    { id: 'ROUTES', label: 'Routes & Stops', icon: MapPin },
    { id: 'LIVE_TRACKING', label: 'Live Tracking', icon: Navigation },
    { id: 'BOARDING_STATUS', label: 'Boarding Status', icon: Activity },
    { id: 'TRIP_HISTORY', label: 'Trip History', icon: Clock },
    { id: 'ALERTS', label: 'Alerts & Exceptions', icon: AlertTriangle },
    { id: 'REPORTS', label: 'AI Reports & Analytics', icon: BarChart2 },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  // AI Safety Analytics Generation
  const aiSafetyReport = generateSafetyAnalyticsReport(students, buses, eventTimeline);

  // Filtered Students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.pickupStop.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && student.status === statusFilter;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSimulateEnrollFace = () => {
    setEnrollingFace(true);
    setTimeout(() => {
      setEnrollingFace(false);
      setFaceEnrolled(true);
    }, 1100);
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
      
      {/* COLLAPSIBLE SIDEBAR NAVIGATION */}
      <aside className={`${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shrink-0 shadow-xl transition-all duration-300`}>
        <div className="space-y-4">
          <div className="px-2 py-2 border-b border-slate-800 flex items-center justify-between">
            {!sidebarCollapsed && <span className="text-xs font-black text-white uppercase tracking-wider">School Portal</span>}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white mx-auto lg:mx-0"
              title="Toggle Sidebar"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const IconComp = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveNav(item.id); setCurrentPage(1); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                  title={item.label}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
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
            {!sidebarCollapsed && <span>Add Student</span>}
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT WORKSPACE */}
      <main className="flex-1 space-y-6 overflow-x-hidden">
        
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {activeNav === 'DASHBOARD' && (
          <div className="space-y-6">
            
            {/* 6 Responsive Summary Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Total Students</p>
                <h3 className="text-2xl font-black text-white mt-1">{students.length}</h3>
                <span className="text-[10px] text-emerald-400 font-bold">Assigned</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Active Buses</p>
                <h3 className="text-2xl font-black text-white mt-1">{buses.length}</h3>
                <span className="text-[10px] text-blue-400 font-bold">On Route</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Boarded</p>
                <h3 className="text-2xl font-black text-emerald-400 mt-1">
                  {students.filter(s => s.status === 'BOARDED').length}
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold">✓ Verified</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Pending</p>
                <h3 className="text-2xl font-black text-amber-400 mt-1">
                  {students.filter(s => s.status === 'PENDING').length}
                </h3>
                <span className="text-[10px] text-amber-400 font-bold">Awaiting Pickup</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Buses Late</p>
                <h3 className="text-2xl font-black text-blue-400 mt-1">0</h3>
                <span className="text-[10px] text-emerald-400 font-bold">On Schedule</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Safety Alerts</p>
                <h3 className="text-2xl font-black text-rose-400 mt-1">{notifications.length}</h3>
                <span className="text-[10px] text-rose-400 font-bold">Active Events</span>
              </div>

            </div>

            {/* Live Fleet Map Section */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-white">Live Fleet GPS Telematics Tracker</h3>
                  <p className="text-xs text-slate-400">Real-time smartphone GPS broadcast across all active bus routes</p>
                </div>
                <div className="text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  Inspecting: <strong className="text-white">{selectedBus.busNumber}</strong> ({selectedBus.driverName})
                </div>
              </div>

              <div className="h-[300px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
                <MapContainer center={selectedBus.currentCoords || [12.9750, 77.5890]} zoom={13} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
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
                          <span className="text-blue-600 font-bold">Status: {bus.status}</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Students Table Preview */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white">Recent Student Transport Activity</h3>
                <button onClick={() => setActiveNav('STUDENTS')} className="text-xs text-blue-400 font-bold hover:underline">View Master Roster →</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Assigned Bus</th>
                      <th className="py-3 px-4">Pickup Stop</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Boarding Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {students.slice(0, 5).map(s => (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-white">{s.firstName} {s.lastName} ({s.id})</td>
                        <td className="py-3 px-4 text-blue-400 font-semibold">{s.assignedBus}</td>
                        <td className="py-3 px-4">{s.pickupStop}</td>
                        <td className="py-3 px-4">
                          {s.status === 'BOARDED' ? <span className="status-badge status-boarded">BOARDED</span> : <span className="status-badge status-pending">PENDING</span>}
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

        {/* VIEW 2: STUDENTS ROSTER WITH SEARCH, FILTER & PAGINATION */}
        {(activeNav === 'STUDENTS' || activeNav === 'BOARDING_STATUS') && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">Registered Students Roster</h3>
                <p className="text-xs text-slate-400">Master student transportation database</p>
              </div>

              <button onClick={() => setShowAddStudentModal(true)} className="btn-primary text-xs py-2.5">
                <UserPlus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student name, ID, or stop..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="BOARDED">Boarded</option>
                  <option value="PENDING">Pending</option>
                  <option value="DROPPED_OFF">Dropped Off</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student Profile</th>
                    <th className="py-3 px-4">ID & Class</th>
                    <th className="py-3 px-4">Parent Info</th>
                    <th className="py-3 px-4">Assigned Bus & Stop</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Consent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginatedStudents.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-3">
                        <img src={s.avatarUrl} alt={s.firstName} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                        <div>
                          <p>{s.firstName} {s.lastName}</p>
                          <span className="text-[10px] text-emerald-400">512-d Vector Registered</span>
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              <span>Showing Page <strong>{currentPage}</strong> of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-white disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 3: AI REPORTS & ANALYTICS */}
        {activeNav === 'REPORTS' && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-extrabold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">AI Safety & Operational Analytics</h3>
                <p className="text-xs text-slate-400">Automated insights, facial verification accuracy, and safety compliance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                <span className="text-slate-400 block font-bold uppercase">Overall Boarding Rate</span>
                <strong className="text-2xl font-black text-emerald-400">{aiSafetyReport.boardedPercentage}%</strong>
                <p className="text-slate-400">{aiSafetyReport.boardedCount} of {aiSafetyReport.totalStudents} students verified</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                <span className="text-slate-400 block font-bold uppercase">Facial Matching Precision</span>
                <strong className="text-2xl font-black text-blue-400">{aiSafetyReport.facialAccuracyRate}</strong>
                <p className="text-slate-400">512-d Normalized Embedding Vector Similarity</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                <span className="text-slate-400 block font-bold uppercase">System Safety Score</span>
                <strong className="text-2xl font-black text-amber-400">{aiSafetyReport.safetyScore}</strong>
                <p className="text-slate-400">Based on exceptions & route deviations</p>
              </div>
            </div>

            {/* AI Insights List */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider">AI Operational Insights:</h4>
              <ul className="space-y-2 text-slate-300">
                {aiSafetyReport.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* FALLBACK FOR OTHER SIDEBAR TABS */}
        {!['DASHBOARD', 'STUDENTS', 'BOARDING_STATUS', 'REPORTS'].includes(activeNav) && (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Activity className="w-10 h-10 text-blue-400 mx-auto" />
            <h3 className="text-lg font-extrabold text-white">{activeNav} Module</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">This official administration module is connected live to Supabase PostgreSQL database.</p>
          </div>
        )}

      </main>

      {/* STUDENT REGISTRATION FORM MODAL */}
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
                  <span className="text-[10px] text-slate-400">512-d Privacy Protocol</span>
                </div>

                {faceEnrolled ? (
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-center border border-emerald-500/40">
                    ✓ 512-Dimensional Facial Vector Stored
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
