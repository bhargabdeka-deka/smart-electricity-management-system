import React from 'react';
import { Zap, FileText, HeadphonesIcon, BarChart2 } from 'lucide-react';
import './Landing.css';

const Services = () => {
  const services = [
    {
      icon: <Zap size={28} />,
      title: 'New Connection',
      description: 'Apply for residential or commercial electricity connections seamlessly online.'
    },
    {
      icon: <FileText size={28} />,
      title: 'Customer KYC',
      description: 'Update your ownership proofs and Aadhaar documents securely through our portal.'
    },
    {
      icon: <HeadphonesIcon size={28} />,
      title: 'Complaint Management',
      description: 'Log and track technical issues or billing complaints with a guaranteed SLA.'
    },
    {
      icon: <BarChart2 size={28} />,
      title: 'Energy Dashboard',
      description: 'Monitor your electricity consumption patterns and estimate upcoming bills.'
    }
  ];

  return (
    <section id="services">
      <div className="section-header">
        <h2>Our Core Services</h2>
        <p>A comprehensive suite of utility services designed for convenience, transparency, and speed.</p>
      </div>

      <div className="landing-services-grid">
        {services.map((service, idx) => (
          <div key={idx} className="service-card">
            <div className="service-icon-wrapper">
              {service.icon}
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
