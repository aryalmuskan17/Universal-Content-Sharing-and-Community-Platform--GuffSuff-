// client/src/components/ProtectedRoute.jsx (Final Corrected Version)

import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, user } = useContext(UserContext);
  const { t } = useTranslation();

  // New: Log user data to confirm it's being received
  useEffect(() => {
    console.log("ProtectedRoute - User data:", user);
    console.log("ProtectedRoute - Is Authenticated:", isAuthenticated);
  }, [user, isAuthenticated]);

  if (!isAuthenticated) {
    console.log("User not authenticated. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  // Check if the user's role is in the required roles array
  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    console.log(`Access denied. User role: ${user?.role}. Required roles: ${requiredRoles.join(', ')}.`);
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md">
          <h1 className="text-4xl font-bold text-red-500 mb-4">{t('accessDenied')}</h1>
          <p className="text-gray-600 text-lg">
            {t('accessDeniedMessage')}
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;