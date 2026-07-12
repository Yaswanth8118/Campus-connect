import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Sidebar from './Sidebar';
import Header from './Header';

const FullScreenLoader: React.FC<{ label?: string }> = ({ label = 'Restoring your session…' }) => (
  <div className="flex h-screen items-center justify-center bg-paper-50 dark:bg-dark-900">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 animate-spin" />
      <p className="text-sm font-heading font-medium text-primary-600 dark:text-primary-400">{label}</p>
    </div>
  </div>
);

const AppLayout: React.FC = () => {
  const { isAuthenticated, initializing } = useAuthStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // While the persisted session is being restored, show a loader — never redirect.
  // This is what keeps a refresh on /users, /grades, etc. from bouncing to the landing page.
  if (initializing) {
    return <FullScreenLoader />;
  }

  // Only after restore has completed do we make the auth decision.
  // Preserve the attempted route so login can return the user here.
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname + location.search }} />;
  }

  return (
    <div className="min-h-screen bg-paper-100 dark:bg-dark-900">
      <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
      <div className="flex pt-16">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 p-6 lg:p-8 pb-20 overflow-y-auto lg:ml-64">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
