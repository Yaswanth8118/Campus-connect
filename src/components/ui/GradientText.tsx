import React from 'react';
import { motion } from 'framer-motion';

interface GradientTextProps {
  children: React.ReactNode;
  colors: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  className?: string;
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  colors,
  animationSpeed = 3,
  showBorder = false,
  className = ''
}) => {
  const gradientStyle = {
    background: `linear-gradient(-45deg, ${colors.join(', ')})`,
    backgroundSize: '400% 400%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: `gradient ${animationSpeed}s ease infinite`,
  };

  const borderStyle = showBorder ? {
    textShadow: `
      -1px -1px 0 ${colors[0]},
      1px -1px 0 ${colors[1]},
      -1px 1px 0 ${colors[2]},
      1px 1px 0 ${colors[3] || colors[0]}
    `
  } : {};

  return (
    <>
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <motion.span
        className={className}
        style={{ ...gradientStyle, ...borderStyle }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.span>
    </>
  );
};

export default GradientText;