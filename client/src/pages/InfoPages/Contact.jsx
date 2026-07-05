import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../../components/Landing';
import { Mail, Phone, MapPin, Clock, AlertCircle, Send, CheckCircle } from 'lucide-react';
import './InfoPages.css';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Real backend integration would go here later
  };

  return (
    <div className="info-page-container">
      <Navbar />
      
      <div className="info-page-banner">
        <h1>Contact Us</h1>
        <div className="info-breadcrumb">
          <Link to="/">Home</Link> &gt; Contact Us
        </div>
      </div>

      <div className="info-content-wrapper">
        <div className="info-card">
          <div className="contact-grid">
            
            {/* Contact Details */}
            <div>
              <h2>Get in Touch</h2>
              <p style={{ marginBottom: '2rem' }}>
                Have questions about your connection application or need technical support? 
                Reach out to our dedicated helpdesk teams.
              </p>

              <ul className="contact-info-list">
                <li className="contact-info-item">
                  <Mail className="icon" size={24} />
                  <div>
                    <strong>Email Support</strong>
                    <p>support@smartelectricity.gov.in</p>
                  </div>
                </li>
                <li className="contact-info-item">
                  <Phone className="icon" size={24} />
                  <div>
                    <strong>Toll-Free Helpline</strong>
                    <p>1800-123-4567</p>
                  </div>
                </li>
                <li className="contact-info-item">
                  <MapPin className="icon" size={24} />
                  <div>
                    <strong>Head Office</strong>
                    <p>Smart Grid Complex, Vidyut Bhavan<br/>Sector 5, New Delhi 110001</p>
                  </div>
                </li>
                <li className="contact-info-item">
                  <Clock className="icon" size={24} />
                  <div>
                    <strong>Office Hours</strong>
                    <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                  </div>
                </li>
                <li className="contact-info-item">
                  <AlertCircle className="icon" size={24} color="#DC2626" />
                  <div>
                    <strong style={{ color: '#DC2626' }}>Emergency Support</strong>
                    <p>For power outages, dial 1912 (24x7)</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Contact Form */}
            <div>
              <h2>Send a Message</h2>
              {submitted ? (
                <div className="success-message">
                  <CheckCircle size={20} />
                  Your message has been received successfully. A support agent will contact you within 24 hours.
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" required placeholder="Enter your full name" />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" required placeholder="Enter your email address" />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input type="text" required placeholder="What is this regarding?" />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea rows="5" required placeholder="Provide details about your query..."></textarea>
                  </div>
                  <button type="submit" className="submit-btn">
                    <Send size={18} /> Send Message
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
