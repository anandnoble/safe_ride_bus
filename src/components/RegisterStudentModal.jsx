import React, { useState } from 'react';
import { UserPlus, Camera, ShieldCheck, CheckCircle2, Upload } from 'lucide-react';

export default function RegisterStudentModal({ isOpen, onClose, onRegisterStudent }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    officialId: '',
    grade: 'Grade 6-A',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    assignedBus: 'Bus 01',
    pickupStop: 'Green Valley Apartments (Stop #3)',
  });

  const [faceEnrolled, setFaceEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  if (!isOpen) return null;

  const handleSimulateEnrollFace = () => {
    setEnrolling(true);
    setTimeout(() => {
      setEnrolling(false);
      setFaceEnrolled(true);
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.parentName) {
      alert('Please complete all required fields.');
      return;
    }

    const newStudent = {
      id: formData.officialId || `STD-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      grade: formData.grade,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone || '+91 98000 11223',
      parentEmail: formData.parentEmail || 'parent@example.com',
      assignedBus: formData.assignedBus,
      busId: "BUS-01",
      pickupStop: formData.pickupStop,
      pickupCoords: [12.9716, 77.5946],
      dropStop: formData.pickupStop,
      status: "PENDING",
      boardingTime: null,
      dropTime: null,
      verificationStatus: null,
      confidenceScore: null,
      avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80",
      faceRegistered: faceEnrolled,
    };

    onRegisterStudent(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel max-w-lg w-full p-6 space-y-5 border-blue-500/40">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2 text-blue-400">
            <UserPlus className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Enroll Student & Link Face Biometrics</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">First Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Last Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Singh"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Student Official ID</label>
              <input
                type="text"
                placeholder="STD-1006"
                value={formData.officialId}
                onChange={(e) => setFormData({ ...formData, officialId: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Grade / Section</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Grade 4-A">Grade 4-A</option>
                <option value="Grade 5-B">Grade 5-B</option>
                <option value="Grade 6-A">Grade 6-A</option>
                <option value="Grade 7-C">Grade 7-C</option>
                <option value="Grade 8-B">Grade 8-B</option>
              </select>
            </div>
          </div>

          {/* Parent Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Singh"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Parent Phone (for Alerts)</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Bus & Pickup Stop */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Assigned Pickup Stop</label>
            <select
              value={formData.pickupStop}
              onChange={(e) => setFormData({ ...formData, pickupStop: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Green Valley Apartments (Stop #3)">Green Valley Apartments (Stop #3)</option>
              <option value="Oakwood Park Gate (Stop #2)">Oakwood Park Gate (Stop #2)</option>
              <option value="Sunrise Avenue Circle (Stop #4)">Sunrise Avenue Circle (Stop #4)</option>
            </select>
          </div>

          {/* Face Vector Enrollment Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Camera className="w-4 h-4" />
                <span className="font-bold">Facial Biometrics Enrollment</span>
              </div>
              <span className="text-[10px] text-slate-400">No Raw Photo Stored</span>
            </div>

            {faceEnrolled ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">512-Dimensional Vector Enrolled</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">READY</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulateEnrollFace}
                disabled={enrolling}
                className="w-full py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>{enrolling ? "Extracting 512-d Face Embedding..." : "Scan & Extract Face Embedding Vector"}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30"
            >
              Save Student Record
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
