// client/src/components/GoogleLoginButton.jsx

import React from 'react';
import { FaGoogle } from 'react-icons/fa'; // Import the Google icon from react-icons library

// This component renders a button to initiate Google login
const GoogleLoginButton = () => {
  // Handles the click event to redirect the user for Google authentication
  const handleLogin = () => {
    // Redirect the user to your backend's Google authentication route
    // This starts the OAuth 2.0 flow
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  return (
    // Button component with styling and the Google icon
    <button
      onClick={handleLogin}
      className="flex items-center justify-center w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
    >
      <FaGoogle className="w-4 h-4 mr-2" /> {/* The Google icon */}
      Login with Google {/* Button text */}
    </button>
  );
};

export default GoogleLoginButton;