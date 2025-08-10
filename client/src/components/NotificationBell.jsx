// client/src/components/NotificationBell.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

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
      setUnreadCount(unreadCount - 1);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return (
    <div className="notification-container">
      <button>
        <span role="img" aria-label="notifications">🔔</span>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      <ul className="notification-dropdown">
        {notifications.length === 0 ? (
          <li>No new notifications</li>
        ) : (
          notifications.map(n => (
            <li key={n._id} className={n.isRead ? 'read' : 'unread'}>
              {/* This is the key change: we now use n.publisher.username */}
              <p>
                **{n.publisher.username}** has published a new article: "**{n.article?.title || 'Untitled'}**"
              </p>
              {!n.isRead && (
                <button onClick={() => markAsRead(n._id)}>Mark as Read</button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NotificationBell;