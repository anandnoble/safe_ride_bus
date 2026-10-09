import React from 'react';
import { School, Bus, ShieldCheck, Play, Volume2, VolumeX, AlertTriangle } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  soundEnabled, 
  setSoundEnabled, 
  onSimulateGeofence,
  currentStopName 
}) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                SafeRide AI
              </h1>
              <span className="badge badge-success text-[10px]">Zero-Hardware</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Smart Student Transportation Safety Platform
            </p>
          </div>
        </div>

        {/* Perspective Switcher Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('SCHOOL')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'SCHOOL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <School className="w-4 h-4" />
            <span>1. School Admin Web</span>
          </button>

          <button
            onClick={() => setActiveTab('DRIVER')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'DRIVER'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>2. Driver & Staff App</span>
          </button>

          <button
            onClick={() => setActiveTab('PARENT')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'PARENT'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <div className="relative">
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-pulse" />
              <span>📱</span>
            </div>
            <span>3. Parent Mobile App</span>
          </button>
        </div>

        {/* Global Demo Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Geofence Arrival Simulation */}
          <button
            onClick={onSimulateGeofence}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-medium transition-all"
            title="Simulate Bus 01 arriving at Green Valley Apartments stop geofence"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-400" />
            <span>Simulate Geofence Arrival</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all"
            title={soundEnabled ? "Audio Chimes Enabled" : "Audio Chimes Muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

      </div>
    </header>
  );
}
