// client/src/pages/Register.jsx (Final Corrected Version with Dark Mode)

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext'; // CHANGE: Import ThemeContext
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const { t } = useTranslation();
  const { login } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Publisher',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/auth/register', formData);
      login(res.data.token, res.data.user);
      toast.success(res.data.message);
      
      setTimeout(() => {
        navigate('/');
      }, 0);
    } catch (err) {
      toast.error(err.response?.data?.error || t('registrationFailed'));
    }
  };

  return (
    // CHANGE: Add dark mode classes to the background container
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-800 transition-colors duration-300">
      {/* CHANGE: Add dark mode classes to the form container */}
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg dark:bg-gray-900 dark:shadow-none">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 dark:text-gray-100">{t('register')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {/* CHANGE: Add dark mode classes to labels and inputs */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              autoComplete="username"
            />
          </div>
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