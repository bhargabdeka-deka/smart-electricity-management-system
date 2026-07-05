import React from 'react';

const AuthHeader = ({ title, subtitle }) => {
  return (
    <div className="auth-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
