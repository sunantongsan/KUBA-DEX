import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div className={`relative bg-dark-card/60 backdrop-blur-md rounded-2xl border border-white/5 p-6 overflow-hidden ${glow ? 'shadow-[0_0_30px_-5px_rgba(0,255,163,0.15)] border-kuba/30' : ''} ${className}`}>
      {glow && (
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-kuba/10 rounded-full blur-3xl pointer-events-none"></div>
      )}
      {children}
    </div>
  );
};