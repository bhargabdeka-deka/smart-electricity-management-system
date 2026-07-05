import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="landing-cta">
      <h2>Ready to apply for a new electricity connection?</h2>
      <p>Join thousands of citizens experiencing seamless utility services today.</p>
      <div className="landing-cta-buttons">
        <button className="landing-btn landing-btn-primary" onClick={() => navigate('/apply')}>
          Apply Now
        </button>
        <button className="landing-btn landing-btn-secondary" onClick={() => navigate('/login')}>
          Login
        </button>
      </div>
    </section>
  );
};

export default CTA;
