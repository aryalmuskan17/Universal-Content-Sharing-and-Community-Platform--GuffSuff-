// src/components/SubscribeButton.jsx (Updated for Public Interaction and Dark Mode)

import React, { useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext'; // CHANGE: Import ThemeContext
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SubscribeButton = ({ publisherId }) => {
  const { t } = useTranslation();
  const { user, token, updateUserContext } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext
  const navigate = useNavigate();

  if (user && (user.role !== 'Reader' || user._id === publisherId)) {
    return null;
  }
  
  const isSubscribed = user?.subscriptions?.includes(publisherId);

  const handleSubscribe = async (e) => {
    e.stopPropagation(); 
    try {
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const res = await axios.put(`http://localhost:5001/api/auth/profile/subscribe/${publisherId}`, {}, config);
      toast.success(res.data.message);
      updateUserContext({ subscriptions: res.data.subscriptions });
    } catch (err) {
      toast.error(err.response?.data?.error || t('subscriptionFailed'));
    }
  };

  const handleUnsubscribe = async (e) => {
    e.stopPropagation();
    try {
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const res = await axios.put(`http://localhost:5001/api/auth/profile/unsubscribe/${publisherId}`, {}, config);
      toast.success(res.data.message);
      updateUserContext({ subscriptions: res.data.subscriptions });
    } catch (err) {
      toast.error(err.response?.data?.error || t('unsubscriptionFailed'));
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please log in to subscribe.');
      navigate('/login');
      return;
    }
    if (isSubscribed) {
      handleUnsubscribe(e);
    } else {
      handleSubscribe(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        py-2 px-4 rounded-full font-medium text-sm transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          isSubscribed
            // CHANGE: Add dark mode styles to the subscribed state
            ? 'bg-transparent border border-gray-400 text-gray-600 hover:bg-gray-100 focus:ring-gray-300 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-gray-600'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
        }
      `}
    >
      {isSubscribed ? t('unsubscribe') : t('subscribe')}
    </button>
  );
};

export default SubscribeButton;