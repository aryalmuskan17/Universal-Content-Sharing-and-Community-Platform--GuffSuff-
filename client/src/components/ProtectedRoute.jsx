// client/src/components/ProtectedRoute.jsx

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, user } = useContext(UserContext);
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user's role is in the required roles array
  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    return <div>{t('accessDenied')}</div>;
  }

  return children;
};

export default ProtectedRoute;