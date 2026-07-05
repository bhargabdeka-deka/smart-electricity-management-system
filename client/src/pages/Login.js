import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { AuthLayout, AuthHeader } from '../components/Auth';
import { NotificationBanner, LoadingButton } from '../components/Common';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Hide error banner automatically when user edits the form
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Inline validation
    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/users/login', formData);
      const data = res.data;

      const userPayload = {
        token: data.token,
        name: data.name,
        email: data.email,
        role: data.role,
        meterNumber: data.meterNumber,
        phoneNumber: data.phoneNumber,
        district: data.district
      };

      localStorage.setItem('user', JSON.stringify(userPayload));

      // Redirect immediately based on role
      const role = data.role;
      if (role === 'admin' || role === 'superadmin') {
        window.location.href = '/admin';
      } else if (role === 'user') {
        window.location.href = '/homepage';
      } else if (role === 'engineer') {
        window.location.href = '/engineer';
      } else {
        window.location.href = '/login';
      }

    } catch (err) {
      // Professional inline validation instead of technical backend errors
      setError('Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader 
        title="Welcome Back" 
        subtitle="Sign in to manage your electricity services securely."
      />
      
      <NotificationBanner type="error" message={error} />
      
      <form onSubmit={handleLogin}>
        <div className="auth-form-group">
          <label className="label" htmlFor="email">
            <span className="label-text">Email Address</span>
          </label>
          <div className="auth-form-input-wrapper">
            <div className="auth-form-icon"><Mail size={18} /></div>
            <input 
              id="email"
              type="email" 
              name="email"
              className="auth-form-input" 
              style={{ paddingLeft: '3rem' }}
              placeholder="Enter your email address"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="auth-form-group">
          <label className="label" htmlFor="password">
            <span className="label-text">Password</span>
          </label>
          <div className="auth-form-input-wrapper">
            <div className="auth-form-icon"><Lock size={18} /></div>
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              name="password"
              className="auth-form-input" 
              style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="auth-form-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="auth-options">
          <label className="auth-checkbox-label">
            <input type="checkbox" /> Remember Me
          </label>
          <span className="auth-forgot-link" style={{ color: '#9CA3AF', cursor: 'not-allowed' }}>Forgot Password? (Coming Soon)</span>
        </div>

        <LoadingButton 
          isLoading={loading}
          loadingText="Signing In..."
          type="submit"
          className="auth-btn-submit"
          disabled={loading}
        >
          Log In
        </LoadingButton>
      </form>

      <div className="auth-footer-text">
        Don’t have an account? <span className="auth-footer-link" onClick={() => navigate('/signup')} role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && navigate('/signup')}>Create Account</span>
      </div>
    </AuthLayout>
  );
}

export default Login;