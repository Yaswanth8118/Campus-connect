import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { GradesPage } from './pages/GradesPage';
import { SettingsPage } from './pages/SettingsPage';
import AttendancePage from './pages/AttendancePage';
import { CoordinatorAttendancePage } from './pages/CoordinatorAttendancePage';
import { UsersPage } from './pages/UsersPage';
import { AdminPage } from './pages/AdminPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';

import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/rooms/:id" element={<RoomDetailPage />} />

            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />

            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/grades" element={<GradesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/attendance/manage" element={<CoordinatorAttendancePage />} />

            <Route path="/users" element={<UsersPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

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
          success: {
            iconTheme: { primary: '#c92a2a', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#d44545', secondary: '#fff' },
          },
        }}
      />
    </>
  );
}

export default App;
