import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Lock, Hash } from 'lucide-react';
import { AuthLayout, AuthHeader, FormInput } from '../components/Auth';
import { NotificationBanner, SuccessMessage, LoadingButton } from '../components/Common';

const districtCodes = {
  Jorhat: '717', Kamrup: '701', Dibrugarh: '725', Barpeta: '730', Nalbari: '733', Dhemaji: '740',
  Golaghat: '744', Sonitpur: '752', Karbi_Anglong: '757', Bongaigaon: '762', Cachar: '765',
  Dhubri: '767', Dima_Hasao: '770', Hailakandi: '773', Hojai: '775', Kokrajhar: '778',
  Lakhimpur: '781', Majuli: '784', Morigaon: '787', Nagaon: '790', Sivasagar: '793',
  Tinsukia: '796', Chirang: '799', Baksa: '802', Udalguri: '805', Kamrup_Metro: '808',
  Karimganj: '811', Tamulpur: '814', Biswanath: '817', Bajali: '820', West_Karbi_Anglong: '823',
  South_Salmara: '826', Goalpara: '829', North_Cachar: '832'
};

const districtOptions = Object.keys(districtCodes).map((district) => ({
  value: district,
  label: district.replace(/_/g, ' ')
}));

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    district: '',
    password: '',
    confirmPassword: '',
    meterNumber: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateMeterId = (district) => {
    const prefix = districtCodes[district];
    if (!prefix) return '';
    const randomSuffix = Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0');
    return prefix + randomSuffix;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'district') {
      const meterId = generateMeterId(value);
      setFormData({ ...formData, district: value, meterNumber: meterId });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    setLoading(true);

    try {
      const { confirmPassword, ...payload } = formData;
      await axios.post('http://localhost:5000/api/users/signup', payload);

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information and try again.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader 
        title="Create Your Account" 
        subtitle="Register to access electricity services digitally."
      />
      
      <NotificationBanner type="error" message={error} />
      {success && <SuccessMessage message="Account created successfully. Redirecting to Login..." />}
      
      <form onSubmit={handleSubmit}>
        <div className="auth-section-title">1. Personal Information</div>
        <FormInput
          label="Full Name"
          icon={<User size={18} />}
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Email Address"
          icon={<Mail size={18} />}
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Phone Number"
          icon={<Phone size={18} />}
          type="tel"
          name="phoneNumber"
          placeholder="Enter your 10-digit number"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />

        <div className="auth-section-title">2. Location</div>
        <FormInput
          label="District"
          icon={<MapPin size={18} />}
          name="district"
          placeholder="Select your district"
          options={districtOptions}
          value={formData.district}
          onChange={handleChange}
          required
        />

        <div className="auth-section-title">3. Security</div>
        <FormInput
          label="Password"
          icon={<Lock size={18} />}
          type="password"
          name="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Confirm Password"
          icon={<Lock size={18} />}
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Account Number"
          icon={<Hash size={18} />}
          type="text"
          name="meterNumber"
          placeholder="Auto-generated based on district"
          value={formData.meterNumber}
          readOnly
          helpText="Account Number will be automatically generated after successful registration."
        />

        <LoadingButton 
          type="submit" 
          className="auth-btn-submit" 
          style={{ marginTop: '1rem' }} 
          isLoading={loading}
          loadingText="Creating Account..."
          disabled={success}
        >
          Create Account
        </LoadingButton>
      </form>

      <div className="auth-footer-text">
        Already have an account? <span className="auth-footer-link" onClick={() => navigate('/login')} role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && navigate('/login')}>Log in</span>
      </div>
    </AuthLayout>
  );
}

export default SignUp;