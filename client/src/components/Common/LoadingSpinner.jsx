import React from 'react';
import { Loader2 } from 'lucide-react';
import './Common.css';

const LoadingSpinner = ({ size = 18, color = "currentColor", className = "" }) => {
  return (
    <Loader2 
      size={size} 
      color={color} 
      className={`common-spinner ${className}`} 
      aria-hidden="true" 
    />
  );
};

export default LoadingSpinner;
