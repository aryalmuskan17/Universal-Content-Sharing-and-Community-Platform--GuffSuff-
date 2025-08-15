// src/Login.jsx (Styled Version)

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './context/UserContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
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

      login(token, user);
      toast.success(t('loginSuccess'));

      setTimeout(() => {
        navigate('/');
      }, 0);

    } catch (err) {
      console.error('Login failed:', err.response?.data || err);
      toast.error(err.response?.data?.error || t('loginFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">{t('login')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 text-white font-bold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('login')}
          </button>
        </form>
        <div className="mt-6 text-center text-gray-600">
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