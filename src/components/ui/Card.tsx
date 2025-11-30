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
  variant?: 'default' | 'elevated' | 'bordered';
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
  const baseClasses = {
    default: glass
      ? 'bg-white/95 dark:bg-dark-900/80 backdrop-blur-xl border border-gray-200/80 dark:border-dark-700/60 shadow-lg dark:shadow-dark-lg'
      : 'bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-md dark:shadow-dark-md',
    elevated: 'bg-white dark:bg-dark-850 border border-gray-200/50 dark:border-dark-700/40 shadow-xl dark:shadow-dark-xl',
    bordered: 'bg-white dark:bg-dark-900 border-2 border-gray-300 dark:border-dark-600 shadow-sm dark:shadow-dark-sm',
  };

  const Component = animated ? motion.div : 'div';
  const animationProps = animated
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
        whileHover: hoverable ? { y: -4, scale: 1.01 } : undefined,
      }
    : {};

  return (
    <Component
      className={cn(
        baseClasses[variant],
        'rounded-2xl overflow-hidden transition-all duration-300',
        hoverable && 'cursor-pointer hover:shadow-2xl dark:hover:shadow-dark-xl hover:border-primary-400/50 dark:hover:border-primary-500/60 dark:hover:bg-dark-850',
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

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-5 border-b border-gray-200/80 dark:border-dark-700/60', className)}>
      {children}
    </div>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
  return <div className={cn('p-6', className)}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div
      className={cn('px-6 py-4 border-t border-gray-200/80 dark:border-dark-700/60 bg-gray-50/80 dark:bg-dark-950/80', className)}
    >
      {children}
    </div>
  );
};

export { Card, CardHeader, CardBody, CardFooter };
