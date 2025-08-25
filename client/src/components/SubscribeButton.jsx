// src/components/SubscribeButton.jsx 

import React, { useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext'; // CHANGE: Import ThemeContext
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// This component provides a button for readers to subscribe to or unsubscribe from a publisher.
const SubscribeButton = ({ publisherId }) => {
  const { t } = useTranslation();
  // Access user data, authentication token, and the context update function
  const { user, token, updateUserContext } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext
  const navigate = useNavigate();

  // Do not render the button if the user is not a Reader or if they are the publisher themselves
  if (user && (user.role !== 'Reader' || user._id === publisherId)) {
    return null;
  }
  
  // Check if the current user is already subscribed to this publisher
  const isSubscribed = user?.subscriptions?.includes(publisherId);

  // Handler for the subscription action
  const handleSubscribe = async (e) => {
    e.stopPropagation(); 
    try {
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      // API call to subscribe the user to the publisher
      const res = await axios.put(`http://localhost:5001/api/auth/profile/subscribe/${publisherId}`, {}, config);
      toast.success(res.data.message);
      // Update the user context with the new subscriptions list
      updateUserContext({ subscriptions: res.data.subscriptions });
    } catch (err) {
      toast.error(err.response?.data?.error || t('subscriptionFailed'));
    }
  };

  // Handler for the unsubscription action
  const handleUnsubscribe = async (e) => {
    e.stopPropagation();
    try {
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      // API call to unsubscribe the user from the publisher
      const res = await axios.put(`http://localhost:5001/api/auth/profile/unsubscribe/${publisherId}`, {}, config);
      toast.success(res.data.message);
      // Update the user context with the new subscriptions list
      updateUserContext({ subscriptions: res.data.subscriptions });
    } catch (err) {
      toast.error(err.response?.data?.error || t('unsubscriptionFailed'));
    }
  };

  // Main click handler that determines the action based on user state
  const handleClick = (e) => {
    e.stopPropagation();
    if (!user) {
      // Prompt user to log in if they are not authenticated
      toast.info('Please log in to subscribe.');
      navigate('/login');
      return;
    }
    // Call the appropriate handler based on the current subscription status
    if (isSubscribed) {
      handleUnsubscribe(e);
    } else {
      handleSubscribe(e);
    }
  };

  // The button's JSX, with dynamic text and styling
  return (
    <button
      onClick={handleClick}
      className={`
        py-2 px-4 rounded-full font-medium text-sm transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          isSubscribed
            // Styles for the 'Unsubscribe' state
            ? 'bg-transparent border border-gray-400 text-gray-600 hover:bg-gray-100 focus:ring-gray-300 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-gray-600'
            // Styles for the 'Subscribe' state
            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
        }
      `}
    >
      {isSubscribed ? t('unsubscribe') : t('subscribe')}
    </button>
  );
};

export default SubscribeButton;