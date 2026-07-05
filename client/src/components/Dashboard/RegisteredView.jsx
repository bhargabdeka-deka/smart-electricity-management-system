import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Info, ArrowRight, ShieldCheck, Clock, CheckCircle2, 
  FileText, Home, User, Hash, Calendar, CircleDashed
} from 'lucide-react';
import './Dashboard.css';

const RegisteredView = ({ user, dashboardData }) => {
  const navigate = useNavigate();

  const account = dashboardData?.meterNumber || user?.meterNumber || 'Pending';
  const district = user?.district?.replace(/_/g, ' ') || 'Not Assigned';
  const regDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

  return (
    <>
      <style>{`
        .registered-card {
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(15,23,42,.08);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          background-color: white;
          border: none;
        }
        .registered-card:hover {
          transform: translateY(-3px);
        }
        .registered-action-btn {
          transition: transform 0.25s ease, background-color 0.2s ease;
        }
        .registered-action-btn:hover {
          transform: translateY(-2px);
        }
        .hero-welcome-card {
          padding: 60px;
        }
        .hero-flex-container {
          display: flex;
          min-height: 320px;
        }
        .hero-left {
          flex: 1;
          width: 100%;
          max-width: none;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .hero-right {
          width: 35%;
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
          position: relative;
        }
        .hero-title-container {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 20px;
        }
        .hero-title {
          font-size: 42px;
          font-weight: 700;
          line-height: 1.3;
          margin: 0;
          color: white;
          word-break: normal;
          overflow-wrap: break-word;
        }
        .hero-subtitle {
          font-size: 24px;
          font-weight: 500;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }
        .hero-desc {
          font-size: 18px;
          line-height: 1.8;
          margin: 0 0 24px 0;
          opacity: 0.9;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(255,255,255,0.15);
          padding: 0.75rem 1.25rem;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 17px;
          width: fit-content;
        }
        .hero-icon {
          opacity: 0.08;
          color: white;
          transform: rotate(15deg);
          margin-right: -40px;
          margin-bottom: -40px;
          width: 280px;
          height: 280px;
        }

        /* Tablet (768px - 1199px) */
        @media (max-width: 1199px) and (min-width: 768px) {
          .hero-welcome-card {
            padding: 40px !important;
          }
          .hero-title {
            font-size: 36px;
          }
          .hero-right {
            width: 30%;
          }
        }

        /* Mobile (below 768px) */
        @media (max-width: 767px) {
          .hero-welcome-card {
            padding: 24px !important;
          }
          .hero-flex-container {
            flex-direction: column;
            align-items: flex-start;
          }
          .hero-right {
            width: 100%;
            justify-content: center;
            align-items: center;
            margin-top: 30px;
          }
          .hero-title {
            font-size: 28px;
          }
          .hero-icon {
            width: 120px !important;
            height: 120px !important;
            margin: 0 !important;
            opacity: 0.05 !important;
            transform: none !important;
          }
        }

      .registered-grid-account {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 40px;
      }
      .registered-grid-benefits {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
      }
      @media (max-width: 991px) {
        .registered-grid-account {
          grid-template-columns: repeat(2, 1fr);
        }
        .registered-grid-benefits {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 576px) {
        .registered-grid-account {
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .registered-grid-benefits {
          grid-template-columns: 1fr;
        }
      }
    `}</style>

      <div className="registered-view-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '32px', 
        maxWidth: '1500px', 
        margin: 'auto', 
        padding: '32px',
        boxSizing: 'border-box',
        width: '100%'
      }}>
        
        {/* SECTION 1: Hero Welcome Card */}
        <div className="dash-card hero-welcome-card registered-card" style={{ 
          backgroundColor: '#005BAC', 
          color: 'white', 
          overflow: 'hidden'
        }}>
          <div className="hero-flex-container">
            
            <div className="hero-left">
              <div className="hero-title-container">
                <Zap size={36} color="#F59E0B" style={{ flexShrink: 0, marginTop: '4px' }} />
                <h2 className="hero-title">
                  Welcome to Smart Electricity Management System
                </h2>
              </div>
              
              <h3 className="hero-subtitle">
                Congratulations! Your digital account has been created successfully.
              </h3>
              
              <p className="hero-desc">
                You are now ready to apply for a new electricity connection.
              </p>

              <div className="hero-badge">
                <Info size={20} />
                <span>No electricity connection has been linked to your account yet.</span>
              </div>
            </div>

            <div className="hero-right">
              <Zap className="hero-icon" />
            </div>

          </div>
        </div>

        {/* SECTION 4: Account Summary */}
        <div className="dash-card registered-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '24px', margin: '0 0 24px 0', color: '#111827' }}>Account Summary</h3>
          <div className="registered-grid-account">
            
            <div className="summary-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                <Hash size={14} /> ACCOUNT NUMBER
              </div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#111827', marginTop: '8px' }}>{account}</div>
            </div>

            <div className="summary-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                <Home size={14} /> DISTRICT
              </div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#111827', marginTop: '8px' }}>{district}</div>
            </div>

            <div className="summary-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                <Calendar size={14} /> REGISTRATION DATE
              </div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#111827', marginTop: '8px' }}>{regDate}</div>
            </div>

            <div className="summary-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                <User size={14} /> ACCOUNT STATUS
              </div>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  backgroundColor: '#F3F4F6', 
                  color: '#4B5563', 
                  padding: '0.35rem 0.85rem', 
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}><CheckCircle2 size={14} /> Registered</span>
              </div>
            </div>

          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
          
          {/* SECTION 2: Next Step Card */}
          <div className="dash-card registered-card" style={{ borderTop: '4px solid #F59E0B', padding: '32px' }}>
            <h3 style={{ fontSize: '24px', margin: '0 0 16px 0', color: '#111827' }}>Next Step</h3>
            <p style={{ color: '#4B5563', fontSize: '17px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              To receive electricity services you must submit a New Connection Application.
            </p>
            
            <div style={{ backgroundColor: '#F9FAFB', padding: '24px', borderRadius: '8px' }}>
              <p style={{ fontWeight: '600', color: '#111827', margin: '0 0 20px 0', fontSize: '17px' }}>The application includes:</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4B5563', fontSize: '17px', marginBottom: '18px' }}><User size={20} color="#005BAC" /> Personal Details</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4B5563', fontSize: '17px', marginBottom: '18px' }}><Home size={20} color="#005BAC" /> Address Details</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4B5563', fontSize: '17px', marginBottom: '18px' }}><FileText size={20} color="#005BAC" /> Identity Documents</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4B5563', fontSize: '17px', marginBottom: '0' }}><ShieldCheck size={20} color="#005BAC" /> Property Verification</li>
              </ul>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '17px', marginTop: '30px' }}>
              <Clock size={20} /> <span>Estimated processing time: <strong>7–10 Working Days</strong></span>
            </div>

            <button 
              onClick={() => navigate('/apply')}
              className="registered-action-btn"
              style={{ 
                width: '100%', 
                backgroundColor: '#005BAC', 
                color: 'white', 
                padding: '18px', 
                borderRadius: '6px', 
                border: 'none',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '30px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#004685'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#005BAC'}
            >
              Apply for New Connection <ArrowRight size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* SECTION 5: Timeline Preview */}
            <div className="dash-card registered-card" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '24px', margin: '0 0 20px 0', color: '#111827' }}>Application Roadmap</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { label: 'Registration', active: true },
                  { label: 'Application', active: false },
                  { label: 'Verification', active: false },
                  { label: 'Engineer Visit', active: false },
                  { label: 'Meter Installation', active: false },
                  { label: 'Activation', active: false }
                ].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%',
                      backgroundColor: step.active ? '#10B981' : '#F3F4F6',
                      color: step.active ? 'white' : '#9CA3AF',
                      marginRight: '14px'
                    }}>
                      {step.active ? <CheckCircle2 size={20} /> : <CircleDashed size={20} />}
                    </div>
                    <span style={{ 
                      fontSize: '17px',
                      fontWeight: step.active ? '600' : '400',
                      color: step.active ? '#111827' : '#6B7280'
                    }}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 6: Quick Actions */}
            <div className="dash-card registered-card" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '24px', margin: '0 0 24px 0', color: '#111827' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <button 
                  onClick={() => navigate('/apply')}
                  className="registered-action-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '18px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', color: '#111827', fontSize: '17px', fontWeight: '500', textAlign: 'left' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                >
                  <Zap size={22} color="#005BAC" /> Apply Connection
                </button>
                <button 
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '18px', backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '8px', cursor: 'not-allowed', color: '#9CA3AF', fontSize: '17px', fontWeight: '500', textAlign: 'left' }}
                >
                  <FileText size={22} /> View Application Process (Info)
                </button>
                <button 
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '18px', backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '8px', cursor: 'not-allowed', color: '#9CA3AF', fontSize: '17px', fontWeight: '500', textAlign: 'left' }}
                >
                  <Info size={22} /> Contact Support (Info)
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 3: Benefits Card */}
        <div className="dash-card registered-card" style={{ backgroundColor: '#F8FAFC', padding: '40px 30px' }}>
          <h3 style={{ fontSize: '30px', textAlign: 'center', margin: '0 0 40px 0', color: '#111827', fontWeight: '600' }}>Why use the Digital Portal?</h3>
          <div className="registered-grid-benefits">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '50%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', color: '#005BAC' }}>
                <Zap size={54} />
              </div>
              <h4 style={{ fontSize: '22px', margin: 0, color: '#111827', fontWeight: '600' }}>Digital Tracking</h4>
              <p style={{ fontSize: '16px', margin: 0, color: '#6B7280' }}>Track every stage online.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '50%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', color: '#005BAC' }}>
                <ShieldCheck size={54} />
              </div>
              <h4 style={{ fontSize: '22px', margin: 0, color: '#111827', fontWeight: '600' }}>Secure Documents</h4>
              <p style={{ fontSize: '16px', margin: 0, color: '#6B7280' }}>Upload documents safely.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '50%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', color: '#005BAC' }}>
                <Clock size={54} />
              </div>
              <h4 style={{ fontSize: '22px', margin: 0, color: '#111827', fontWeight: '600' }}>Fast Processing</h4>
              <p style={{ fontSize: '16px', margin: 0, color: '#6B7280' }}>Receive updates instantly.</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default RegisteredView;
