import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  Shield,
  BookOpen,
  BarChart3,
  FileText,
  UserCheck,
  GraduationCap,
  Building,
  Award,
  Bell,
  TrendingUp,
  X,
  UsersRound,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onMobileClose }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isCoordinator = user?.role === 'coordinator';
  const isTeamLeader = user?.role === 'team_leader';

  const WORKING_ROUTES = [
    '/dashboard', '/rooms', '/events', '/departments', '/reports',
    '/assignments', '/grades', '/attendance', '/attendance/manage',
    '/users', '/analytics', '/admin', '/notifications',
  ];

  const getNavigationItems = () => {
    const base = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',         roles: ['admin','coordinator','team_leader','student'] },
      { to: '/rooms',     icon: MessageSquare,   label: 'Rooms',             roles: ['admin','coordinator','team_leader','student'] },
      { to: '/events',    icon: Calendar,        label: 'Events',            roles: ['admin','coordinator','team_leader','student'] },
    ];
    const role = [
      { to: '/users',            icon: Users,          label: 'User Management',   roles: ['admin'] },
      { to: '/analytics',        icon: BarChart3,      label: 'Analytics',         roles: ['admin'] },
      { to: '/admin',            icon: Shield,         label: 'System Admin',      roles: ['admin'] },
      { to: '/departments',      icon: Building,       label: 'Departments',       roles: ['admin','coordinator'] },
      { to: '/reports',          icon: FileText,       label: 'Reports',           roles: ['admin','coordinator'] },
      { to: '/notifications',    icon: Bell,           label: 'Notifications',     roles: ['admin','coordinator'] },
      { to: '/attendance/manage',icon: UserCheck,       label: 'Manage Attendance', roles: ['coordinator'] },
      { to: '/grades',           icon: Award,          label: 'Grade Book',        roles: ['coordinator'] },
      { to: '/rooms',            icon: UsersRound,     label: 'My Team Rooms',     roles: ['team_leader'] },
      { to: '/attendance/manage',icon: UserCheck,       label: 'Team Attendance',   roles: ['team_leader'] },
      { to: '/assignments',      icon: FileText,       label: 'Assignments',       roles: ['team_leader','student'] },
      { to: '/grades',           icon: TrendingUp,     label: 'My Grades',         roles: ['student'] },
      { to: '/attendance',       icon: UserCheck,       label: 'My Attendance',     roles: ['student'] },
    ];
    return [...base, ...role].filter((item) => item.roles.includes(user?.role ?? 'student'));
  };

  const navItems = getNavigationItems();

  const roleLabel =
    user?.role === 'student'
      ? 'Student'
      : user?.role === 'team_leader'
        ? 'Team Leader'
        : user?.role
          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
          : '';

  const roleBg = isAdmin
    ? 'from-danger-500 to-danger-600'
    : isCoordinator
      ? 'from-primary-600 to-primary-700'
      : isTeamLeader
        ? 'from-accent-500 to-accent-600'
        : 'from-success-500 to-success-600';

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-5">
      <div className="px-4 mb-5">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-paper-100/80 dark:bg-dark-800/80 border border-paper-200/60 dark:border-dark-700/40">
          <Avatar src={user?.profileImage} name={user?.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-heading font-semibold text-ink-900 dark:text-dark-100 truncate">{user?.name}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${roleBg} mt-0.5`}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item, idx) => {
          const isWorking = WORKING_ROUTES.includes(item.to);
          if (isWorking) {
            return (
              <NavLink
                key={`${item.to}-${idx}`}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-700 to-primary-600 text-white shadow-sm'
                      : 'text-ink-700 dark:text-dark-300 hover:bg-paper-100 dark:hover:bg-dark-800 hover:text-primary-700 dark:hover:text-primary-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`h-4.5 w-4.5 flex-shrink-0 transition-transform duration-200 ${
                        isActive
                          ? 'text-white scale-110'
                          : 'text-ink-400 dark:text-dark-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:scale-105'
                      }`}
                      size={18}
                    />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80"
                        layoutId="sidebarDot"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          }
          return (
            <button
              key={`${item.to}-${idx}`}
              onClick={() => toast.success(`${item.label} — Coming Soon!`)}
              className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-700 dark:text-dark-300 hover:bg-paper-100 dark:hover:bg-dark-800 hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200"
            >
              <item.icon className="h-4 w-4 flex-shrink-0 text-ink-400 dark:text-dark-400 group-hover:text-primary-500 dark:group-hover:text-primary-400" size={18} />
              <span className="truncate">{item.label}</span>
              <span className="ml-auto text-[10px] font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                Soon
              </span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 mt-4 pt-4 border-t border-ink-100 dark:border-dark-700/60">
        <NavLink
          to="/settings"
          onClick={onMobileClose}
          className={({ isActive }) =>
            `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-primary-700 to-primary-600 text-white shadow-sm'
                : 'text-ink-700 dark:text-dark-300 hover:bg-paper-100 dark:hover:bg-dark-800 hover:text-primary-700 dark:hover:text-primary-300'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
                  isActive
                    ? 'text-white scale-110'
                    : 'text-ink-400 dark:text-dark-400 group-hover:text-primary-500 dark:group-hover:text-primary-400'
                }`}
                size={18}
              />
              <span>Settings</span>
              {isActive && (
                <motion.div
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80"
                  layoutId="sidebarDot"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </>
          )}
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-dark-950 border-r border-ink-100 dark:border-dark-700/50 z-30 overflow-y-auto">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
            />
            <motion.div
              className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-dark-950 shadow-2xl z-50 lg:hidden overflow-y-auto"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-ink-100 dark:border-dark-700/60">
                <div className="flex items-center gap-2.5">
                  <img src="/campus-connect.png" alt="Campus Connect" className="w-7 h-7 object-contain" />
                  <span className="font-heading font-bold text-primary-700 dark:text-primary-400">Campus Connect</span>
                </div>
                <button
                  onClick={onMobileClose}
                  className="p-2 rounded-xl text-ink-400 hover:bg-ink-100 dark:hover:bg-dark-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
