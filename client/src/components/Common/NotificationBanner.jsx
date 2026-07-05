import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import './Common.css';

const NotificationBanner = ({ type = "info", message, className = "" }) => {
  if (!message) return null;

  const icons = {
    error: <AlertCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    success: <CheckCircle2 size={18} />,
    info: <Info size={18} />
  };

  return (
    <div className={`common-banner common-banner-${type} ${className}`} aria-live="assertive" role="alert">
      <div className="common-banner-icon">
        {icons[type] || icons.info}
      </div>
      <span className="common-banner-message">{message}</span>
    </div>
  );
};

export default NotificationBanner;
