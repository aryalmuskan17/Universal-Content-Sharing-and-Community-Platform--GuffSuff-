// client/src/components/NotificationBell.jsx

import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext'; // CHANGE: Import ThemeContext

// This component handles displaying and managing user notifications
const NotificationBell = () => {
  const { t } = useTranslation();
  // State to hold the list of notifications
  const [notifications, setNotifications] = useState([]);
  // State to track the number of unread notifications
  const [unreadCount, setUnreadCount] = useState(0);
  // State to control the visibility of the dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Ref to detect clicks outside the dropdown
  const dropdownRef = useRef(null);
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext

  // Effect to fetch notifications on component mount and set a refresh interval
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Fetch every minute
    return () => clearInterval(interval); // Clean up the interval on unmount
  }, []);

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Function to fetch notifications from the API
  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await axios.get('http://localhost:5001/api/notifications', {
        headers: {
          'x-auth-token': token,
        },
      });
      setNotifications(response.data.data);
      // Count the number of unread notifications
      const unread = response.data.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Function to mark a specific notification as read
  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.patch(`http://localhost:5001/api/notifications/${id}/read`, {}, {
        headers: {
          'x-auth-token': token,
        },
      });
      // Update the local state to reflect the change
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      // Decrement the unread count
      setUnreadCount(prevCount => prevCount - 1);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Function to toggle the dropdown's visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  // Helper function to determine the correct link for a notification
  const getNotificationLink = (notification) => {
    // The link is now a separate field in the notification object
    if (notification.link) {
      return notification.link;
    }
    
    const articleId = notification.article ? notification.article._id : null;
    
    // Return a link based on the notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'share':
      case 'publish':
      case 'reject':
      case 'new_article':
        return articleId ? `/article/${articleId}` : '#';
      case 'review':
        return articleId ? `/article/${articleId}` : '/admin-dashboard';
      case 'donation': // NEW: Add the donation case
        // The link for donations is already saved in the database,
        // so we return it directly.
        return notification.link || '#';
      default:
        return '#';
    }
  };

  // Component JSX
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell icon button */}
      <button 
        onClick={toggleDropdown} 
        className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
      >
        <FaBell className="h-6 w-6" />
        {/* Unread count badge, shown only if count > 0 */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications dropdown menu, shown only if isDropdownOpen is true */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto dark:bg-gray-900 dark:shadow-2xl">
          {/* Dropdown header */}
          <div className="px-4 py-3 border-b border-gray-200 text-lg font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-100">
            {t('notifications')}
          </div>
          {/* Notifications list */}
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.length === 0 ? (
              // Display a message if there are no notifications
              <li className="p-4 text-center text-gray-500 dark:text-gray-400">
                {t('noNewNotifications')}
              </li>
            ) : (
              // Map through the notifications and render each one
              notifications.map(n => (
                <li key={n._id} className={`p-4 transition-colors ${n.isRead ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}>
                  <Link 
                    to={getNotificationLink(n)}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n._id);
                      setIsDropdownOpen(false); // Close dropdown on click
                    }}
                    className="block"
                  >
                    <p className={`text-sm ${n.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 font-medium dark:text-gray-100'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </p>
                  </Link>
                  {/* "Mark as Read" button for unread notifications */}
                  {!n.isRead && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                      className="mt-2 text-xs text-indigo-500 hover:underline focus:outline-none dark:text-indigo-400"
                    >
                      {t('markAsRead')}
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;