// client/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';

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
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import LoginSuccess from './pages/LoginSuccess.jsx';
import MySubscriptions from './pages/MySubscriptions.jsx';

// NEW: Import the MySubscribers component
import MySubscribers from './pages/MySubscribers.jsx';


function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes without Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login-success" element={<LoginSuccess />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />

            {/* Public and Protected Routes that share the common Layout */}
            <Route element={<Layout />}>
              {/* Public Routes with Layout */}
              <Route path="/" element={<ArticleList />} />
              <Route path="article/:articleId" element={<SingleArticle />} />
              
              {/* Protected Routes with Layout (all wrapped by ProtectedRoute) */}
              <Route 
                path="profile" 
                element={<ProtectedRoute requiredRoles={['Reader', 'Publisher', 'Admin']}><Profile /></ProtectedRoute>} 
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
              <Route 
                path="my-subscriptions" 
                element={<ProtectedRoute requiredRoles={['Reader']}><MySubscriptions /></ProtectedRoute>} 
              />

              {/* NEW: Add the MySubscribers route for Publishers and Admins */}
              <Route 
                path="my-subscribers" 
                element={<ProtectedRoute requiredRoles={['Publisher', 'Admin']}><MySubscribers /></ProtectedRoute>} 
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
          <ToastContainer position="bottom-right" />
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;