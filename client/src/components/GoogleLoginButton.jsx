// client/src/components/GoogleLoginButton.jsx

import React from 'react';
import { FaGoogle } from 'react-icons/fa';

const GoogleLoginButton = () => {
  const handleLogin = () => {
    // Redirect the user to your backend's Google authentication route
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
    >
      <FaGoogle className="w-4 h-4 mr-2" />
      Login with Google
    </button>
  );
};

export default GoogleLoginButton;