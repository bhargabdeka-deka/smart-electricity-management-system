import React from 'react';

const FormInput = ({ 
  label, 
  icon, 
  type = "text", 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  readOnly = false,
  options = null,
  helpText = null
}) => {
  return (
    <div className="auth-form-group">
      {label && <label>{label}</label>}
      <div className="auth-form-input-wrapper">
        {icon && <div className="auth-form-icon">{icon}</div>}
        
        {options ? (
          <select 
            name={name}
            className="auth-form-input" 
            style={{ paddingLeft: icon ? '3rem' : '1rem' }}
            value={value}
            onChange={onChange}
            required={required}
          >
            <option value="">{placeholder}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            className="auth-form-input"
            style={{ paddingLeft: icon ? '3rem' : '1rem' }}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            readOnly={readOnly}
          />
        )}
      </div>
      {helpText && <div className="auth-form-help">{helpText}</div>}
    </div>
  );
};

export default FormInput;
