import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Search,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isCoordinator = user?.role === 'coordinator';
  const isFaculty = user?.role === 'faculty';
  const isStudent = user?.role === 'candidate';

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      {
        to: '/dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        roles: ['admin', 'coordinator', 'faculty', 'candidate'],
        onClick: () => navigate('/dashboard')
      },
      {
        to: '/rooms',
        icon: MessageSquare,
        label: 'Rooms',
        roles: ['admin', 'coordinator', 'faculty', 'candidate'],
        onClick: () => navigate('/rooms')
      },
      {
        to: '/events',
        icon: Calendar,
        label: 'Events',
        roles: ['admin', 'coordinator', 'faculty', 'candidate'],
        onClick: () => navigate('/events')
      }
    ];

    const roleSpecificItems = [
      // Admin specific
      {
        to: '/users',
        icon: Users,
        label: 'User Management',
        roles: ['admin'],
        onClick: () => {
          toast.success('User Management - Coming Soon!');
          // navigate('/users');
        }
      },
      {
        to: '/analytics',
        icon: BarChart3,
        label: 'Analytics',
        roles: ['admin'],
        onClick: () => {
          toast.success('Analytics Dashboard - Coming Soon!');
          // navigate('/analytics');
        }
      },
      {
        to: '/admin',
        icon: Shield,
        label: 'System Admin',
        roles: ['admin'],
        onClick: () => {
          toast.success('System Admin Panel - Coming Soon!');
          // navigate('/admin');
        }
      },
      
      // Coordinator specific
      {
        to: '/departments',
        icon: Building,
        label: 'Departments',
        roles: ['admin', 'coordinator'],
        onClick: () => navigate('/departments')
      },
      {
        to: '/reports',
        icon: FileText,
        label: 'Reports',
        roles: ['admin', 'coordinator'],
        onClick: () => navigate('/reports')
      },
      {
        to: '/notifications',
        icon: Bell,
        label: 'Notifications',
        roles: ['admin', 'coordinator'],
        onClick: () => {
          toast.success('Notification Center - Coming Soon!');
          // navigate('/notifications');
        }
      },
      
      // Faculty specific
      {
        to: '/courses',
        icon: BookOpen,
        label: 'My Courses',
        roles: ['faculty'],
        onClick: () => {
          toast.success('Course Management - Coming Soon!');
          // navigate('/courses');
        }
      },
      {
        to: '/attendance/manage',
        icon: UserCheck,
        label: 'Manage Attendance',
        roles: ['faculty', 'coordinator'],
        onClick: () => navigate('/attendance/manage')
      },
      {
        to: '/grades',
        icon: Award,
        label: 'Grade Book',
        roles: ['faculty'],
        onClick: () => {
          toast.success('Grade Management - Coming Soon!');
          // navigate('/grades');
        }
      },
      
      // Student specific
      {
        to: '/my-courses',
        icon: GraduationCap,
        label: 'My Courses',
        roles: ['candidate'],
        onClick: () => {
          toast.success('Course Portal - Coming Soon!');
          // navigate('/my-courses');
        }
      },
      {
        to: '/grades',
        icon: TrendingUp,
        label: 'My Grades',
        roles: ['candidate'],
        onClick: () => navigate('/grades')
      },
      {
        to: '/assignments',
        icon: FileText,
        label: 'Assignments',
        roles: ['candidate'],
        onClick: () => navigate('/assignments')
      },
      {
        to: '/attendance',
        icon: UserCheck,
        label: 'My Attendance',
        roles: ['candidate'],
        onClick: () => navigate('/attendance')
      }
    ];

    return [...baseItems, ...roleSpecificItems].filter(item => 
      item.roles.includes(user?.role || 'candidate')
    );
  };

  const navigationItems = getNavigationItems();

  const sidebarVariants = {
    hidden: { x: -280 },
    visible: { 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  const handleItemClick = (item: any, e: React.MouseEvent) => {
    e.preventDefault();
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <motion.aside 
      className="hidden lg:block w-64 bg-white/95 dark:bg-dark-950/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-dark-700/40 min-h-screen shadow-xl dark:shadow-dark-xl"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="py-6 flex flex-col h-full">
        {/* Role Badge */}
        <motion.div 
          className="px-4 mb-6"
          variants={itemVariants}
        >
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
            isAdmin ? 'bg-gradient-to-r from-danger-500 to-danger-600 text-white' :
            isCoordinator ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white' :
            isFaculty ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white' :
            'bg-gradient-to-r from-success-500 to-success-600 text-white'
          }`}>
            {user?.role === 'candidate' ? 'Student' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-2">
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.to}
              variants={itemVariants}
              custom={index}
            >
              {/* Check if it's a working route */}
              {['/dashboard', '/rooms', '/events', '/departments', '/reports', '/assignments', '/grades', '/attendance', '/attendance/manage'].includes(item.to) ? (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg dark:shadow-glow-primary transform scale-[1.02]'
                        : 'text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800/80 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-sm'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon 
                        className={`mr-3 h-5 w-5 transition-all duration-300 ${
                          isActive ? 'text-white scale-110' : 'text-gray-500 dark:text-dark-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:scale-110'
                        }`} 
                      />
                      {item.label}
                      {isActive && (
                        <motion.div
                          className="ml-auto w-2 h-2 bg-white rounded-full shadow-lg"
                          layoutId="activeIndicator"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ) : (
                <motion.button
                  onClick={(e) => handleItemClick(item, e)}
                  className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800/80 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="mr-3 h-5 w-5 text-gray-500 dark:text-dark-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:scale-110 transition-all duration-300" />
                  {item.label}
                  <motion.div
                    className="ml-auto text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                  >
                    Soon
                  </motion.div>
                </motion.button>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Settings */}
        <motion.div
          className="px-2 mt-6 pt-6 border-t border-gray-200 dark:border-dark-700/80"
          variants={itemVariants}
        >
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-900/20 dark:hover:to-accent-900/20 hover:text-primary-700 dark:hover:text-primary-300 hover:shadow-md'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Settings
                  className={`mr-3 h-5 w-5 transition-all duration-300 ${
                    isActive ? 'text-white scale-110' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:scale-110'
                  }`}
                />
                Settings
                {isActive && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full shadow-lg"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;