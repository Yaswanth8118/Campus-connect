import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`bg-white dark:bg-dark-800 rounded-3xl shadow-2xl w-full ${maxWidth} border border-ink-100 dark:border-dark-700 max-h-[90vh] overflow-y-auto`}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between px-6 py-4 border-b border-ink-100 dark:border-dark-700 sticky top-0 bg-white dark:bg-dark-800 z-10">
            <div>
              <h2 className="font-heading font-bold text-lg text-ink-950 dark:text-dark-50">{title}</h2>
              {subtitle && <p className="text-xs text-ink-500 dark:text-dark-400 mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-ink-400 hover:bg-ink-100 dark:hover:bg-dark-700 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Modal;

export const Select: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }
> = ({ label, className, children, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-ink-800 dark:text-dark-200">{label}</label>}
    <select
      className={`w-full px-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-ink-900 dark:text-dark-100 transition-all ${className ?? ''}`}
      {...props}
    >
      {children}
    </select>
  </div>
);
