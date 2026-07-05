import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../../components/Landing';
import { Target, Eye, Layers, Users, Zap, CheckCircle, ArrowDown } from 'lucide-react';
import './InfoPages.css';

const About = () => {
  const workflow = [
    'Application Submitted',
    'Admin Verification',
    'Engineer Assignment',
    'Visit Scheduled',
    'Meter Installation',
    'Connection Activated'
  ];

  return (
    <div className="info-page-container">
      <Navbar />
      
      <div className="info-page-banner">
        <h1>About Us</h1>
        <div className="info-breadcrumb">
          <Link to="/">Home</Link> &gt; About Us
        </div>
      </div>

      <div className="info-content-wrapper">
        <div className="info-card">
          <h2><Target size={24} /> Mission</h2>
          <p>
            To deliver a seamless, transparent, and digital-first public utility service 
            that ensures reliable electricity access for all citizens. We aim to modernize 
            the grid management experience by bridging the gap between consumers, field 
            engineers, and administrative bodies through secure technology.
          </p>

          <h2 style={{ marginTop: '2rem' }}><Eye size={24} /> Vision</h2>
          <p>
            A fully automated, paperless, and sustainable energy sector where citizen 
            services are accessible instantly, complaints are resolved in real-time, 
            and energy consumption can be tracked digitally to encourage conservation.
          </p>
        </div>

        <div className="info-card">
          <h2><Layers size={24} /> Project Overview</h2>
          <p>
            The Smart Electricity Management Platform is a centralized web application built 
            specifically to digitize manual utility workflows. It replaces traditional paper 
            forms with a highly secure role-based dashboard system.
          </p>
          <p><strong>Technology Stack:</strong></p>
          <ul>
            <li><strong>Frontend:</strong> React.js, Lucide Icons, Pure CSS</li>
            <li><strong>Backend:</strong> Node.js, Express.js</li>
            <li><strong>Database:</strong> MongoDB via Mongoose</li>
            <li><strong>Security:</strong> JSON Web Tokens (JWT), Bcrypt hashing</li>
          </ul>
        </div>

        <div className="info-card">
          <h2><Users size={24} /> User Roles</h2>
          <div className="about-grid">
            <div className="about-item">
              <h4>Customer</h4>
              <p>Can apply for new connections, update KYC documents, track application status, and view energy usage.</p>
            </div>
            <div className="about-item">
              <h4>Field Engineer</h4>
              <p>Receives assigned jobs digitally, schedules site visits, and confirms meter installations.</p>
            </div>
            <div className="about-item">
              <h4>Admin</h4>
              <p>Verifies customer documents, approves applications, manages complaints, and assigns field engineers.</p>
            </div>
            <div className="about-item">
              <h4>Super Admin</h4>
              <p>Has full platform oversight, manages user roles, and handles executive system administration.</p>
            </div>
          </div>
        </div>

        <div className="info-card" style={{ textAlign: 'center' }}>
          <h2><Zap size={24} style={{ margin: '0 auto' }}/> Project Workflow</h2>
          <p>How a standard new electricity connection is processed.</p>
          
          <div className="workflow-diagram">
            <div className="workflow-node" style={{ background: '#005BAC', color: 'white' }}>Customer</div>
            <ArrowDown size={20} className="workflow-arrow" />
            {workflow.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="workflow-node">{step}</div>
                {idx !== workflow.length - 1 && <ArrowDown size={20} className="workflow-arrow" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
