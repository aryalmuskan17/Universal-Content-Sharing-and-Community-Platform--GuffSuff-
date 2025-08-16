// src/components/SubscribeButton.jsx (Updated for Public Interaction)

import React, { useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // NEW: Import useNavigate

const SubscribeButton = ({ publisherId }) => {
  const { t } = useTranslation();
  const { user, token, updateUserContext } = useContext(UserContext);
  const navigate = useNavigate(); // NEW: Initialize useNavigate

  // UPDATED: Now only hide the button if it's the publisher themselves or not a reader
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

  // NEW: A common handler to check for user authentication before proceeding
  const handleClick = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please log in to subscribe.');
      navigate('/login');
      return;
    }
    // If the user is logged in, call the appropriate handler
    if (isSubscribed) {
      handleUnsubscribe(e);
    } else {
      handleSubscribe(e);
    }
  };

  return (
    <button
      // UPDATED: Use the new handleClick handler
      onClick={handleClick}
      className={`
        py-2 px-4 rounded-full font-medium text-sm transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          isSubscribed
            ? 'bg-transparent border border-gray-400 text-gray-600 hover:bg-gray-100 focus:ring-gray-300'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
        }
      `}
    >
      {isSubscribed ? t('unsubscribe') : t('subscribe')}
    </button>
  );
};

export default SubscribeButton;