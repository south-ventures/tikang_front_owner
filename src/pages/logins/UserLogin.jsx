import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../../components/Navbar_login';
import WarningPopup from '../../components/WarningPopup';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { countryList } from '../../assets/utils/countries';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_URL_OWNER;

export default function UserLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, fetchUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    country: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const endpoint = `${API_BASE}/${isSignup ? 'register' : 'login'}`;
    const payload = isSignup
      ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          country: formData.country,
          age: formData.age,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }
      : {
          email: formData.email,
          password: formData.password,
        };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Login failed');

      setSuccess(isSignup ? 'Registration successful!' : 'Login successful!');
      login(data.token);
      await fetchUser();
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <WarningPopup message={error} type="error" onClose={() => setError('')} />}
      {success && <WarningPopup message={success} type="success" onClose={() => setSuccess('')} />}
      <NavBar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center px-4 py-10"
      >
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl flex flex-col md:flex-row w-full max-w-6xl overflow-hidden">
          {/* Left Panel */}
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-blue-600 to-green-500 text-white p-10 w-1/2 space-y-6">
            {isSignup ? (
              <>
                <div>
                  <img src={`${process.env.REACT_APP_API_URL}/uploads/logo/logo.png`}
              alt="Tikang Logo" className="h-20 mb-4" />
                  <h2 className="text-3xl font-bold mb-2 leading-snug">
                    Grow your rental business<br />with Tikang
                  </h2>
                  <p className="text-base leading-relaxed text-white/90">
                    Join our Homeowner Centre and manage your properties, track earnings, and connect with trusted renters across the Philippines.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center text-center h-full">
                <img src={`${process.env.REACT_APP_API_URL}/uploads/logo/logo.png`}
              alt="Tikang Logo" className="h-24 mb-4" />
                <h2 className="text-2xl font-bold">Be a Trusted HOMEOWNER</h2>
                <p className="text-base text-white/90 mt-2 px-2">
                  Manage your bookings and properties efficiently with Tikang Homeowner Centre.
                </p>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-1/2 p-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isSignup ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {isSignup ? 'Sign up to start using Tikang' : 'Login to your Tikang account'}
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" onChange={handleChange} value={formData.password} required className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Confirm Password */}
              {isSignup && (
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              )}

              {/* Additional Signup Fields */}
              {isSignup && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required className="input" />
                    <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required className="input" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} required className="input" />
                    <input type="number" name="age" placeholder="Age" onChange={handleChange} className="input" />
                  </div>
                  <input type="text" name="address" placeholder="Address" onChange={handleChange} required className="input" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" name="city" placeholder="City" onChange={handleChange} required className="input" />
                    <input type="text" name="province" placeholder="Province" onChange={handleChange} required className="input" />
                  </div>
                  <select name="country" onChange={handleChange} required className="input">
                    <option value="">Select Country</option>
                    {countryList.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </>
              )}

              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition duration-200">
                {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              By {isSignup ? 'signing up' : 'logging in'}, I agree to Tikang's <Link to="#" className="text-blue-600 hover:underline">Terms of Use</Link> and <Link to="#" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>

            <p className="text-sm text-gray-600 text-center mt-4">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button type="button" onClick={() => setIsSignup(!isSignup)} className="text-blue-600 font-medium hover:underline">
                {isSignup ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
