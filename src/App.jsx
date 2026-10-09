import React, { useState } from 'react';
import Header from './components/Header';
import SchoolAdminPortal from './components/SchoolAdminPortal';
import DriverApp from './components/DriverApp';
import ParentApp from './components/ParentApp';
import RegisterStudentModal from './components/RegisterStudentModal';

import { INITIAL_STUDENTS, INITIAL_BUS, INITIAL_NOTIFICATIONS } from './mockData';
import { playSuccessChime, playNotificationChime, playWarningChime } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState('SCHOOL'); // 'SCHOOL', 'DRIVER', 'PARENT'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Shared Application State across all 3 perspectives
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [busData, setBusData] = useState(INITIAL_BUS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [currentStopIndex, setCurrentStopIndex] = useState(2); // Stop #3: Green Valley Apartments

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Helper to format current time
  const getCurrentTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handler: Driver verifies student boarding via facial scan
  const handleVerifyBoarding = (studentId, confidenceScore) => {
    const timestamp = getCurrentTimeString();
    
    // 1. Update Student record
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

    // Find student for notification payload
    const targetStudent = students.find(s => s.id === studentId) || students[0];

    // 2. Dispatch Dual-Tier Alert #2 to Parent & School Admin
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

    // 3. Play audio chime if enabled
    if (soundEnabled) {
      playSuccessChime();
    }
  };

  // Handler: Conductor manual PIN override verification
  const handleManualOverride = (studentId) => {
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
  };

  // Handler: Simulate Bus arriving at registered stop geofence (Fires Alert #1)
  const handleSimulateGeofenceArrival = () => {
    const timestamp = getCurrentTimeString();
    const currentStop = busData.stops[currentStopIndex];

    // Move bus location directly to Stop coordinates
    setBusData(prevBus => ({
      ...prevBus,
      currentCoords: currentStop.coords,
      speed: "12 km/h",
    }));

    // Dispatch Alert #1 to Parent
    const newGeofenceAlert = {
      id: `NOTIF-${Date.now()}`,
      type: 'BUS_ARRIVED',
      title: `Bus Arrived at ${currentStop.name.split(' ')[0]} Stop`,
      message: `${busData.busNumber} has entered the pickup geofence for ${currentStop.name} at ${timestamp}.`,
      timestamp: timestamp,
      studentId: "STD-1001", // Anand's stop
      studentName: "Anand Sharma",
      read: false,
    };

    setNotifications(prevNotifs => [newGeofenceAlert, ...prevNotifs]);

    if (soundEnabled) {
      playNotificationChime();
    }
  };

  // Handler: Register new student
  const handleRegisterStudent = (newStudent) => {
    setStudents(prev => [newStudent, ...prev]);
  };

  // Handler: Reset demo state
  const handleResetData = () => {
    setStudents(INITIAL_STUDENTS);
    setBusData(INITIAL_BUS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentStopIndex(2);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header with Perspective Switcher */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onSimulateGeofence={handleSimulateGeofenceArrival}
        currentStopName={busData.stops[currentStopIndex].name}
      />

      {/* Main Dynamic Workspace Area based on selected Perspective */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        
        {/* Perspective 1: School Admin Web Portal */}
        {activeTab === 'SCHOOL' && (
          <SchoolAdminPortal 
            students={students}
            busData={busData}
            notifications={notifications}
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
            onResetData={handleResetData}
          />
        )}

        {/* Perspective 2: Driver & Conductor App */}
        {activeTab === 'DRIVER' && (
          <DriverApp 
            busData={busData}
            students={students}
            onVerifyBoarding={handleVerifyBoarding}
            onSimulateGeofenceArrival={handleSimulateGeofenceArrival}
            onManualOverride={handleManualOverride}
            currentStopIndex={currentStopIndex}
            onAdvanceStop={() => setCurrentStopIndex((prev) => (prev + 1) % busData.stops.length)}
          />
        )}

        {/* Perspective 3: Parent Mobile App */}
        {activeTab === 'PARENT' && (
          <ParentApp 
            student={students[0]} // Display Anand Sharma's parent portal
            busData={busData}
            notifications={notifications}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800 text-center text-xs text-slate-500 py-4 mt-auto">
        SafeRide AI Platform • Zero-Hardware Student Transportation Safety • Hackathon 2026 Prototype
      </footer>

      {/* Student Enrollment Modal */}
      <RegisterStudentModal 
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterStudent={handleRegisterStudent}
      />

    </div>
  );
}
