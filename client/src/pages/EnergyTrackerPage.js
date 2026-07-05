import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLifecycle } from '../hooks/useLifecycle';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Settings } from 'lucide-react';
import { LoadingSpinner } from '../components/Common';
import './EnergyTrackerPage.css';

Chart.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

export default function EnergyTrackerPage() {
  const [meterNumber, setMeterNumber] = useState('');
  const [usageData, setUsageData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchInit = async () => {
      const stored = JSON.parse(localStorage.getItem('user'));
      if (stored) {
        setUser(stored);
        setMeterNumber(stored.meterNumber || '');
        
        try {
          const connRes = await axios.get('http://localhost:5000/api/connections/my-request', {
            headers: { Authorization: `Bearer ${stored.token}` }
          });
          setConnectionStatus(connRes.data);
        } catch (err) {
          setConnectionStatus({ status: 'Not Applied' });
        }
      }
      setLoading(false);
    };
    fetchInit();
  }, []);

  const { isAllowed } = useLifecycle(connectionStatus);

  const fetchMonthlyUsage = async () => {
    if (!user) return;
    if (meterNumber.length !== 12) {
      setUsageData(null);
      alert('Account number must be 12 digits.');
      return;
    }

    if (meterNumber !== user.meterNumber) {
      setUsageData(null);
      alert('Please enter your own account number.');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/users/usage', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsageData(res.data);
    } catch (err) {
      console.error('Error fetching usage:', err.response || err.message);
      alert('Could not fetch usage data.');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><LoadingSpinner /></div>;

  if (!isAllowed('/tracker')) {
    return (
      <div className="tracker-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Settings size={48} style={{ opacity: 0.2, marginBottom: '1rem', color: '#6B7280' }} />
        <h2 style={{ color: '#111827' }}>Energy Data Unavailable</h2>
        <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>
          Energy data will become available after your electricity connection becomes active.
        </p>
      </div>
    );
  }

  const chartData = usageData && {
    labels: usageData.map(m => m.month),
    datasets: [{
      label: 'Monthly Energy Consumption (kWh)',
      data: usageData.map(m => m.units),
      backgroundColor: usageData.map(u =>
        u.units <= 250 ? '#4caf50' :
        u.units <= 300 ? '#ff9800' :
        '#f44336'
      ),
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Monthly Usage for Account ${meterNumber}`,
        color: '#007bff',
        font: { size: 18 }
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            const v = ctx.parsed.y;
            const level = v <= 250 ? 'Low' : v <= 300 ? 'Moderate' : 'High';
            return `Usage: ${v} kWh (${level})`;
          }
        }
      },
      legend: { display: false }
    },
    scales: {
      y: {
        title: { display: true, text: 'Units (kWh)', color: '#333' },
        ticks: { color: '#333' }
      },
      x: { ticks: { color: '#333' } }
    }
  };

  return (
    <div className="tracker-container">
      <h2>📊 Monthly Energy Usage Tracker</h2>

      <input
        type="text"
        inputMode="numeric"
        pattern="\d*"
        placeholder="🔢 Enter 12-digit Account Number"
        value={meterNumber}
        onChange={e => {
          const d = e.target.value.replace(/\D/g, '').slice(0, 12);
          setMeterNumber(d);
        }}
      />

      <button onClick={fetchMonthlyUsage}>
        Show Monthly Graph
      </button>

      {usageData ? (
        <>
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className="energy-message">
            <p>
              📆 Data reflects your monthly usage history. Energy saved today builds a brighter tomorrow!
            </p>
            <h4>💡 Quick Energy-Saving Tips:</h4>
            <ul>
              <li>Switch off lights and fans when not in use.</li>
              <li>Replace incandescent bulbs with LED alternatives.</li>
              <li>Unplug chargers and electronics to avoid standby power.</li>
            </ul>
          </div>
        </>
      ) : (
        <p className="pending-note">📊 Enter your account number to display the usages </p>
      )}
    </div>
  );
}