// client/src/pages/LoginSuccess.jsx

import React, { useEffect, useContext, useState } from 'react'; // ADDED useState
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

// This component is specifically for handling the OAuth callback after a successful third-party login (e.g., Google).
// It's responsible for extracting the token from the URL, authenticating the user, and redirecting them.
const LoginSuccess = () => {
  const navigate = useNavigate();
  // Access the `login` function from the UserContext to update the application's auth state
  const { login } = useContext(UserContext);
  
  // NEW: A state flag to ensure the redirection logic only runs once per component mount.
  // This prevents issues with React's strict mode causing a double-redirect.
  const [hasHandledRedirect, setHasHandledRedirect] = useState(false);

  // The core logic is contained within a useEffect hook to run once on component mount.
  useEffect(() => {
    // Check the flag to prevent the logic from executing a second time.
    if (hasHandledRedirect) {
        return; 
    }

    // Parse the URL to get query parameters
    const queryParams = new URLSearchParams(window.location.search);
    // Extract the token from the 'token' query parameter
    const token = queryParams.get('token');

    if (token) {
      // If a token is found, call the login function to set the token in state and local storage
      login(token); 
      console.log('Login successful! Token saved and context updated.');
      
      // Set the flag to true to prevent a future re-run of this logic
      setHasHandledRedirect(true);

      // Redirect the user to the home page after a short delay
      // The delay gives the UserContext time to update the state and fetch user details.
      setTimeout(() => {
        navigate('/'); 
      }, 100);

    } else {
      // If no token is found in the URL, log the error and handle the redirect accordingly
      console.error('Login failed: No token found in URL.');
      // If no token is in URL but one is in localStorage, navigate home
      if (localStorage.getItem('token')) {
          navigate('/');
      } else {
          // If no token is found anywhere, redirect to the login page
          navigate('/login');
      }
    }
  }, [login, navigate, hasHandledRedirect]); // The dependency array ensures the effect re-runs only when these values change

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Logging you in...</p>
        <div className="flex justify-center">
          {/* Simple loading spinner to show the user that a process is underway */}
          <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccess;