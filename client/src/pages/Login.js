import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 🚀 Send login request
      const res = await axios.post('http://localhost:5000/api/users/login', formData);
      const data = res.data;

      console.log('🔍 Login response:', data);
      console.log('✅ Role after login:', data.role);

      // 🎒 Construct clean user object
      const userPayload = {
        token: data.token,
        name: data.name,
        email: data.email,
        role: data.role,
        meterNumber: data.meterNumber,
        phoneNumber: data.phoneNumber,
        district: data.district
      };

      // 💾 Store in localStorage
      localStorage.setItem('user', JSON.stringify(userPayload));
      console.log('✅ Stored user in localStorage:', userPayload);

      toast.success('✅ Login successful!', {
        position: 'top-center',
        autoClose: 1800,
        hideProgressBar: false
      });

      // ✅ Role-based redirect with fallback
      setTimeout(() => {
        const role = data.role;
        if (role === 'admin' || role === 'superadmin') {
          window.location.href = '/admin';
        } else if (role === 'user') {
          window.location.href = '/homepage';
        } else if (role === 'engineer') {
          window.location.href = '/engineer';
        } else {
          console.warn('⚠️ Unknown role:', role);
          window.location.href = '/login';
        }
      }, 1800);

    } catch (err) {
      console.error('❌ Login error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Login failed. Try again!', {
        position: 'top-center',
        autoClose: 3000
      });
    }
  };

  return (
    <div className="login-container">
      <h2>🔐 Log In to Your Account</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="📧 Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="🔑 Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Log In</button>
      </form>
      <p>
        Don’t have an account? <span onClick={() => window.location.href = '/signup'}>Sign up here</span>
      </p>
      <ToastContainer />
    </div>
  );
}

export default Login;