import React from 'react';
import './Connection.css';

const ConnectionCard = ({ title, children }) => {
  return (
    <div className="conn-card">
      {title && <h3 className="conn-card-title">{title}</h3>}
      <div className="conn-card-body">
        {children}
      </div>
    </div>
  );
};

export default ConnectionCard;
