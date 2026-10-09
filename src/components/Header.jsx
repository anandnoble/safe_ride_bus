import React from 'react';
import { School, Bus, ShieldCheck, Play, Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  soundEnabled, 
  setSoundEnabled, 
  onSimulateGeofence 
}) {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">SafeRide AI</h1>
              <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Android Mobile Suite</span>
            </div>
            <p className="text-xs text-slate-400">Zero-Hardware Smart Student Transportation Safety</p>
          </div>
        </div>

        {/* Perspective Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto max-w-full">
          
          <button
            onClick={() => setActiveTab('DRIVER')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'DRIVER'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>🚌 Driver Android App</span>
          </button>

          <button
            onClick={() => setActiveTab('PARENT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'PARENT'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>📱 Parent Android App</span>
          </button>

          <button
            onClick={() => setActiveTab('SCHOOL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'SCHOOL'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <School className="w-4 h-4" />
            <span>🏫 School Web Admin</span>
          </button>

        </div>

        {/* Quick Demo Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateGeofence}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/25 transition-all"
            title="Trigger Stop Geofence Arrival (Sends Alert #1)"
          >
            <Play className="w-3.5 h-3.5 fill-amber-300" />
            <span>Trigger Geofence</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

      </div>
    </header>
  );
}
