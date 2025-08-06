// src/context/UserContext.jsx (Final Corrected Version)

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: null
  });

  const isAuthenticated = !!auth.user;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.token) {
        try {
          // CORRECTED: Changed header to 'x-auth-token'
          const config = { headers: { 'x-auth-token': auth.token } };
          const res = await axios.get('http://localhost:5001/api/auth/profile', config);
          setAuth(prevAuth => ({ ...prevAuth, user: res.data }));
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          logout();
        }
      }
    };
    fetchUserProfile();
  }, [auth.token]);

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    setAuth({ token: newToken, user: newUser });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
  };

  const updateUserContext = (updates) => {
    setAuth(prevAuth => ({ ...prevAuth, user: { ...prevAuth.user, ...updates } }));
  };

  return (
    <UserContext.Provider value={{ token: auth.token, user: auth.user, isAuthenticated, login, logout, updateUserContext }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };