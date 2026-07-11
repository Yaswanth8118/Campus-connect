import React from 'react';
import { Bell, LogOut, Menu, Search, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import ThemeToggle from '../ui/ThemeToggle';
import { announcementsRepo } from '../../services/entities';
import { formatDate } from '../../lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const [notifications, setNotifications] = React.useState<any[]>([]);

  React.useEffect(() => {
    announcementsRepo
      .list('select=id,title,description,created_at&order=created_at.desc&limit=5')
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const unreadCount = notifications.length;

  const roleLabel =
    user?.role === 'student'
      ? 'Student'
      : user?.role === 'faculty'
        ? 'Faculty'
        : user?.role
          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
          : '';

  const roleVariant = (
    user?.role === 'admin'
      ? 'danger'
      : user?.role === 'coordinator'
        ? 'primary'
        : user?.role === 'faculty'
          ? 'accent'
          : 'success'
  ) as 'danger' | 'primary' | 'accent' | 'success';

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-dark-950/95 backdrop-blur-xl border-b border-ink-100/60 dark:border-dark-700/50 shadow-sm"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 22 }}
    >
      <div className="flex h-full items-center px-4 sm:px-6 gap-3">
        <button
          type="button"
          className="lg:hidden p-2 rounded-xl text-ink-500 dark:text-dark-300 hover:bg-paper-100 dark:hover:bg-dark-800 transition-colors"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <motion.button
          className="flex items-center gap-2.5 flex-shrink-0"
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          onClick={() => navigate('/dashboard')}
        >
          <img src="/campus-connect.png" alt="Campus Connect" className="w-8 h-8 object-contain drop-shadow-md" />
          <span className="hidden sm:block font-heading font-bold text-lg text-primary-700 dark:text-primary-400 tracking-tight">
            Campus Connect
          </span>
        </motion.button>

        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-dark-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search rooms, events, users..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-paper-100/80 dark:bg-dark-800/80 border border-paper-200 dark:border-dark-600 rounded-xl placeholder:text-ink-400 dark:placeholder:text-dark-400 text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <div className="relative">
            <motion.button
              className="relative p-2 rounded-xl text-ink-500 dark:text-dark-300 hover:bg-paper-100 dark:hover:bg-dark-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              onClick={() => { setShowNotifications((v) => !v); setShowUserMenu(false); }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <motion.span
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center shadow"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-ink-100 dark:border-dark-700 overflow-hidden z-40"
                  >
                    <div className="px-4 py-3 border-b border-ink-100 dark:border-dark-700 flex items-center justify-between">
                      <h3 className="font-heading font-semibold text-ink-900 dark:text-dark-100 text-sm">
                        Notifications
                      </h3>
                      <Badge variant="primary" size="sm">{unreadCount} new</Badge>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-ink-50 dark:divide-dark-700">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-xs text-ink-500 dark:text-dark-400">No announcements</p>
                      ) : notifications.map((n) => (
                        <div key={n.id} className="px-4 py-3 hover:bg-paper-50 dark:hover:bg-dark-750 transition-colors">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-ink-900 dark:text-dark-100 truncate">{n.title}</p>
                              {n.description && <p className="text-xs text-ink-500 dark:text-dark-400 mt-0.5 truncate">{n.description}</p>}
                            </div>
                            <span className="text-xs text-ink-400 dark:text-dark-500 flex-shrink-0">{formatDate(n.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-ink-100 dark:border-dark-700">
                      <button onClick={() => { setShowNotifications(false); navigate('/announcements'); }} className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">
                        View all announcements
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <motion.button
              onClick={() => { setShowUserMenu((v) => !v); setShowNotifications(false); }}
              className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-xl hover:bg-paper-100 dark:hover:bg-dark-800 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Avatar src={user?.profileImage} name={user?.name} size="sm" />
              <div className="hidden md:block text-left">
                <div className="text-sm font-heading font-semibold text-ink-900 dark:text-dark-100 leading-tight">
                  {user?.name}
                </div>
                <Badge variant={roleVariant} size="sm">{roleLabel}</Badge>
              </div>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-ink-100 dark:border-dark-700 overflow-hidden z-40"
                  >
                    <div className="px-4 py-3 border-b border-ink-100 dark:border-dark-700">
                      <p className="text-sm font-heading font-semibold text-ink-900 dark:text-dark-100">{user?.name}</p>
                      <p className="text-xs text-ink-500 dark:text-dark-400 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <motion.button
                        onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-paper-100 dark:hover:bg-dark-750 transition-colors text-ink-800 dark:text-dark-200 text-sm"
                        whileHover={{ x: 3 }}
                      >
                        <Settings size={16} className="text-ink-400 dark:text-dark-400" />
                        Settings
                      </motion.button>
                      <motion.button
                        onClick={() => { handleLogout(); setShowUserMenu(false); }}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-danger-50 dark:hover:bg-danger-600/10 transition-colors text-danger-600 dark:text-danger-400 text-sm"
                        whileHover={{ x: 3 }}
                      >
                        <LogOut size={16} />
                        Sign Out
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
