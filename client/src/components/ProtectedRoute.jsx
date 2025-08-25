// client/src/components/ProtectedRoute.jsx

import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext'; // CHANGE: Import ThemeContext
import { useTranslation } from 'react-i18next';

// This is a component that acts as a guard for routes
// It checks if a user is authenticated and has the required role(s)
const ProtectedRoute = ({ children, requiredRoles }) => {
  // Access authentication status and user data from the UserContext
  const { isAuthenticated, user } = useContext(UserContext);
  const { t } = useTranslation();
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext

  // Effect hook for logging user and authentication status for debugging purposes
  useEffect(() => {
    console.log("ProtectedRoute - User data:", user);
    console.log("ProtectedRoute - Is Authenticated:", isAuthenticated);
  }, [user, isAuthenticated]);

  // First check: If the user is not authenticated, redirect them to the login page
  if (!isAuthenticated) {
    console.log("User not authenticated. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  // Second check: If requiredRoles are specified, verify if the user's role is included
  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    console.log(`Access denied. User role: ${user?.role}. Required roles: ${requiredRoles.join(', ')}.`);
    
    // Render an access denied message if the role is not authorized
    return (
      // Container with dark mode styles
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-black transition-colors duration-300">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md dark:bg-gray-900">
          <h1 className="text-4xl font-bold text-red-500 mb-4">{t('accessDenied')}</h1>
          <p className="text-gray-600 text-lg dark:text-gray-300">
            {t('accessDeniedMessage')}
          </p>
        </div>
      </div>
    );
  }

  // If all checks pass, render the child components (the actual protected page)
  return children;
};

export default ProtectedRoute;