// client/src/App.jsx (Final Corrected Routing)

import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route } from 'react-router-dom';

// ProtectedRoute component and Layout
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// All pages
import Login from './Login.jsx';
import Register from './pages/Register.jsx';
import ArticleList from './pages/ArticleList.jsx';
import CreateArticle from './pages/CreateArticle.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import FullAdminDashboard from './pages/FullAdminDashboard.jsx';
import AnalyticsDashboard from './pages/AnalyticsDashboard.jsx';
import UserManagement from './components/UserManagement.jsx';
import Profile from './components/Profile.jsx';
import EditArticle from './pages/EditArticle.jsx';
import PublisherAnalytics from './components/PublisherAnalytics.jsx';
import SingleArticle from './pages/SingleArticle.jsx';

function App() {
  return (
    <div className="min-h-screen">
      <ToastContainer position="bottom-right" />
      <Routes>
        {/* Public Routes without Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public and Protected Routes that share the common Layout */}
        <Route element={<Layout />}>
          {/* Public Routes with Layout */}
          <Route path="/" element={<ArticleList />} />
          <Route path="article/:articleId" element={<SingleArticle />} />
          
          {/* Protected Routes with Layout (all wrapped by ProtectedRoute) */}
          <Route 
            path="profile" 
            element={<ProtectedRoute requiredRoles={['User', 'Publisher', 'Admin']}><Profile /></ProtectedRoute>} 
          />
          <Route 
            path="create-article" 
            element={<ProtectedRoute requiredRoles={['Publisher', 'Admin']}><CreateArticle /></ProtectedRoute>} 
          />
          <Route 
            path="publisher-analytics" 
            element={<ProtectedRoute requiredRoles={['Publisher', 'Admin']}><PublisherAnalytics /></ProtectedRoute>} 
          />
          <Route 
            path="edit-article/:articleId" 
            element={<ProtectedRoute requiredRoles={['Publisher', 'Admin']}><EditArticle /></ProtectedRoute>} 
          />
          
          {/* Admin-only Routes with Layout (all wrapped by ProtectedRoute) */}
          <Route 
            path="admin-dashboard" 
            element={<ProtectedRoute requiredRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="full-admin-dashboard" 
            element={<ProtectedRoute requiredRoles={['Admin']}><FullAdminDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="analytics-dashboard" 
            element={<ProtectedRoute requiredRoles={['Admin']}><AnalyticsDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="user-management" 
            element={<ProtectedRoute requiredRoles={['Admin']}><UserManagement /></ProtectedRoute>} 
          />
        </Route>
        
        {/* Fallback for unknown URLs */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;