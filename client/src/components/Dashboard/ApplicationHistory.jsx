import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ApplicationHistoryCard from './ApplicationHistoryCard';
import { PackageOpen } from 'lucide-react';

const ApplicationHistory = ({ user, onViewDetails }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;

    axios.get('/api/connections/history', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => {
      setHistory(res.data || []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      toast.error('Failed to load application history.');
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton skeleton-block" style={{ height: '140px' }}></div>
        <div className="skeleton skeleton-block" style={{ height: '140px' }}></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '1.5rem', backgroundColor: '#F3F4F6', borderRadius: '50%', color: '#9CA3AF' }}>
          <PackageOpen size={48} />
        </div>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>No previous applications found</h3>
        <p style={{ margin: 0, color: '#6B7280' }}>You haven't submitted any electricity connection requests yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {history.map(app => (
        <ApplicationHistoryCard key={app._id} application={app} onViewDetails={onViewDetails} />
      ))}
    </div>
  );
};

export default ApplicationHistory;
