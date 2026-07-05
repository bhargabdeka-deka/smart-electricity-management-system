import React from 'react';
import { AlertTriangle } from 'lucide-react';
import LoadingButton from './LoadingButton';
import './Common.css';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, isConfirming, confirmText = "Delete" }) => {
  if (!isOpen) return null;

  return (
    <div className="common-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="common-dialog-box">
        <div className="common-dialog-header">
          <AlertTriangle size={24} className="common-dialog-icon-warning" />
          <h3 id="dialog-title">{title}</h3>
        </div>
        
        <div className="common-dialog-body">
          <p>{message}</p>
        </div>
        
        <div className="common-dialog-footer">
          <button 
            type="button" 
            className="common-btn common-btn-outline" 
            onClick={onCancel}
            disabled={isConfirming}
          >
            Cancel
          </button>
          
          <LoadingButton 
            isLoading={isConfirming}
            loadingText="Processing..."
            variant="danger"
            onClick={onConfirm}
          >
            {confirmText}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
