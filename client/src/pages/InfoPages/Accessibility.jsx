import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../../components/Landing';
import { Keyboard, MonitorSmartphone, Palette, Ear, HelpCircle, FastForward } from 'lucide-react';
import './InfoPages.css';

const Accessibility = () => {
  return (
    <div className="info-page-container">
      <Navbar />
      
      <div className="info-page-banner">
        <h1>Accessibility Statement</h1>
        <div className="info-breadcrumb">
          <Link to="/">Home</Link> &gt; Accessibility
        </div>
      </div>

      <div className="info-content-wrapper">
        <div className="info-card">
          <p>
            The Smart Electricity Management Platform is committed to ensuring digital accessibility 
            for all citizens, including individuals with disabilities. We continually improve the 
            user experience for everyone and apply the relevant accessibility standards based on 
            Web Content Accessibility Guidelines (WCAG) 2.1.
          </p>

          <h2><Keyboard size={24} /> Keyboard Navigation</h2>
          <p>
            All critical workflows, including the connection application, KYC uploads, and dashboard 
            navigation, can be fully operated using a keyboard interface without requiring specific 
            timings for individual keystrokes.
          </p>

          <h2><MonitorSmartphone size={24} /> Responsive Design</h2>
          <p>
            The platform is built with a mobile-first, responsive framework. Text can be zoomed up to 
            200% without loss of content or functionality, and layouts adapt seamlessly to various 
            devices and screen orientations.
          </p>

          <h2><Palette size={24} /> Color Contrast</h2>
          <p>
            We adhere to strict color contrast ratios. Our primary palette (Deep Blue and Soft White) 
            was selected specifically to exceed AAA contrast requirements, ensuring readability for users 
            with visual impairments or color blindness.
          </p>

          <h2><Ear size={24} /> Screen Reader Compatibility</h2>
          <p>
            Forms, buttons, and navigation elements utilize semantic HTML5 tags and ARIA labels. This 
            ensures robust compatibility with modern screen readers (like NVDA, JAWS, and VoiceOver) 
            so visually impaired users can navigate the platform independently.
          </p>

          <h2><HelpCircle size={24} /> Accessibility Support Contact</h2>
          <p>
            If you encounter any accessibility barriers while using our platform, please contact our 
            dedicated support team at <strong>accessibility@smartelectricity.gov.in</strong>. We aim 
            to respond to accessibility feedback within 48 hours.
          </p>

          <h2><FastForward size={24} /> Future Improvements</h2>
          <p>
            We are actively auditing our Field Engineer and Admin dashboards to bring them to the same 
            level of accessibility compliance as our public-facing and Customer portals. Future updates 
            will include multi-language support and text-to-speech integration.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Accessibility;
