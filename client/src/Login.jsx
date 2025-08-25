// client/src/Login.jsx 

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './context/UserContext';
import { ThemeContext } from './context/ThemeContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// NEW: Import your logo image. Please update the path.
import Logo from './assets/logo.png'; 

// NEW: Import the GoogleLoginButton component
import GoogleLoginButton from './components/GoogleLoginButton'; 

// This component provides the login functionality for the application, supporting both standard username/password and Google OAuth.
const Login = () => {
  const { t } = useTranslation();
  // State for username and password input fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Access the `login` function from the UserContext to manage global authentication state
  const { login } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a POST request to the backend login endpoint
      const res = await axios.post('http://localhost:5001/api/auth/login', {
        username,
        password,
      });

      const { token, user } = res.data;

      // Call the `login` function from context to store the token and user data
      login(token, user);
      // Display a success toast notification
      toast.success(t('loginSuccess'));

      // Redirect the user to the homepage after a short delay
      setTimeout(() => {
        navigate('/');
      }, 0);

    } catch (err) {
      console.error('Login failed:', err.response?.data || err);
      // Display an error toast notification with a specific message from the backend, if available
      toast.error(err.response?.data?.error || t('loginFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-800 transition-colors duration-300">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg dark:bg-gray-900 dark:shadow-none">
        
        {/* NEW: Logo and Name Section for branding */}
        <div className="flex flex-col items-center justify-center mb-6">
          <img 
            src={Logo} 
            alt="Logo" 
            className="h-16 w-16 mb-2" // Adjust size as needed
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            GuffSuff
          </h1>
        </div>

        {/* Login form with username and password fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 text-white font-bold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('login')}
          </button>
        </form>
        
        {/* NEW: Component for Google login, abstracting away the OAuth logic */}
        <div className="mt-4">
          <GoogleLoginButton />
        </div>

        {/* Link to the registration page for new users */}
        <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
          {t('noAccount')}
          <Link to="/register" className="text-indigo-600 hover:underline ml-1">
            {t('registerHere')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;