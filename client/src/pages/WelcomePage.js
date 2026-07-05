import React from 'react';
import {
  Navbar,
  Hero,
  Services,
  Workflow,
  Features,
  CTA,
  Footer
} from '../components/Landing';
import '../components/Landing/Landing.css';

const WelcomePage = () => {
  return (
    <div className="landing-wrapper">
      <Navbar />
      <Hero />
      <Services />
      <Workflow />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default WelcomePage;