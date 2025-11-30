import React from 'react';
import { cn } from '../../lib/utils';
import { getInitials } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  const [imgError, setImgError] = React.useState(!src);

  const handleError = () => {
    setImgError(true);
  };

  return (
    <div
      className={cn(
        'relative rounded-full bg-gray-200 flex items-center justify-center overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {!imgError && src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={handleError}
        />
      ) : (
        <span className="font-medium text-gray-600">
          {name ? getInitials(name) : 'U'}
        </span>
      )}
    </div>
  );
};

export default Avatar;