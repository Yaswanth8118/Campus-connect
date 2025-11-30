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
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  onClick,
  glass = true,
  animated = true,
}) => {
  const baseClasses = glass
    ? 'bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl border border-white/20 dark:border-secondary-700/50 shadow-lg'
    : 'bg-white dark:bg-secondary-900 border border-gray-200 dark:border-secondary-700 shadow-sm';

  const Component = animated ? motion.div : 'div';
  const animationProps = animated
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      }
    : {};

  return (
    <Component
      className={cn(
        baseClasses,
        'rounded-xl overflow-hidden',
        hoverable && 'transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer hover:border-primary-300 dark:hover:border-primary-700',
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
    <div className={cn('px-6 py-4 border-b border-gray-200/50 dark:border-secondary-700/50', className)}>
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
      className={cn('px-6 py-4 border-t border-gray-200/50 dark:border-secondary-700/50 bg-gray-50/50 dark:bg-secondary-800/50', className)}
    >
      {children}
    </div>
  );
};

export { Card, CardHeader, CardBody, CardFooter };