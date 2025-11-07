import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  className = '',
  showLabel = false 
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className={`progress-bar-container ${className}`}>
      <div className="progress-track">
        <div 
          className="progress-filled" 
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress-label">
          <strong>{clampedValue}%</strong> de progression
        </span>
      )}
    </div>
  );
};
