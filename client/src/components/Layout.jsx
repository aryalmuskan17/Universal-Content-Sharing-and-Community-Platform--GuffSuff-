// src/components/Layout.jsx

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import { Outlet, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell.jsx';

import logo from '../assets/logo.png'; 

// This component provides the overall page layout including the navigation bar
const Layout = () => {
    // Access user state and logout function from UserContext
    const { logout, user } = useContext(UserContext);
    // Access translation function and i18n instance from useTranslation hook
    const { t, i18n } = useTranslation();
    // Access dark mode state and toggle function from ThemeContext
    const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
    // Hook for programmatic navigation
    const navigate = useNavigate();

    // Handler to change the application's language
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    // Handler to log out the user and navigate to the home page
    const handleLogout = () => {
      logout();
      navigate('/');
    };

    // --- Component JSX ---

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-100 dark:bg-black dark:text-gray-100 transition-colors duration-300">
            {/* Main navigation bar */}
            <nav className="bg-white text-gray-800 shadow-md p-4 flex flex-col md:flex-row items-center justify-between sticky top-0 z-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
                {/* Logo and App Title */}
                <span className="flex items-center cursor-pointer mb-2 mr-4 md:mb-0" onClick={() => navigate('/')}>
                    <img src={logo} alt="GuffSuff Logo" className="h-8 w-auto mr-2" />
                    <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                        Guff Suff
                    </span>
                </span>

                {/* Language Switcher and Primary Nav Buttons */}
                <div className="flex flex-col md:flex-row items-center md:space-x-4 mb-2 md:mb-0">
                    {/* Language selection buttons */}
                    <div className="flex space-x-2 mb-2 md:mb-0">
                        <button onClick={() => changeLanguage('en')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${i18n.language === 'en' ? 'bg-indigo-600 text-white dark:bg-indigo-400' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'}`}>EN</button>
                        <button onClick={() => changeLanguage('ne')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${i18n.language === 'ne' ? 'bg-indigo-600 text-white dark:bg-indigo-400' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'}`}>NE</button>
                    </div>

                    {/* Navigation buttons for different user roles */}
                    <div className="flex flex-wrap items-center space-x-1 md:space-x-4">
                        <button onClick={() => navigate('/')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('articles')}</button>
                        
                        {/* Buttons visible to both Publishers and Admins */}
                        {user && (user.role === 'Publisher' || user.role === 'Admin') && (
                            <>
                                <button onClick={() => navigate('/create-article')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('createArticle')}</button>
                                <button onClick={() => navigate('/publisher-analytics')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Analytics</button>
                            </>
                        )}

                        {/* Button visible only to Publishers */}
                        {user && user.role === 'Publisher' && (
                                 <button onClick={() => navigate('/my-subscribers')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Subscribers</button>
                        )}
                        
                        {/* Buttons visible only to Admins */}
                        {user?.role === 'Admin' && (
                            <>
                                <button onClick={() => navigate('/admin-dashboard')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('adminDashboard')}</button>
                                <button onClick={() => navigate('/full-admin-dashboard')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Full CMS Dashboard</button>
                                <button onClick={() => navigate('/analytics-dashboard')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Admin Analytics</button>
                                <button onClick={() => navigate('/user-management')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Manage Users</button>
                            </>
                        )}
                    </div>
                </div>

                {/* Dark Mode Toggle Button */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                    aria-label="Toggle Dark Mode"
                >
                    {isDarkMode ? (
                      <FaSun className="text-yellow-400 text-xl" />
                    ) : (
                      <FaMoon className="text-gray-700 text-xl" />
                    )}
                </button>

                {/* Buttons for logged-in vs. logged-out users */}
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                    {user ? (
                        // Render these buttons if a user is logged in
                        <>
                            <NotificationBell />
                            <button onClick={() => navigate('/profile')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                {t('profile')}
                            </button>
                            {/* Conditionally render My Subscriptions button only for Readers */}
                            {user.role === 'Reader' && (
                                <button onClick={() => navigate('/my-subscriptions')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    My Subscriptions
                                </button>
                            )}
                            <span className="text-sm font-medium hidden md:block">
                                {t('welcome')} {user?.username}!
                            </span>
                            <button onClick={handleLogout} className="px-4 py-1 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors">
                                {t('logout')}
                            </button>
                        </>
                    ) : (
                        // Render these buttons if no user is logged in
                        <>
                            <button onClick={() => navigate('/login')} className="px-4 py-1 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
                                {t('login')}
                            </button>
                            <button onClick={() => navigate('/register')} className="px-4 py-1 text-sm font-semibold text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-100 transition-colors">
                                {t('register')}
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {/* Main content area where nested routes are rendered */}
            <main className="flex-1 container mx-auto p-4 mt-4 bg-white dark:bg-black rounded-lg shadow-md transition-colors duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;