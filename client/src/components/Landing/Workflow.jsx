import React from 'react';
import { User, FileCheck, UserCog, CalendarCheck, Wrench, PlugZap } from 'lucide-react';
import './Landing.css';

const Workflow = () => {
  const steps = [
    { icon: <User size={24} />, title: 'Application Submitted', desc: 'Customer submits the connection form with required KYC.' },
    { icon: <FileCheck size={24} />, title: 'Admin Verification', desc: 'Utility admin reviews the documents and approves the request.' },
    { icon: <UserCog size={24} />, title: 'Engineer Assignment', desc: 'An authorized field engineer is assigned to the location.' },
    { icon: <CalendarCheck size={24} />, title: 'Visit Scheduled', desc: 'The engineer confirms a date to visit the premises.' },
    { icon: <Wrench size={24} />, title: 'Meter Installation', desc: 'Physical installation of the smart meter is completed.' },
    { icon: <PlugZap size={24} />, title: 'Connection Activated', desc: 'Electricity flow is activated and tracked digitally.' }
  ];

  return (
    <section id="workflow">
      <div className="section-header">
        <h2>How It Works</h2>
        <p>Our streamlined process ensures quick and transparent electricity connections.</p>
      </div>

      <div className="landing-workflow-container">
        {steps.map((step, idx) => (
          <div key={idx} className="workflow-step">
            <div className="workflow-icon">{step.icon}</div>
            <div className="workflow-content">
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Workflow;
