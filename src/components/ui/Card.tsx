import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  glass?: boolean;
  animated?: boolean;
  variant?: 'default' | 'elevated' | 'bordered' | 'warm';
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  onClick,
  glass = true,
  animated = true,
  variant = 'default',
}) => {
  const baseClasses: Record<string, string> = {
    default:
      'bg-white dark:bg-dark-800/90 border border-ink-100 dark:border-dark-700/60 shadow-card dark:shadow-dark-lg',
    elevated:
      'bg-white dark:bg-dark-850/95 border border-ink-100 dark:border-dark-750/50 shadow-card-hover dark:shadow-dark-xl',
    bordered:
      'bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 shadow-soft dark:shadow-dark-sm',
    warm:
      'bg-gradient-to-br from-paper-50 to-paper-100 dark:from-primary-950/40 dark:to-dark-800 border border-ink-100 dark:border-primary-800/30 shadow-card',
  };

  const Component = animated ? motion.div : 'div';
  const animationProps = animated
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
        whileHover: hoverable
          ? { y: -4, scale: 1.01, transition: { duration: 0.18 } }
          : undefined,
      }
    : {};

  return (
    <Component
      className={cn(
        baseClasses[variant],
        'rounded-2xl overflow-hidden transition-all duration-300 ease-out',
        hoverable &&
          'cursor-pointer hover:shadow-card-hover dark:hover:shadow-dark-xl hover:border-ink-200 dark:hover:border-primary-600/50',
        className
      )}
      onClick={onClick}
      {...animationProps}
    >
      {children}
    </Component>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}
const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={cn('px-6 py-5 border-b border-ink-100/80 dark:border-dark-700/60', className)}>
    {children}
  </div>
);

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}
const CardBody: React.FC<CardBodyProps> = ({ children, className }) => (
  <div className={cn('p-6', className)}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}
const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div
    className={cn(
      'px-6 py-4 border-t border-ink-100/80 dark:border-dark-700/60 bg-paper-50/60 dark:bg-dark-900/50',
      className
    )}
  >
    {children}
  </div>
);

export { Card, CardHeader, CardBody, CardFooter };
