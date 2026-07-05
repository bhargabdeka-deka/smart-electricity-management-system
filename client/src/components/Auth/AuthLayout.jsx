import React from 'react';
import AuthIllustration from './AuthIllustration';
import './Auth.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <AuthIllustration />
      <div className="auth-form-panel">
        <div className="auth-card">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
