// client/src/context/UserContext.jsx (Final Corrected Version)

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    // Read from localStorage on initial load
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return {
      token: token || null,
      user: user ? JSON.parse(user) : null
    };
  });

  const isAuthenticated = !!auth.user;

  // Use useEffect to set up the default axios header and verify token on initial load
  useEffect(() => {
    if (auth.token) {
      axios.defaults.headers.common['x-auth-token'] = auth.token;
      // This part ensures the token is still valid.
      // If it fails, the user will be logged out.
      const fetchUserProfile = async () => {
        try {
          const res = await axios.get('http://localhost:5001/api/auth/profile');
          // This prevents an empty user from being set if localStorage had a valid token but no user data
          setAuth(prevAuth => ({ ...prevAuth, user: res.data }));
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          logout();
        }
      };
      fetchUserProfile();
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, []); // Empty dependency array means this runs only once on mount

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    axios.defaults.headers.common['x-auth-token'] = newToken;
    setAuth({ token: newToken, user: newUser });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['x-auth-token'];
    setAuth({ token: null, user: null });
  };

  const updateUserContext = (updates) => {
    setAuth(prevAuth => ({ ...prevAuth, user: { ...prevAuth.user, ...updates } }));
    // Update local storage to persist the user data changes
    localStorage.setItem('user', JSON.stringify({ ...auth.user, ...updates }));
  };

  return (
    <UserContext.Provider value={{ token: auth.token, user: auth.user, isAuthenticated, login, logout, updateUserContext }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };