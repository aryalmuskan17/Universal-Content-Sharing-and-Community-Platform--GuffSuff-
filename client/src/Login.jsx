// src/Login.jsx (Final Corrected Version)

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './context/UserContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', {
        username,
        password,
      });

      const { token, user } = res.data;

      // CORRECTED: Call the login function to update the global state
      login(token, user);
      toast.success(t('loginSuccess'));

      // Use a setTimeout with a 0ms delay to give the state update time to process
      // This is a reliable way to ensure the UI re-renders before navigation
      setTimeout(() => {
        navigate('/');
      }, 0);

    } catch (err) {
      console.error('Login failed:', err.response?.data || err);
      toast.error(err.response?.data?.error || t('loginFailed'));
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">{t('login')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {t('login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;