import React from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-toastify';

const CopyApplicationIdButton = ({ id }) => {
  if (!id) return null;

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(id).then(() => {
      toast.success('Application ID copied successfully.');
    }).catch(() => {
      toast.error('Failed to copy Application ID.');
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCopy(e);
    }
  };

  return (
    <span 
      role="button"
      tabIndex={0}
      onClick={handleCopy}
      onKeyDown={handleKeyDown}
      title="Copy Application ID"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        color: '#6B7280',
        transition: 'all 0.2s ease',
        verticalAlign: 'middle',
        outline: 'none',
        marginLeft: '4px'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.backgroundColor = 'transparent'; }}
      onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #BFDBFE'; }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <Copy size={16} />
    </span>
  );
};

export default CopyApplicationIdButton;
