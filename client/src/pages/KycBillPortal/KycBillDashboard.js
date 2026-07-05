// src/pages/KycBillPortal/KycBillDashboard.js

import React, { useState, useEffect } from 'react';
import MeterGate from './MeterGate';
import KycUpload from './KycUpload';
//import DownloadSummery from './DownloadSummery';
import './KycBillPortal.css';
import jsPDF from 'jspdf';

export default function KycBillDashboard() {
  const [meterNumber, setMeterNumber] = useState('');
  const [kycInfo, setKycInfo] = useState(null);
  //const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Autofill meter number from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    if (parsedUser?.meterNumber) {
      setMeterNumber(parsedUser.meterNumber);
    }
  }, []);

  // Fetch KYC status + bills whenever meterNumber changes
  useEffect(() => {
    if (!meterNumber) return;

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [kycRes, ] = await Promise.all([             //billRes
          fetch(`/api/users/kyc-status?meter=${meterNumber}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`/api/users/bills?meter=${meterNumber}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (kycRes.ok) {
          const kycData = await kycRes.json();
          setKycInfo(kycData);
        }

        // if (billRes.ok) {
        //   const billData = await billRes.json();
        //   setBills(billData);
        // }
      } catch (err) {
        console.error('❌ Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meterNumber]);

  // Poll every 10s when KYC is pending, to pick up admin changes
  useEffect(() => {
    if (!meterNumber || kycInfo?.kycStatus !== 'Pending') return;

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) return;

    const interval = setInterval(async () => {
      console.log('⏱️ Polling KYC status… current:', kycInfo.kycStatus);
      try {
        const res = await fetch(`/api/users/kyc-status?meter=${meterNumber}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const updated = await res.json();
        if (updated.kycStatus !== kycInfo.kycStatus) {
          console.log('🔁 KYC status updated:', updated.kycStatus);
          setKycInfo(updated);
        }
      } catch (err) {
        console.error('❌ Polling error:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [meterNumber, kycInfo?.kycStatus]);

  // Manually refresh KYC after upload
  const refreshKycStatus = async () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token || !meterNumber) return;
    try {
      const res = await fetch(`/api/users/kyc-status?meter=${meterNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKycInfo(data);
      }
    } catch (err) {
      console.error('❌ KYC refresh error:', err);
    }
  };

  // Manual portal refresh button
  const handleRefresh = () => {
    if (meterNumber) {
      setMeterNumber(meterNumber);
    }
  };

  // 📄 Generate PDF summary after KYC is reviewed
  const handleDownloadPdf = () => {
    if (!kycInfo || !meterNumber) return;
     // 🔍 Add this line here
  console.log('👀 KYC Info sent to PDF:', kycInfo);



    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('  APDCL KYC Summary Report', 20, 20);

    doc.setFontSize(12);
    doc.text(`Meter Number: ${meterNumber}`, 20, 40);
    doc.text(`Full Name: ${kycInfo.fullName}`, 20, 50);
    doc.text(`Aadhaar Number: ${kycInfo.aadhaarNumber}`, 20, 60);
    doc.text(`PAN Number: ${kycInfo.panNumber}`, 20, 70);

    doc.setFontSize(11);
    doc.text('"Electricity fuels progress, connection, and the promise of tomorrow."', 20, 90);
    

    doc.setFontSize(12);
    const statusText = kycInfo.kycStatus === 'Approved'
      ? ' Your KYC has been APPROVED.\nYou will not face any service interruptions.'
      : ' Your KYC was REJECTED.\nPlease re-upload or visit your nearest APDCL office.';
    doc.text(statusText, 20, 120);

    if (kycInfo.decisionDate) {
      doc.text(`Reviewed On: ${new Date(kycInfo.decisionDate).toLocaleDateString()}`, 20, 140);
    }

    doc.setFontSize(12);
    doc.text(' Saubhagya - Pradhan Mantri Sahaj Bijli Har Ghar Yojana', 20, 160);
    doc.setFontSize(11);
    doc.text('Free electricity for rural and urban households.', 20, 170);
    
    doc.setFontSize(10);
    doc.text('— APDCL Digital Services\nOfficial Summary Document', 20, 215);

    doc.save(`KYC_Summary_${meterNumber}.pdf`);
  };

  return (
    <div className="kyc-bill-dashboard">
      <div className="card-section">
        <MeterGate onSubmit={setMeterNumber} />
        {meterNumber && (
          <button className="refresh-button" onClick={handleRefresh}>
            ↻ Refresh My Portal
          </button>
        )}
      </div>

      {loading && <div className="loading">Loading…</div>}

      {!loading && meterNumber && (
        <>
          <div className="card-section">
            <KycUpload kycInfo={kycInfo} onSuccess={refreshKycStatus} />
          </div>

          {/* KYC Status Card */}
          {kycInfo?.kycStatus && (
            <div
              className={`card-section kyc-status-card status-${kycInfo.kycStatus.toLowerCase()}`}
            >
              <h3>📋 KYC Submission Status</h3>
              <p>
                <strong>Status:</strong>{' '}
                <span className="kyc-badge">
                  {kycInfo.kycStatus === 'Pending'
                    ? 'KYC submitted and under review by APDCL authority'
                    : kycInfo.kycStatus === 'Approved'
                    ? ' Your KYC is approved'
                    : ' Your KYC is rejected. Please visit your nearest APDCL office'}
                </span>
              </p>
              {kycInfo.decisionDate && (
                <p>
                  <strong>Reviewed On:</strong>{' '}
                  {new Date(kycInfo.decisionDate).toLocaleDateString()}
                </p>
              )}

              {/* PDF Download Button or Message */}
              {kycInfo.kycStatus !== 'Pending' ? (
                <button className="refresh-button" onClick={handleDownloadPdf}>
                  📥 Download PDF Summary
                </button>
              ) : (
                <p className="status-note">
                  🕒 Your KYC is still under review. PDF will be available once reviewed.
                </p>
              )}
            </div>
          )}

          {/* Download Summary Component */}
         
        </>
      )}

      {!loading && !meterNumber && (
        <div className="card-section">
          <p className="portal-blocked">
             Please enter your meter number to access your KYC & billing portal.
          </p>
        </div>
      )}
    </div>
  );
}