// client/src/pages/LoginSuccess.jsx

import React, { useEffect, useContext, useState } from 'react'; // ADDED useState
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const LoginSuccess = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);
  
  // NEW: State to ensure the redirect logic only runs once
  const [hasHandledRedirect, setHasHandledRedirect] = useState(false);

  useEffect(() => {
    // Check the flag to prevent the logic from running a second time
    if (hasHandledRedirect) {
        return; 
    }

    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (token) {
      login(token); 
      console.log('Login successful! Token saved and context updated.');
      
      // Set the flag to true to prevent a double run
      setHasHandledRedirect(true);

      // Redirect after a short delay to ensure state has time to update
      setTimeout(() => {
        navigate('/'); 
      }, 100);

    } else {
      console.error('Login failed: No token found in URL.');
      // If no token is in URL but one is in localStorage, navigate home
      if (localStorage.getItem('token')) {
          navigate('/');
      } else {
          navigate('/login');
      }
    }
  }, [login, navigate, hasHandledRedirect]); // ADDED hasHandledRedirect to dependency array

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Logging you in...</p>
        <div className="flex justify-center">
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