// src/components/Layout.jsx (Updated with Correct Logout Redirect)

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Outlet, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell.jsx';

// NEW: Import your logo image
import logo from '../assets/logo.png'; 

const Layout = () => {
    const { logout, user } = useContext(UserContext);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    // UPDATED: Now navigates to the public homepage ('/') after logout
    const handleLogout = () => {
      logout();
      navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-100">
            <nav className="bg-white text-gray-800 shadow-md p-4 flex flex-col md:flex-row items-center justify-between sticky top-0 z-50">
                {/* Logo and App Title */}
                <span className="flex items-center cursor-pointer mb-2 mr-4 md:mb-0" onClick={() => navigate('/')}>
                    <img src={logo} alt="GuffSuff Logo" className="h-8 w-auto mr-2" />
                    <span className="text-2xl font-extrabold text-indigo-600">
                        Guff Suff
                    </span>
                </span>

                {/* Language Switcher and Primary Nav Buttons */}
                <div className="flex flex-col md:flex-row items-center md:space-x-4 mb-2 md:mb-0">
                    <div className="flex space-x-2 mb-2 md:mb-0">
                        <button onClick={() => changeLanguage('en')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${i18n.language === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>EN</button>
                        <button onClick={() => changeLanguage('ne')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${i18n.language === 'ne' ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>NE</button>
                    </div>

                    <div className="flex flex-wrap items-center space-x-1 md:space-x-4">
                        <button onClick={() => navigate('/')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">{t('articles')}</button>
                        
                        {user && (user.role === 'Publisher' || user.role === 'Admin') && (
                            <>
                                <button onClick={() => navigate('/create-article')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">{t('createArticle')}</button>
                                <button onClick={() => navigate('/publisher-analytics')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">Analytics</button>
                            </>
                        )}
                        
                        {user?.role === 'Admin' && (
                            <>
                                <button onClick={() => navigate('/admin-dashboard')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">{t('adminDashboard')}</button>
                                <button onClick={() => navigate('/full-admin-dashboard')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">Full CMS Dashboard</button>
                                <button onClick={() => navigate('/analytics-dashboard')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">Admin Analytics</button>
                                <button onClick={() => navigate('/user-management')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">Manage Users</button>
                            </>
                        )}
                    </div>
                </div>

                {/* UPDATED: Conditionally render based on user authentication */}
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                    {user ? (
                        <>
                            <NotificationBell />
                            <button onClick={() => navigate('/profile')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                                {t('profile')}
                            </button>
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

            <main className="flex-1 container mx-auto p-4 mt-4">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;