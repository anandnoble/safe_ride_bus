import React from 'react';
import { Bus, Smartphone, School, ShieldCheck, Play, Volume2, VolumeX } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  soundEnabled, 
  setSoundEnabled, 
  onSimulateGeofence 
}) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 lg:px-8 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight">SafeRide AI</h1>
            <p className="text-[11px] text-slate-400">Student Bus Safety Platform</p>
          </div>
        </div>

        {/* Simple 3 Perspective Switcher */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          
          <button
            onClick={() => setActiveTab('PARENT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PARENT'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Parent App</span>
          </button>

          <button
            onClick={() => setActiveTab('DRIVER')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'DRIVER'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>2. Driver App</span>
          </button>

          <button
            onClick={() => setActiveTab('SCHOOL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SCHOOL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <School className="w-4 h-4" />
            <span>3. School Web</span>
          </button>

        </div>

        {/* Quick Demo Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateGeofence}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 flex items-center gap-1.5 transition-all"
            title="Simulate Bus Reaching Stop (Fires Bus Arrived Alert to Parent)"
          >
            <Play className="w-3.5 h-3.5 fill-amber-300" />
            <span>Bus Arrived Alert</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

      </div>
    </header>
  );
}
