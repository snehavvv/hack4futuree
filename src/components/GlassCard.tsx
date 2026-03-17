import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div className={`glass ${hover ? 'glass-hover' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
