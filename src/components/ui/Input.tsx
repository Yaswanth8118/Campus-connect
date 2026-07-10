import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, iconRight, fullWidth = false, ...props }, ref) => {
    const id = props.id || React.useId();

    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-ink-800 dark:text-dark-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-ink-400 dark:text-dark-400">
              {icon}
            </div>
          )}
          <input
            id={id}
            className={cn(
              'block w-full rounded-xl border bg-white dark:bg-dark-800 px-4 py-2.5 text-sm text-ink-950 dark:text-dark-50 placeholder:text-ink-400 dark:placeholder:text-dark-400',
              'border-ink-200 dark:border-dark-600',
              'shadow-sm transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-400',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-paper-50 dark:disabled:bg-dark-900',
              icon && 'pl-10',
              iconRight && 'pr-10',
              error && 'border-danger-400 focus:ring-danger-400/30 focus:border-danger-400',
              !fullWidth && 'w-auto',
              fullWidth && 'w-full',
              className
            )}
            ref={ref}
            {...props}
          />
          {iconRight && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-ink-400 dark:text-dark-400">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger-500 dark:text-danger-400 mt-1">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-500 dark:text-dark-400 mt-1">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
