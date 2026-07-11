import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import RoomsPage from './pages/RoomsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import EventsPage from './pages/EventsPage';
import { GradesPage } from './pages/GradesPage';
import AttendancePage from './pages/AttendancePage';
import { CoordinatorAttendancePage } from './pages/CoordinatorAttendancePage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { AdminPage } from './pages/AdminPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

import AppLayout from './components/layout/AppLayout';

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  // Restore any persisted Supabase session before rendering protected routes.
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/grades" element={<GradesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/attendance/manage" element={<CoordinatorAttendancePage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            <Route path="/users" element={<UsersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/admin" element={<AdminPage />} />

            <Route path="/settings" element={<SettingsPage />} />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>

          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '14px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            background: '#fefdfb',
            color: '#1a1c25',
            border: '1px solid #f5e9d6',
          },
          success: { iconTheme: { primary: '#c92a2a', secondary: '#fff' } },
          error: { iconTheme: { primary: '#d44545', secondary: '#fff' } },
        }}
      />
    </>
  );
}

export default App;
