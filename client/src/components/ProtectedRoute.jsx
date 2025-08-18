// client/src/components/ProtectedRoute.jsx (Final Corrected Version with Dark Mode)

import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext'; // CHANGE: Import ThemeContext
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, user } = useContext(UserContext);
  const { t } = useTranslation();
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext

  useEffect(() => {
    console.log("ProtectedRoute - User data:", user);
    console.log("ProtectedRoute - Is Authenticated:", isAuthenticated);
  }, [user, isAuthenticated]);

  if (!isAuthenticated) {
    console.log("User not authenticated. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    console.log(`Access denied. User role: ${user?.role}. Required roles: ${requiredRoles.join(', ')}.`);
    return (
      // CHANGE: Add dark mode classes to the outer container
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-black transition-colors duration-300">
        {/* CHANGE: Add dark mode classes to the inner card */}
        <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md dark:bg-gray-900">
          {/* CHANGE: No need to change red color, but add dark text color for contrast */}
          <h1 className="text-4xl font-bold text-red-500 mb-4">{t('accessDenied')}</h1>
          {/* CHANGE: Add dark mode text color */}
          <p className="text-gray-600 text-lg dark:text-gray-300">
            {t('accessDeniedMessage')}
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;