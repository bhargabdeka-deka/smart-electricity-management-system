import React from 'react';
import { AlertCircle } from 'lucide-react';
import './Common.css';

const FormError = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="common-form-error" aria-live="assertive" role="alert">
      <AlertCircle size={14} className="common-error-icon" />
      <span>{message}</span>
    </div>
  );
};

export default FormError;
