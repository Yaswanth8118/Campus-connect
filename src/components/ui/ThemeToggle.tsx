import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore, Theme } from '../../store/themeStore';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
    { value: 'system', label: 'System', icon: <Monitor size={16} /> },
  ];

  const currentTheme = themes.find(t => t.value === theme);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {currentTheme?.icon}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-lg shadow-xl border border-white/20 dark:border-gray-700 py-2 z-50"
          >
            {themes.map((themeOption) => (
              <motion.button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors ${
                  theme === themeOption.value 
                    ? 'bg-primary-100 dark:bg-gray-700 text-primary-700 dark:text-primary-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                whileHover={{ x: 4 }}
              >
                <span className="text-primary-600 dark:text-primary-400">
                  {themeOption.icon}
                </span>
                <span className="text-sm font-medium">{themeOption.label}</span>
                {theme === themeOption.value && (
                  <motion.div
                    layoutId="activeTheme"
                    className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;