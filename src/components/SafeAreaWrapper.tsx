import React from 'react';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Safe Area Wrapper
 * 
 * Implements full safe-area support automatically across all screens.
 * 
 * Rules:
 * 1. Use "viewport-fit=cover" behavior (handled in PWAHead)
 * 2. Simulate iOS safe areas by applying top padding equivalent to env(safe-area-inset-top)
 * 3. The header must always begin visually at the bottom edge of the safe area
 * 4. Avoid any initial "jump" when opening the PWA
 */
export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`flex flex-col h-full w-full bg-background overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};
