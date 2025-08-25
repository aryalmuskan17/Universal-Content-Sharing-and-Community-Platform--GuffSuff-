// client/src/pages/Register.jsx 

import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../assets/logo.png';

// This component handles user registration, supporting both standard email/password sign-up and Google OAuth.
const Register = () => {
  const { t } = useTranslation();
  const { login } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  // `useSearchParams` is used to read data passed in the URL's query string (e.g., from a Google OAuth redirect).
  const [searchParams] = useSearchParams();

  // State to manage the form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Publisher',
  });

  // State to store the Google ID if the user is redirected from Google OAuth
  const [googleId, setGoogleId] = useState(null);

  // Effect hook to check the URL for Google user data on component load.
  useEffect(() => {
    const googleIdFromUrl = searchParams.get("googleId");
    const usernameFromUrl = searchParams.get("username");
    const emailFromUrl = searchParams.get("email");

    // If Google user data is found, pre-populate the form and set the googleId state.
    if (googleIdFromUrl && usernameFromUrl && emailFromUrl) {
      setGoogleId(googleIdFromUrl);
      setFormData(prevFormData => ({
        ...prevFormData,
        username: usernameFromUrl,
        email: emailFromUrl,
      }));
    }
  }, [searchParams]);

  // General handler for form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that the passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }

    try {
      // The request body includes the googleId if it exists, allowing for a combined registration process.
      const body = { 
        username: formData.username, 
        email: formData.email,
        password: formData.password, 
        role: formData.role,
        googleId: googleId
      };
      
      const res = await axios.post('http://localhost:5001/api/auth/register', body);
      
      // Call the `login` function from context to save the token and user data
      login(res.data.token, res.data.user);
      toast.success(res.data.message);
      
      // Redirect to the homepage after a successful registration
      setTimeout(() => {
        navigate('/');
      }, 0);
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('registrationFailed');
      toast.error(errorMessage);
    }
  };
  
  // NEW: Function to initiate the Google OAuth process by redirecting the user to the backend endpoint.
  const handleGoogleRegister = () => {
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-800 transition-colors duration-300">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg dark:bg-gray-900 dark:shadow-none">
        
        {/* Logo and Name Section */}
        <div className="flex flex-col items-center justify-center mb-6">
          <img 
            src={Logo} 
            alt="Logo" 
            className="h-16 w-16 mb-2"
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            GuffSuff
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username field, disabled if pre-populated from Google */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300" htmlFor="username">
              {t('username')}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={!!googleId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              autoComplete="username"
            />
          </div>
          {/* Email field, also disabled if pre-populated from Google */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300" htmlFor="email">
              {t('email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={!!googleId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              autoComplete="email"
            />
          </div>
          {/* Password field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300" htmlFor="password">
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              autoComplete="new-password"
            />
          </div>
          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300" htmlFor="confirmPassword">
              {t('confirmPassword')}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              autoComplete="new-password"
            />
          </div>

          {/* User Role radio buttons */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">
              {t('userRole')}
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="Publisher"
                  checked={formData.role === 'Publisher'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">{t('publisher')}</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="Reader"
                  checked={formData.role === 'Reader'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">{t('reader')}</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-white font-bold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('register')}
          </button>
        </form>

        {/* Separator for social login section */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400">
            {t('orRegisterWith')}
          </span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        </div>

        {/* Google Register Button */}
        <button 
          onClick={handleGoogleRegister}
          className="w-full py-3 px-4 flex items-center justify-center space-x-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg" alt="Google" className="h-6 w-6" />
          <span>{t('registerWithGoogle')}</span>
        </button>

        {/* Link to Login Page */}
        <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
          {t('alreadyHaveAccount')}
          <Link to="/login" className="text-indigo-600 hover:underline ml-1">
            {t('loginHere')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;