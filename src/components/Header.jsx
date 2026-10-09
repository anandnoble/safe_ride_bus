import React, { useState } from 'react';
import { 
  Bus, Smartphone, School, ShieldCheck, Play, Volume2, VolumeX, 
  Monitor, AlertTriangle, UserX, CheckCircle2, Sliders, ChevronDown
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  soundEnabled, 
  setSoundEnabled, 
  onSimulateGeofence,
  onSimulateWrongBus,
  onSimulateUnregistered,
  onSimulateDropOff,
  viewMode,
  setViewMode
}) {
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">SafeRide AI</h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                DEMO MODE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium italic">
              "Every Stop Matters. Every Student Counts."
            </p>
          </div>
        </div>

        {/* Unified 3 Perspective Switcher */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          
          <button
            onClick={() => setActiveTab('PARENT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PARENT'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Parent Mobile</span>
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
            <span>2. Driver Mobile</span>
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
            <span>3. School Admin Web</span>
          </button>

        </div>

        {/* Controls: Demo Mode Menu + View Toggle + Audio */}
        <div className="flex items-center gap-2 relative">
          
          {/* Demo Mode Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulate Scenario</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                <p className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">Test Scenarios</p>
                <button
                  onClick={() => { onSimulateGeofence(); setShowDemoMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bus Arrived at Stop #3</span>
                </button>
                <button
                  onClick={() => { onSimulateWrongBus(); setShowDemoMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 flex items-center gap-2 text-red-400"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Wrong Bus Attempt</span>
                </button>
                <button
                  onClick={() => { onSimulateUnregistered(); setShowDemoMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 flex items-center gap-2 text-red-400"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Unregistered Student</span>
                </button>
                <button
                  onClick={() => { onSimulateDropOff(); setShowDemoMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 flex items-center gap-2 text-emerald-400"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Drop-Off Event</span>
                </button>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'MOBILE' ? 'FULL' : 'MOBILE')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition-all"
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
