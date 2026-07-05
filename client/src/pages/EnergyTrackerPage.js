import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './EnergyTrackerPage.css';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function EnergyTrackerPage() {
  const [meterNumber, setMeterNumber] = useState('');
  const [usageData, setUsageData]     = useState(null);

  // grab token & stored meter from localStorage
  const stored = JSON.parse(localStorage.getItem('user')) || {};
  const { token, meterNumber: storedMeter } = stored;

  // set JWT header once on mount
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const fetchMonthlyUsage = async () => {
    // 1) length check
    if (meterNumber.length !== 12) {
      setUsageData(null);
      alert('Meter number must be 12 digits.');
      return;
    }

    // 2) ownership check
    if (meterNumber !== storedMeter) {
      setUsageData(null);
      alert('Please enter your own meter number.');
      return;
    }

    // 3) valid—fetch data
    try {
      const res = await axios.get('/api/users/usage');
      setUsageData(res.data);
    } catch (err) {
      console.error('Error fetching usage:', err.response || err.message);
      alert('Could not fetch usage data.');
    }
  };

  // chart config (unchanged)
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
        text: `Monthly Usage for Meter ${meterNumber}`,
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
        placeholder="🔢 Enter 12-digit Meter Number"
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
              <li>Run full loads in your dishwasher and washing machine.</li>
              <li>Use cold-water cycles to save on heating costs.</li>
              <li>Seal window and door gaps to maintain indoor temperature.</li>
              <li>Hang clothes to dry instead of using the dryer.</li>
            </ul>
          </div>
        </>
      ) : (
        <p className="pending-note">📊 Enter your meter number to display the usages </p>
      )}
    </div>
  );
}