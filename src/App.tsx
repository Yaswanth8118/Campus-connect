import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';

// Layout
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Rooms */}
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/rooms/:id" element={<RoomDetailPage />} />
            
            {/* Events */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            
            {/* Settings */}
            <Route path="/settings" element={<div className="p-8 text-center">Settings page (not implemented in demo)</div>} />
            
            {/* Users */}
            <Route path="/users" element={<div className="p-8 text-center">Users management page (not implemented in demo)</div>} />
            
            {/* Admin */}
            <Route path="/admin" element={<div className="p-8 text-center">Admin dashboard (not implemented in demo)</div>} />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
          
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
      
      <Toaster position="top-right" />
    </>
  );
}

export default App;