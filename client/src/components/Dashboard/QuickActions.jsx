import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusCircle, HeadphonesIcon, FileText, BarChart2, Zap, LogOut, FileSearch, RefreshCcw } from 'lucide-react';
import './Dashboard.css';

const ACTION_MAP = {
  apply_connection: { label: 'Apply for New Connection', icon: PlusCircle, path: '/apply', style: { backgroundColor: '#2563EB', color: '#FFFFFF', border: '1px solid #2563EB', fontWeight: '600' } },
  track_application: { label: 'Track Application', icon: FileSearch, path: '/application-tracker', style: {} },
  view_previous_application: { label: 'View Previous Application', icon: FileSearch, path: '/application-tracker', style: { backgroundColor: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', fontWeight: '500' } },
  withdraw_application: { label: 'Withdraw Application', icon: LogOut, action: 'withdraw', style: { color: '#DC2626' } },
  update_kyc: { label: 'Update KYC', icon: FileText, path: '/kyc-bill', style: {} },
  track_engineer: { label: 'Track Engineer', icon: RefreshCcw, path: '#', style: {} },
  raise_complaint: { label: 'Raise Complaint', icon: HeadphonesIcon, path: '/helpdesk', style: {} },
  energy_dashboard: { label: 'Energy Dashboard', icon: BarChart2, path: '/tracker', style: { gridColumn: 'span 2' } },
  view_bills: { label: 'View Bills', icon: FileText, path: '/kyc-bill', style: {} }
};

const QuickActions = ({ config, refreshData }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  if (!config?.visible) return null;

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const storedUser = localStorage.getItem('user');
      const token = storedUser ? JSON.parse(storedUser).token : '';
      await axios.put('/api/connections/withdraw', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('connectionFormData');
      toast.success('Application withdrawn successfully.');
      setShowModal(false);
      if (refreshData) refreshData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw application.');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <>
      <div className="dash-card">
        <h3 className="dash-card-title">
          <Zap size={20} /> {config.title}
        </h3>
        <div className="quick-action-grid">
          {config.actions?.map(actionKey => {
            const action = ACTION_MAP[actionKey];
            if (!action) return null;
            const Icon = action.icon;
            return (
              <button 
                key={actionKey}
                className="quick-action-btn" 
                style={action.style}
                autoFocus={actionKey === 'apply_connection'}
                onClick={() => {
                  if (action.action === 'withdraw') {
                    setShowModal(true);
                  } else {
                    navigate(action.path);
                  }
                }}
              >
                <Icon size={20} /> {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#111827' }}>Withdraw Application</h3>
            <p style={{ color: '#4B5563', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to withdraw your electricity connection application?<br /><br />
              This will cancel your current request. You can submit a new application later.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ padding: '8px 16px', border: '1px solid #D1D5DB', borderRadius: '4px', background: 'white', color: '#374151', cursor: 'pointer' }}
                disabled={withdrawing}
              >
                Cancel
              </button>
              <button 
                onClick={handleWithdraw}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#DC2626', color: 'white', cursor: 'pointer' }}
                disabled={withdrawing}
              >
                {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;
