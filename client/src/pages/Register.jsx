
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const { t } = useTranslation();
  const { login } = useContext(UserContext);
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
      // CORRECTED: The back-end now sends the token and user info on success
      const res = await axios.post('http://localhost:5001/api/auth/register', formData);
      login(res.data.token, res.data.user); // Pass the user info to the context
      toast.success(res.data.message);
    } catch (err) {
      // CORRECTED: Correctly check for the 'error' field in the response
      toast.error(err.response?.data?.error || t('registrationFailed'));
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center">{t('register')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-700 block" htmlFor="username">
              {t('username')}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block" htmlFor="password">
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">
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
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">{t('publisher')}</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="Reader"
                  checked={formData.role === 'Reader'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">{t('reader')}</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-lg font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('register')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;