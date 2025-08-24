// src/components/Layout.jsx (Updated with My Subscribers button)

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import { Outlet, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell.jsx';

import logo from '../assets/logo.png'; 

const Layout = () => {
    const { logout, user } = useContext(UserContext);
    const { t, i18n } = useTranslation();
    const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
    const navigate = useNavigate();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const handleLogout = () => {
      logout();
      navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-100 dark:bg-black dark:text-gray-100 transition-colors duration-300">
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
                    <div className="flex space-x-2 mb-2 md:mb-0">
                        <button onClick={() => changeLanguage('en')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${i18n.language === 'en' ? 'bg-indigo-600 text-white dark:bg-indigo-400' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'}`}>EN</button>
                        <button onClick={() => changeLanguage('ne')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${i18n.language === 'ne' ? 'bg-indigo-600 text-white dark:bg-indigo-400' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'}`}>NE</button>
                    </div>

                    <div className="flex flex-wrap items-center space-x-1 md:space-x-4">
                        <button onClick={() => navigate('/')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('articles')}</button>
                        
                        {user && (user.role === 'Publisher' || user.role === 'Admin') && (
                            <>
                                <button onClick={() => navigate('/create-article')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('createArticle')}</button>
                                <button onClick={() => navigate('/publisher-analytics')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Analytics</button>
                            </>
                        )}

                        {user && user.role === 'Publisher' && (
                                 <button onClick={() => navigate('/my-subscribers')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Subscribers</button>
                        )}
                        
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

                {/* Conditionally render based on user authentication */}
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                    {user ? (
                        <>
                            <NotificationBell />
                            <button onClick={() => navigate('/profile')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                {t('profile')}
                            </button>
                            {/* UPDATED: Conditionally render the My Subscriptions button only for Readers */}
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

            <main className="flex-1 container mx-auto p-4 mt-4 bg-white dark:bg-black rounded-lg shadow-md transition-colors duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;