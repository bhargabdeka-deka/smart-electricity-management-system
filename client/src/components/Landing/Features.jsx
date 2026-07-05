import React from 'react';
import { Lock, Users, FolderCheck, LineChart } from 'lucide-react';
import './Landing.css';

const Features = () => {
  const features = [
    { icon: <Lock size={32} />, title: 'Secure Authentication', desc: 'Industry-standard JWT encryption ensures your data and identity remain completely secure.' },
    { icon: <Users size={32} />, title: 'Role-Based Access', desc: 'Dedicated portals and permissions for Customers, Admins, Engineers, and Super Admins.' },
    { icon: <FolderCheck size={32} />, title: 'Digital Documentation', desc: 'Completely paperless workflows for KYC, applications, and installation remarks.' },
    { icon: <LineChart size={32} />, title: 'Real-Time Tracking', desc: 'Live status updates on your dashboard for applications and engineer visits.' }
  ];

  return (
    <section id="features">
      <div className="section-header">
        <h2>Platform Features</h2>
        <p>Built with modern web technologies to deliver a robust enterprise experience.</p>
      </div>

      <div className="landing-features-grid">
        {features.map((feature, idx) => (
          <div key={idx} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
