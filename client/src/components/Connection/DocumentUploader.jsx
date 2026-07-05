import React from 'react';
import { UploadCloud, File, X, CheckCircle } from 'lucide-react';
import './Connection.css';

const DocumentUploader = ({ label, name, accept, file, onChange, subtext }) => {
  const handleRemove = (e) => {
    e.preventDefault();
    onChange({ target: { name, files: [] } });
  };

  return (
    <div className="conn-form-group full">
      <label className="conn-form-label">{label}</label>
      
      {!file ? (
        <div className="conn-uploader">
          <input 
            type="file" 
            name={name} 
            accept={accept} 
            onChange={onChange}
            aria-label={`Upload ${label}`}
          />
          <div className="conn-uploader-content">
            <UploadCloud size={32} className="conn-uploader-icon" />
            <span className="conn-uploader-text">Click to upload or drag and drop</span>
            {subtext && <span className="conn-uploader-sub">{subtext}</span>}
          </div>
        </div>
      ) : (
        <div className="conn-file-item">
          <div className="conn-file-info">
            <File size={20} className="conn-uploader-icon" />
            <span>{file.name}</span>
            <CheckCircle size={16} color="#16A34A" />
          </div>
          <button type="button" className="conn-file-remove" onClick={handleRemove} aria-label={`Remove ${file.name}`}>
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
