import React from 'react';
import { Bus, Smartphone, School, ShieldCheck, Play, Volume2, VolumeX, Monitor } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  soundEnabled, 
  setSoundEnabled, 
  onSimulateGeofence,
  viewMode,
  setViewMode
}) {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">SafeRide AI</h1>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30">
                PRO SUITE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Zero-Hardware Smart Transportation Platform</p>
          </div>
        </div>

        {/* Perspective Role Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
          
          <button
            onClick={() => setActiveTab('PARENT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PARENT'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
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
                : 'text-slate-400 hover:text-white'
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
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <School className="w-4 h-4" />
            <span>3. School Web</span>
          </button>

        </div>

        {/* View Mode Toggle & Audio Controls */}
        <div className="flex items-center gap-2">
          
          {/* Mobile Frame vs Fullscreen Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'MOBILE' ? 'FULL' : 'MOBILE')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition-all"
            title="Toggle between Android Mobile Device Frame and Fullscreen view"
          >
            {viewMode === 'MOBILE' ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span>Fullscreen</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mobile Frame</span>
              </>
            )}
          </button>

          {/* Trigger Bus Arrived Alert */}
          <button
            onClick={onSimulateGeofence}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all"
            title="Simulate Bus Reaching Stop Geofence (Sends Alert #1)"
          >
            <Play className="w-3.5 h-3.5 fill-amber-300" />
            <span>Bus Arrived Alert</span>
          </button>

          {/* Sound Toggle */}
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
