import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SchoolAdminPortal from './components/SchoolAdminPortal';
import DriverApp from './components/DriverApp';
import ParentApp from './components/ParentApp';
import RegisterStudentModal from './components/RegisterStudentModal';

import { INITIAL_STUDENTS, INITIAL_BUS, INITIAL_NOTIFICATIONS } from './mockData';
import { playSuccessChime, playNotificationChime } from './utils/audio';
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

  // Shared Application State
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [busData, setBusData] = useState(INITIAL_BUS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [currentStopIndex, setCurrentStopIndex] = useState(2);
  const [dbConnected, setDbConnected] = useState(false);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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
            grade: s.grade_section || 'Grade 6-B',
            parentName: 'Parent Guardian',
            parentPhone: '+91 98765 43210',
            assignedBus: 'Bus 01',
            pickupStop: 'Green Valley Apartments (Stop #3)',
            pickupCoords: [12.9716, 77.5946],
            status: s.status || 'PENDING',
            boardingTime: s.boarding_time,
            verificationStatus: s.verification_status,
            confidenceScore: s.confidence_score,
            avatarUrl: s.avatar_url || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80",
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

  const handleVerifyBoarding = async (studentId, confidenceScore) => {
    const timestamp = getCurrentTimeString();
    
    setStudents(prevStudents => prevStudents.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          status: 'BOARDED',
          boardingTime: timestamp,
          verificationStatus: 'VERIFIED_FACE',
          confidenceScore: confidenceScore,
        };
      }
      return student;
    }));

    const targetStudent = students.find(s => s.id === studentId) || students[0];

    const newAlert = {
      id: `NOTIF-${Date.now()}`,
      type: 'STUDENT_BOARDED',
      title: 'Boarding Confirmed',
      message: `${targetStudent.firstName} ${targetStudent.lastName} has safely boarded ${busData.busNumber} at ${timestamp} (Verified via Biometrics ${confidenceScore}%).`,
      timestamp: timestamp,
      studentId: targetStudent.id,
      studentName: `${targetStudent.firstName} ${targetStudent.lastName}`,
      read: false,
    };

    setNotifications(prevNotifs => [newAlert, ...prevNotifs]);

    if (soundEnabled) {
      playSuccessChime();
    }

    if (isSupabaseConnected()) {
      await updateBoardingInDB(studentId, confidenceScore, timestamp);
      await insertNotificationInDB(newAlert);
    }
  };

  const handleManualOverride = async (studentId) => {
    const timestamp = getCurrentTimeString();

    setStudents(prevStudents => prevStudents.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          status: 'BOARDED',
          boardingTime: timestamp,
          verificationStatus: 'VERIFIED_MANUAL',
          confidenceScore: 100,
        };
      }
      return student;
    }));

    const targetStudent = students.find(s => s.id === studentId) || students[0];

    const newAlert = {
      id: `NOTIF-${Date.now()}`,
      type: 'STUDENT_BOARDED',
      title: 'Manual Boarding Verified',
      message: `${targetStudent.firstName} ${targetStudent.lastName} manual boarding verified by Conductor at ${timestamp} (Code: 1234).`,
      timestamp: timestamp,
      studentId: targetStudent.id,
      studentName: `${targetStudent.firstName} ${targetStudent.lastName}`,
      read: false,
    };

    setNotifications(prevNotifs => [newAlert, ...prevNotifs]);

    if (soundEnabled) {
      playNotificationChime();
    }

    if (isSupabaseConnected()) {
      await updateBoardingInDB(studentId, 100, timestamp);
      await insertNotificationInDB(newAlert);
    }
  };

  const handleSimulateGeofenceArrival = async () => {
    const timestamp = getCurrentTimeString();
    const currentStop = busData.stops[currentStopIndex];

    setBusData(prevBus => ({
      ...prevBus,
      currentCoords: currentStop.coords,
      speed: "12 km/h",
    }));

    const newGeofenceAlert = {
      id: `NOTIF-${Date.now()}`,
      type: 'BUS_ARRIVED',
      title: `Bus Arrived at ${currentStop.name.split(' ')[0]} Stop`,
      message: `${busData.busNumber} has entered the pickup geofence for ${currentStop.name} at ${timestamp}.`,
      timestamp: timestamp,
      studentId: "STD-1001",
      studentName: "Anand Sharma",
      read: false,
    };

    setNotifications(prevNotifs => [newGeofenceAlert, ...prevNotifs]);

    if (soundEnabled) {
      playNotificationChime();
    }

    if (isSupabaseConnected()) {
      await insertNotificationInDB(newGeofenceAlert);
    }
  };

  const handleRegisterStudent = (newStudent) => {
    setStudents(prev => [newStudent, ...prev]);
  };

  const handleResetData = () => {
    setStudents(INITIAL_STUDENTS);
    setBusData(INITIAL_BUS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentStopIndex(2);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header Bar */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onSimulateGeofence={handleSimulateGeofenceArrival}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Connection Indicator */}
      <div className="bg-slate-900 border-b border-slate-800/80 py-1.5 px-4 text-center text-xs">
        <span className="inline-flex items-center gap-2 font-bold">
          <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>Supabase PostgreSQL Cloud:</span>
          <span className={dbConnected ? "text-emerald-400 font-mono" : "text-amber-400"}>
            {dbConnected ? "CONNECTED (https://qedftfumikvtoolgwycx.supabase.co)" : "LOCAL FALLBACK ACTIVE"}
          </span>
        </span>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        
        {activeTab === 'PARENT' && (
          <ParentApp 
            student={students[0]}
            busData={busData}
            notifications={notifications}
            viewMode={viewMode}
          />
        )}

        {activeTab === 'DRIVER' && (
          <DriverApp 
            busData={busData}
            students={students}
            onVerifyBoarding={handleVerifyBoarding}
            onSimulateGeofenceArrival={handleSimulateGeofenceArrival}
            onManualOverride={handleManualOverride}
            currentStopIndex={currentStopIndex}
            viewMode={viewMode}
          />
        )}

        {activeTab === 'SCHOOL' && (
          <SchoolAdminPortal 
            students={students}
            busData={busData}
            notifications={notifications}
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
            onResetData={handleResetData}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 text-center text-[11px] text-slate-500 py-3 mt-auto">
        SafeRide AI Pro Suite • Supabase PostgreSQL Cloud Sync • Zero-Hardware Student Safety
      </footer>

      <RegisterStudentModal 
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterStudent={handleRegisterStudent}
      />

    </div>
  );
}
