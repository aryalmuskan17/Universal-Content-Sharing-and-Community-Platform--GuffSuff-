// client/src/components/NotificationBell.jsx (Styled Version)

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaBell } from 'react-icons/fa'; // Make sure you have react-icons installed

const NotificationBell = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Fetch every minute
    return () => clearInterval(interval);
  }, []);

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
      const unread = response.data.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.patch(`http://localhost:5001/api/notifications/${id}/read`, {}, {
        headers: {
          'x-auth-token': token,
        },
      });
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prevCount => prevCount - 1);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown} 
        className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-200 text-lg font-semibold text-gray-800">
            {t('notifications')}
          </div>
          <ul className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <li className="p-4 text-center text-gray-500">
                {t('noNewNotifications')}
              </li>
            ) : (
              notifications.map(n => (
                <li key={n._id} className={`p-4 transition-colors ${n.isRead ? 'bg-gray-50' : 'bg-white'}`}>
                  <p className={`text-sm ${n.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                    <strong>{n.publisher?.username || 'System'}</strong> {t('hasPublishedNewArticle')} <strong>{n.article?.title || t('untitled')}</strong>
                  </p>
                  {!n.isRead && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                      className="mt-2 text-xs text-indigo-500 hover:underline focus:outline-none"
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