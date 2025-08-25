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


// The main component of the application. It sets up the global context providers and defines all application routes.
function App() {
  return (
    // ThemeProvider wraps the entire app, providing dark/light mode context
    <ThemeProvider>
      {/* UserProvider provides global user authentication state */}
      <UserProvider>
        <div className="min-h-screen">
          {/* Routes component acts as a container for all route definitions */}
          <Routes>
            {/* Public Routes without a common layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login-success" element={<LoginSuccess />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />

            {/* A nested route structure to apply a common Layout to multiple pages */}
            <Route element={<Layout />}>
              {/* Public Routes that share the common Layout */}
              <Route path="/" element={<ArticleList />} />
              <Route path="article/:articleId" element={<SingleArticle />} />
              
              {/* Protected Routes. The `ProtectedRoute` component enforces access control based on user roles. */}
              
              {/* Routes accessible to all authenticated users (Reader, Publisher, Admin) */}
              <Route 
                path="profile" 
                element={<ProtectedRoute requiredRoles={['Reader', 'Publisher', 'Admin']}><Profile /></ProtectedRoute>} 
              />
              
              {/* Routes accessible to Publishers and Admins */}
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
                path="my-subscribers" 
                element={<ProtectedRoute requiredRoles={['Publisher', 'Admin']}><MySubscribers /></ProtectedRoute>} 
              />
              
              {/* Routes accessible only to Readers */}
              <Route 
                path="my-subscriptions" 
                element={<ProtectedRoute requiredRoles={['Reader']}><MySubscriptions /></ProtectedRoute>} 
              />

              {/* Admin-only Routes */}
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
            
            {/* A catch-all route for any undefined paths */}
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
          {/* ToastContainer for displaying toast notifications */}
          <ToastContainer position="bottom-right" />
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;