import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../../components/Landing';
import { Shield, FileKey, Database, Cookie, UserCheck, HardDrive, Mail } from 'lucide-react';
import './InfoPages.css';

const Privacy = () => {
  return (
    <div className="info-page-container">
      <Navbar />
      
      <div className="info-page-banner">
        <h1>Privacy Policy</h1>
        <div className="info-breadcrumb">
          <Link to="/">Home</Link> &gt; Privacy Policy
        </div>
      </div>

      <div className="info-content-wrapper">
        <div className="info-card">
          <p>
            Effective Date: October 1, 2026. <br/>
            The Smart Electricity Management Platform is committed to protecting your privacy 
            and ensuring the security of your personal information. This policy outlines how 
            we collect, use, and safeguard your data.
          </p>

          <h2><Database size={24} /> Information Collection</h2>
          <p>
            When you register on our portal, we collect essential demographic and contact 
            information required to process utility services. This includes your full name, 
            email address, phone number, and physical district location. Additional technical 
            data such as IP addresses and browser fingerprints may be collected temporarily 
            for fraud prevention.
          </p>

          <h2><Shield size={24} /> Authentication</h2>
          <p>
            We utilize JSON Web Tokens (JWT) and advanced cryptographic hashing (Bcrypt) 
            to secure your authentication credentials. Passwords are never stored in plain 
            text, and session tokens expire automatically to prevent unauthorized access.
          </p>

          <h2><FileKey size={24} /> Uploaded Documents</h2>
          <p>
            During the Know Your Customer (KYC) and application processes, you are required 
            to upload sensitive identity documents, such as Aadhaar cards and proof of ownership. 
            These files are encrypted at rest on our secure servers and are strictly accessible 
            only by authorized administrative personnel for verification purposes.
          </p>

          <h2><HardDrive size={24} /> Data Security</h2>
          <p>
            We implement industry-standard encryption protocols (TLS/SSL) for all data in transit 
            between your browser and our backend systems. Our databases are deployed within 
            virtual private clouds with strict firewall rules and regular security audits.
          </p>

          <h2><Cookie size={24} /> Cookies</h2>
          <p>
            Our platform uses minimal cookies solely for maintaining active user sessions and 
            security tokens. We do not use third-party tracking cookies, advertising pixels, 
            or cross-site profiling technologies.
          </p>

          <h2><UserCheck size={24} /> User Rights & Data Retention</h2>
          <p>
            You retain the right to request access to, or correction of, your personal data 
            held within our systems. Utility connection data, including application history 
            and uploaded KYC documents, are retained in accordance with national public utility 
            regulations for audit and compliance purposes.
          </p>

          <h2><Mail size={24} /> Contact Information</h2>
          <p>
            If you have concerns regarding this privacy policy or how your data is handled, 
            please contact our Data Protection Officer at <strong>privacy@smartelectricity.gov.in</strong>.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
