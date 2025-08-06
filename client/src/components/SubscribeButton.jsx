// src/components/SubscribeButton.jsx

import React, { useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const SubscribeButton = ({ publisherId }) => {
  const { t } = useTranslation();
  const { user, token, updateUserContext } = useContext(UserContext);

  if (!user || user.role !== 'Reader' || user._id === publisherId) {
    return null; // Don't show the button if not a reader, or if it's the publisher themselves
  }
  
  const isSubscribed = user.subscriptions?.includes(publisherId);

  const handleSubscribe = async () => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };
      const res = await axios.put(`http://localhost:5001/api/auth/profile/subscribe/${publisherId}`, {}, config);
      toast.success(res.data.message);
      updateUserContext({ subscriptions: res.data.subscriptions }); // Update the context with new subscriptions
    } catch (err) {
      toast.error(err.response?.data?.error || t('subscriptionFailed'));
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };
      const res = await axios.put(`http://localhost:5001/api/auth/profile/unsubscribe/${publisherId}`, {}, config);
      toast.success(res.data.message);
      updateUserContext({ subscriptions: res.data.subscriptions }); // Update the context with new subscriptions
    } catch (err) {
      toast.error(err.response?.data?.error || t('unsubscriptionFailed'));
    }
  };

  return (
    <button
      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
      className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors duration-300 ${
        isSubscribed
          ? 'bg-gray-500 text-white hover:bg-gray-600'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {isSubscribed ? t('unsubscribe') : t('subscribe')}
    </button>
  );
};

export default SubscribeButton;