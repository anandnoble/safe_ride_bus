import React, { useState } from 'react';
import { 
  Bus, Users, CheckCircle2, Clock, MapPin, Search, UserPlus, ShieldCheck, RefreshCw, AlertTriangle
} from 'lucide-react';

export default function SchoolAdminPortal({ 
  students, 
  busData, 
  notifications, 
  onOpenRegisterModal,
  onResetData 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.pickupStop.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && student.status === statusFilter;
  });

  const totalStudents = students.length;
  const boardedCount = students.filter(s => s.status === 'BOARDED').length;
  const pendingCount = students.filter(s => s.status === 'PENDING').length;
  const droppedCount = students.filter(s => s.status === 'DROPPED_OFF').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* School Web Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">School Portal</span>
            <span className="text-xs text-slate-400">Daily Transportation Roster</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Student Daily Boarding Attendance & Status
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* Daily Attendance Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Students</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{totalStudents}</h3>
          </div>
          <Users className="w-6 h-6 text-blue-400" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Boarded Students</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-0.5">{boardedCount}</h3>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Pending Pickups</p>
            <h3 className="text-2xl font-black text-amber-400 mt-0.5">{pendingCount}</h3>
          </div>
          <Clock className="w-6 h-6 text-amber-400" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Dropped Off</p>
            <h3 className="text-2xl font-black text-cyan-400 mt-0.5">{droppedCount}</h3>
          </div>
          <MapPin className="w-6 h-6 text-cyan-400" />
        </div>

      </div>

      {/* Student Daily Information Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Student Transportation Attendance Table</h3>
            <p className="text-xs text-slate-400">Daily verification status recorded via Driver Facial Recognition System</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or stop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
              />
            </div>

            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              {['ALL', 'BOARDED', 'PENDING'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    statusFilter === status ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status === 'BOARDED' ? 'Boarded' : 'Pending'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Student ID & Grade</th>
                <th className="py-3 px-4">Parent Info</th>
                <th className="py-3 px-4">Assigned Bus & Stop</th>
                <th className="py-3 px-4">Boarding Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Verification Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-800/40">
                  
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatarUrl} alt={student.firstName} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                      <div>
                        <p className="font-bold text-white">{student.firstName} {student.lastName}</p>
                        <span className="text-[10px] text-emerald-400">Face Registered</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white">{student.id}</p>
                    <p className="text-[11px] text-slate-400">{student.grade}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="text-white font-medium">{student.parentName}</p>
                    <p className="text-[11px] text-slate-400">{student.parentPhone}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-blue-400">{student.assignedBus}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[170px]">{student.pickupStop}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    {student.status === 'BOARDED' ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-extrabold flex items-center gap-1 border border-emerald-500/30 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        BOARDED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-extrabold flex items-center gap-1 border border-amber-500/30 w-fit">
                        <Clock className="w-3.5 h-3.5" />
                        NOT BOARDED (PENDING)
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-200">{student.boardingTime || '--:--'}</p>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {student.status === 'BOARDED' ? (
                      <span className="font-bold text-emerald-400">
                        {student.verificationStatus === 'VERIFIED_MANUAL' ? 'Conductor PIN' : `Facial Recognition (${student.confidenceScore}%)`}
                      </span>
                    ) : (
                      <span className="text-slate-500">--</span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
