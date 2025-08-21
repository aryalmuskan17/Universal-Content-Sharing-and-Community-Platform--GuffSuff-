// client/src/context/UserContext.jsx (Final Corrected Version)

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    // Read from localStorage on initial load
    const token = localStorage.getItem('token');
    return {
      token: token || null,
      user: null // User will be fetched in useEffect
    };
  });

  const isAuthenticated = !!auth.token;

  // This function logs the user in and updates state and localStorage
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setAuth(prevAuth => ({ ...prevAuth, token: newToken }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['x-auth-token'];
    setAuth({ token: null, user: null });
  };

  const updateUserContext = (updates) => {
    setAuth(prevAuth => {
        const newUser = { ...prevAuth.user, ...updates };
        localStorage.setItem('user', JSON.stringify(newUser));
        return { ...prevAuth, user: newUser };
    });
  };

  // CORRECTED: useEffect now runs whenever the token state changes
  useEffect(() => {
    if (auth.token) {
      axios.defaults.headers.common['x-auth-token'] = auth.token;
      
      const fetchUserProfile = async () => {
        try {
          const res = await axios.get('http://localhost:5001/api/auth/profile');
          setAuth(prevAuth => ({ ...prevAuth, user: res.data }));
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          logout();
        }
      };
      
      // Check for a user in localStorage first to prevent a brief blank state
      const userFromLocalStorage = localStorage.getItem('user');
      if (userFromLocalStorage) {
          setAuth(prevAuth => ({ ...prevAuth, user: JSON.parse(userFromLocalStorage) }));
      }
      
      fetchUserProfile();
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [auth.token]); // <-- CRITICAL FIX: The dependency array now watches 'auth.token'

  return (
    <UserContext.Provider value={{ token: auth.token, user: auth.user, isAuthenticated, login, logout, updateUserContext }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };