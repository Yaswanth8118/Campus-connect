import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}) => {
  const variants = {
    primary:   'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-800/50',
    secondary: 'bg-paper-200 text-ink-800 dark:bg-dark-800/50 dark:text-dark-200 ring-1 ring-paper-300 dark:ring-dark-700/50',
    accent:    'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300 ring-1 ring-accent-200 dark:ring-accent-800/50',
    success:   'bg-success-100 text-success-600 dark:bg-success-600/20 dark:text-success-400 ring-1 ring-success-100 dark:ring-success-600/30',
    warning:   'bg-warning-100 text-warning-600 dark:bg-warning-600/20 dark:text-warning-400 ring-1 ring-warning-100 dark:ring-warning-600/30',
    danger:    'bg-danger-100 text-danger-600 dark:bg-danger-600/20 dark:text-danger-400 ring-1 ring-danger-100 dark:ring-danger-600/30',
    info:      'bg-info-100 text-info-600 dark:bg-info-600/20 dark:text-info-400 ring-1 ring-info-100 dark:ring-info-600/30',
    default:   'bg-ink-100 text-ink-700 dark:bg-dark-700 dark:text-dark-200 ring-1 ring-ink-200 dark:ring-dark-600',
  };

  const dotColors = {
    primary:   'bg-primary-500',
    secondary: 'bg-ink-500',
    accent:    'bg-accent-500',
    success:   'bg-success-500',
    warning:   'bg-warning-500',
    danger:    'bg-danger-500',
    info:      'bg-info-500',
    default:   'bg-ink-500',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full font-sans',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  );
};

export { Badge };
export default Badge;
