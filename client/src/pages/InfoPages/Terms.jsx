import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../../components/Landing';
import { FileSignature, CheckSquare, FileText, AlertTriangle, UserX, XCircle } from 'lucide-react';
import './InfoPages.css';

const Terms = () => {
  return (
    <div className="info-page-container">
      <Navbar />
      
      <div className="info-page-banner">
        <h1>Terms of Service</h1>
        <div className="info-breadcrumb">
          <Link to="/">Home</Link> &gt; Terms of Service
        </div>
      </div>

      <div className="info-content-wrapper">
        <div className="info-card">
          <p>
            Welcome to the Smart Electricity Management Platform. By accessing or using our 
            digital services, you agree to be bound by these Terms of Service. Please read 
            them carefully before applying for utility connections.
          </p>

          <h2><CheckSquare size={24} /> User Responsibilities</h2>
          <p>
            As a registered user, you are responsible for maintaining the confidentiality 
            of your account credentials. You agree to provide accurate, current, and complete 
            information during registration and immediately notify the authority of any 
            unauthorized use of your account.
          </p>

          <h2><FileSignature size={24} /> Application Rules</h2>
          <p>
            Applications for new electricity connections must correspond to legally owned or 
            rented premises. Falsifying physical addresses, load requirements, or meter types 
            will result in immediate rejection of the application and potential legal action.
          </p>

          <h2><FileText size={24} /> KYC Verification</h2>
          <p>
            All connection requests are subject to strict Know Your Customer (KYC) verification. 
            By uploading documents such as Aadhaar and ownership proofs, you certify their 
            authenticity. The administration reserves the right to request physical copies 
            or in-person verification if discrepancies arise.
          </p>

          <h2><AlertTriangle size={24} /> Complaint Usage & Engineer Visits</h2>
          <p>
            The Helpdesk portal is provided for reporting genuine technical faults or billing 
            discrepancies. Abuse of the complaint system or submitting false outages is prohibited. 
            When a Field Engineer visit is scheduled, an authorized adult must be present at 
            the premises to facilitate the meter installation or inspection.
          </p>

          <h2><UserX size={24} /> Prohibited Activities</h2>
          <ul>
            <li>Attempting to bypass platform security, authentication, or routing mechanisms.</li>
            <li>Uploading malicious files, scripts, or corrupted PDFs in the document upload portals.</li>
            <li>Harassing or verbally abusing Field Engineers or Helpdesk staff.</li>
            <li>Tampering with physical meters post-installation (which constitutes a criminal offense).</li>
          </ul>

          <h2><XCircle size={24} /> Disclaimer & Termination</h2>
          <p>
            The Smart Electricity Management Platform is provided "as is" without warranties of 
            uninterrupted service. We reserve the right to suspend or terminate accounts that 
            violate these terms, engage in fraudulent activities, or pose a risk to the electrical grid infrastructure.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
