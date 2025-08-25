// client/src/context/UserContext.jsx (Final Corrected Version)

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create a new Context. This will hold the authentication state.
const UserContext = createContext();

// This component provides the authentication state and functions to its children.
const UserProvider = ({ children }) => {
  // State to hold the authentication token and user data.
  // It is initialized by checking for a token in local storage to persist the session.
  const [auth, setAuth] = useState(() => {
    // Read from localStorage on initial load
    const token = localStorage.getItem('token');
    return {
      token: token || null,
      user: null // User will be fetched in useEffect based on the token
    };
  });

  // A derived state that checks if a token exists, indicating authentication.
  const isAuthenticated = !!auth.token;

  // Function to log the user in by saving the token and updating state.
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setAuth(prevAuth => ({ ...prevAuth, token: newToken }));
  };

  // Function to log the user out by clearing the token and user data from state and storage.
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['x-auth-token'];
    setAuth({ token: null, user: null });
  };

  // Function to update the user object in the context, used for profile updates etc.
  const updateUserContext = (updates) => {
    setAuth(prevAuth => {
        // Merge old user data with new updates
        const newUser = { ...prevAuth.user, ...updates };
        // Persist the updated user data in local storage
        localStorage.setItem('user', JSON.stringify(newUser));
        return { ...prevAuth, user: newUser };
    });
  };

  // Effect hook to manage side effects related to authentication state changes.
  // It fetches the user's profile and sets the default axios header.
  useEffect(() => {
    // Check if a token exists
    if (auth.token) {
      // Set the token as a default header for all subsequent API requests
      axios.defaults.headers.common['x-auth-token'] = auth.token;
      
      const fetchUserProfile = async () => {
        try {
          const res = await axios.get('http://localhost:5001/api/auth/profile');
          setAuth(prevAuth => ({ ...prevAuth, user: res.data }));
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          // If the profile fetch fails (e.g., token is invalid), log the user out
          logout();
        }
      };
      
      // OPTIMIZATION: Check for a cached user object in localStorage first
      // This prevents a brief "loading" or empty state on page refresh
      const userFromLocalStorage = localStorage.getItem('user');
      if (userFromLocalStorage) {
          setAuth(prevAuth => ({ ...prevAuth, user: JSON.parse(userFromLocalStorage) }));
      }
      
      // Always fetch the latest user profile to ensure data is up-to-date
      fetchUserProfile();
    } else {
      // If no token exists, remove the default header
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [auth.token]); // CRITICAL FIX: The effect depends on auth.token, so it runs whenever the token changes.

  // The Provider makes the entire authentication state and functions available to the app
  return (
    <UserContext.Provider value={{ token: auth.token, user: auth.user, isAuthenticated, login, logout, updateUserContext }}>
      {children}
    </UserContext.Provider>
  );
};

// Export the Context and the Provider for use in the application
export { UserContext, UserProvider };