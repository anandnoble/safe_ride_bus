import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SchoolAdminDashboard from './components/SchoolAdminDashboard';
import DriverMobileApp from './components/DriverMobileApp';
import ParentMobileApp from './components/ParentMobileApp';

import { 
  INITIAL_STUDENTS, 
  INITIAL_BUSES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_EVENT_TIMELINE 
} from './mockData';
import { playSuccessChime, playNotificationChime, playWarningChime } from './utils/audio';
import { 
  isSupabaseConnected, 
  fetchStudentsFromDB, 
  updateBoardingInDB, 
  insertNotificationInDB 
} from './lib/supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState('PARENT'); // 'PARENT', 'DRIVER', 'SCHOOL'
  const [viewMode, setViewMode] = useState('MOBILE'); // 'MOBILE', 'FULL'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Core Unified State
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [buses, setBuses] = useState(INITIAL_BUSES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [eventTimeline, setEventTimeline] = useState(INITIAL_EVENT_TIMELINE);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    async function initSupabase() {
      if (isSupabaseConnected()) {
        setDbConnected(true);
        const dbStudents = await fetchStudentsFromDB();
        if (dbStudents && dbStudents.length > 0) {
          const mapped = dbStudents.map(s => ({
            id: s.student_official_id || s.id,
            firstName: s.first_name,
            lastName: s.last_name,
            classSection: s.grade_section || 'Class 8 — Section A',
            parentName: 'Parent Guardian',
            parentPhone: '+91 98765 43210',
            parentEmail: 'parent@example.com',
            assignedBus: 'Bus 01',
            busId: 'BUS-01',
            pickupStop: 'Stop 03 - Green Valley Apartments',
            dropStop: 'Stop 03 - Green Valley Apartments',
            pickupCoords: [12.9716, 77.5946],
            status: s.status || 'PENDING',
            boardingTime: s.boarding_time,
            dropTime: null,
            verificationStatus: s.verification_status || 'VERIFIED',
            confidenceScore: s.confidence_score || 98.4,
            avatarUrl: s.avatar_url || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80",
            faceRegistered: true,
            consentStatus: 'Approved by Parent',
          }));
          setStudents(mapped);
        }
      }
    }
    initSupabase();
  }, []);

  const getCurrentTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handler: Driver clicks PROCEED to finalize batch boarding
  const handleFinalizeBoardingBatch = (validStudentsBatch) => {
    const timestamp = getCurrentTimeString();
    const validIds = validStudentsBatch.map(s => s.id);

    // 1. Update Students state
    setStudents(prev => prev.map(s => {
      if (validIds.includes(s.id)) {
        return {
          ...s,
          status: 'BOARDED',
          boardingTime: timestamp,
          verificationStatus: 'VERIFIED',
          confidenceScore: 98.4,
        };
      }
      return s;
    }));

    // 2. Dispatch Notifications for each student
    validStudentsBatch.forEach(studentObj => {
      const notif = {
        id: `NOTIF-${Date.now()}-${studentObj.id}`,
        type: 'BOARDING_CONFIRMED',
        title: 'Boarding Confirmed',
        message: `Your child ${studentObj.firstName} has boarded Bus 01.`,
        timestamp: timestamp,
        studentId: studentObj.id,
        studentName: `${studentObj.firstName} ${studentObj.lastName}`,
      };

      setNotifications(prev => [notif, ...prev]);

      if (isSupabaseConnected()) {
        updateBoardingInDB(studentObj.id, 98.4, timestamp);
        insertNotificationInDB(notif);
      }
    });

    // 3. Add to Event Timeline
    const newTimelineItems = validStudentsBatch.map(s => ({
      time: timestamp,
      event: `${s.firstName} ${s.lastName} (${s.id}) verified and boarded Bus 01 at Stop 03.`,
      type: 'BOARDING',
    }));
    setEventTimeline(prev => [...newTimelineItems, ...prev]);

    if (soundEnabled) {
      playSuccessChime();
    }
  };

  // Demo Handler: Simulate Bus Arrival at Stop 03 (Alert #1)
  const handleSimulateGeofence = async () => {
    const timestamp = getCurrentTimeString();
    
    // Update student status to BUS_ARRIVED
    setStudents(prev => prev.map(s => s.id === 'STU001' ? { ...s, status: 'BUS_ARRIVED' } : s));

    const notif = {
      id: `NOTIF-${Date.now()}`,
      type: 'BUS_ARRIVED',
      title: 'Bus Arrived',
      message: 'Bus 01 has arrived at Stop 03.',
      timestamp: timestamp,
      studentId: 'STU001',
      studentName: 'Aarav Sharma',
    };

    setNotifications(prev => [notif, ...prev]);
    setEventTimeline(prev => [{ time: timestamp, event: 'Bus 01 arrived at Stop 03.', type: 'GEOFENCE' }, ...prev]);

    if (soundEnabled) playNotificationChime();
    if (isSupabaseConnected()) insertNotificationInDB(notif);
  };

  // Demo Handler: Simulate Wrong Bus Attempt
  const handleSimulateWrongBus = () => {
    const timestamp = getCurrentTimeString();
    if (soundEnabled) playWarningChime();

    setEventTimeline(prev => [{ 
      time: timestamp, 
      event: 'EXCEPTION: Kavya Patel (Bus 04) attempted verification on Bus 01 at Stop 03. Flagged as Wrong Bus.', 
      type: 'EXCEPTION' 
    }, ...prev]);

    alert('⚠️ WRONG BUS FLAG: Student Kavya Patel is assigned to Bus 04! Boarding blocked and exception logged.');
  };

  // Demo Handler: Simulate Unregistered Student Attempt
  const handleSimulateUnregistered = () => {
    const timestamp = getCurrentTimeString();
    if (soundEnabled) playWarningChime();

    setEventTimeline(prev => [{ 
      time: timestamp, 
      event: 'EXCEPTION: Unregistered face detected at Stop 03. Boarding blocked.', 
      type: 'EXCEPTION' 
    }, ...prev]);

    alert('✕ UNREGISTERED STUDENT: This face is not registered in the SafeRide AI database! Boarding blocked.');
  };

  // Demo Handler: Simulate Drop-Off Event
  const handleSimulateDropOff = async () => {
    const timestamp = getCurrentTimeString();
    
    setStudents(prev => prev.map(s => s.id === 'STU001' ? { ...s, status: 'DROPPED_OFF', dropTime: timestamp } : s));

    const notif = {
      id: `NOTIF-${Date.now()}`,
      type: 'DROP_OFF',
      title: 'Drop-off Recorded',
      message: 'Your child has been recorded as dropped off at the registered stop.',
      timestamp: timestamp,
      studentId: 'STU001',
      studentName: 'Aarav Sharma',
    };

    setNotifications(prev => [notif, ...prev]);
    setEventTimeline(prev => [{ time: timestamp, event: 'Aarav Sharma dropped off safely at Stop 03.', type: 'DROPOFF' }, ...prev]);

    if (soundEnabled) playNotificationChime();
    if (isSupabaseConnected()) insertNotificationInDB(notif);
  };

  const handleRegisterStudent = (newStudent) => {
    setStudents(prev => [newStudent, ...prev]);
  };

  const handleResetData = () => {
    setStudents(INITIAL_STUDENTS);
    setBuses(INITIAL_BUSES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setEventTimeline(INITIAL_EVENT_TIMELINE);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header Bar */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onSimulateGeofence={handleSimulateGeofence}
        onSimulateWrongBus={handleSimulateWrongBus}
        onSimulateUnregistered={handleSimulateUnregistered}
        onSimulateDropOff={handleSimulateDropOff}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Supabase Connection Bar */}
      <div className="bg-slate-900 border-b border-slate-800 py-1.5 px-4 text-center text-xs">
        <span className="inline-flex items-center gap-2 font-bold">
          <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>Supabase PostgreSQL Cloud:</span>
          <span className={dbConnected ? "text-emerald-400 font-mono" : "text-amber-400"}>
            {dbConnected ? "CONNECTED (https://qedftfumikvtoolgwycx.supabase.co)" : "LOCAL FALLBACK ACTIVE"}
          </span>
        </span>
      </div>

      {/* Main Perspective Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        
        {activeTab === 'PARENT' && (
          <ParentMobileApp 
            student={students[0]}
            busData={buses[0]}
            notifications={notifications}
            viewMode={viewMode}
          />
        )}

        {activeTab === 'DRIVER' && (
          <DriverMobileApp 
            busData={buses[0]}
            students={students}
            onFinalizeBoardingBatch={handleFinalizeBoardingBatch}
            onSimulateGeofenceArrival={handleSimulateGeofence}
            viewMode={viewMode}
          />
        )}

        {activeTab === 'SCHOOL' && (
          <SchoolAdminDashboard 
            students={students}
            buses={buses}
            notifications={notifications}
            eventTimeline={eventTimeline}
            onRegisterStudent={handleRegisterStudent}
            onResetData={handleResetData}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800 text-center text-[11px] text-slate-500 py-3 mt-auto">
        SafeRide AI • "Every Stop Matters. Every Student Counts." • Zero-Hardware Student Safety
      </footer>

    </div>
  );
}
