import React from 'react';
import { Bell, LogOut, Menu, X, Search, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import GradientText from '../ui/GradientText';
import ThemeToggle from '../ui/ThemeToggle';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const mockNotifications = [
    { id: 1, title: 'New event created', message: 'Orientation Session starts in 1 hour', time: '5m ago', unread: true },
    { id: 2, title: 'Room invitation', message: 'You were added to Career Development room', time: '1h ago', unread: true },
    { id: 3, title: 'System update', message: 'Campus Connect has been updated', time: '2h ago', unread: false },
  ];

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <motion.header 
      className="bg-white/90 dark:bg-secondary-900/90 backdrop-blur-xl shadow-lg border-b border-primary-200/50 dark:border-secondary-700/50 sticky top-0 z-30"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-gray-400 dark:text-gray-300 lg:hidden focus:outline-none hover:bg-primary-50 dark:hover:bg-secondary-800 transition-colors"
              onClick={toggleMobileMenu}
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </button>
            
            <motion.div 
              className="flex-shrink-0 flex items-center ml-2 lg:ml-0 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={() => navigate('/dashboard')}
            >
              <img
                src="/campus%20connect.png"
                alt="Campus Connect"
                className="w-10 h-10 mr-3 drop-shadow-lg"
              />
              <GradientText
                colors={["#e67544", "#f19967", "#de5a2f", "#b84628"]}
                animationSpeed={4}
                className="text-2xl font-bold"
              >
                Campus Connect
              </GradientText>
            </motion.div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search rooms, events, users..."
                className="w-full pl-10 pr-4 py-2 bg-primary-50/50 dark:bg-secondary-800/50 border border-primary-200 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all backdrop-blur-sm text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative">
              <motion.button 
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-800 focus:outline-none transition-colors relative"
                onClick={() => setShowNotifications(!showNotifications)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <motion.span 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-secondary-800/95 backdrop-blur-xl rounded-lg shadow-xl border border-primary-200/50 dark:border-secondary-700/50 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-primary-100 dark:border-secondary-700">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {mockNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-primary-50 dark:hover:bg-secondary-700 cursor-pointer transition-colors ${
                            notification.unread ? 'bg-primary-25 dark:bg-secondary-800' : ''
                          }`}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                              {notification.time}
                            </span>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full mt-1"></div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="relative">
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-secondary-800 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Avatar 
                  src={user?.profileImage} 
                  name={user?.name}
                  size="sm"
                />
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.name}</div>
                  <Badge 
                    variant={
                      user?.role === 'admin' 
                        ? 'danger' 
                        : user?.role === 'coordinator' 
                          ? 'primary' 
                          : user?.role === 'faculty' 
                            ? 'secondary' 
                            : 'success'
                    }
                    size="sm"
                  >
                    {user?.role === 'candidate' ? 'Student' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </Badge>
                </div>
              </motion.button>

              {/* User Menu Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-secondary-800/95 backdrop-blur-xl rounded-lg shadow-xl border border-primary-200/50 dark:border-secondary-700/50 py-2 z-50"
                  >
                    <motion.button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-primary-50 dark:hover:bg-secondary-700 transition-colors text-gray-700 dark:text-gray-300"
                      whileHover={{ x: 4 }}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors text-danger-600 dark:text-danger-400"
                      whileHover={{ x: 4 }}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 dark:bg-secondary-900/95 backdrop-blur-xl border-t border-primary-200 dark:border-secondary-700"
          >
            <div className="pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <div className="px-4 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-primary-50 dark:bg-secondary-800 border border-primary-200 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              
              {/* Mobile Navigation Links */}
              <motion.button
                onClick={() => {
                  navigate('/dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-secondary-800"
                whileHover={{ x: 4 }}
              >
                Dashboard
              </motion.button>
              <motion.button
                onClick={() => {
                  navigate('/rooms');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-secondary-800"
                whileHover={{ x: 4 }}
              >
                Rooms
              </motion.button>
              <motion.button
                onClick={() => {
                  navigate('/events');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-secondary-800"
                whileHover={{ x: 4 }}
              >
                Events
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;