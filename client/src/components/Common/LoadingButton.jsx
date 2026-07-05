import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import './Common.css';

const LoadingButton = ({ 
  isLoading, 
  loadingText, 
  children, 
  disabled, 
  className = "", 
  variant = "primary",
  type = "button",
  onClick
}) => {
  return (
    <button 
      type={type}
      className={`common-btn common-btn-${variant} ${className}`}
      disabled={isLoading || disabled}
      onClick={onClick}
    >
      {isLoading ? (
        <span className="common-btn-content" aria-live="polite">
          <LoadingSpinner size={18} /> {loadingText || 'Processing...'}
        </span>
      ) : (
        <span className="common-btn-content">
          {children}
        </span>
      )}
    </button>
  );
};

export default LoadingButton;
