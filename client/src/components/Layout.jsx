// src/components/Layout.jsx (Styled Version)

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Outlet, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell.jsx';

const Layout = () => {
    const { logout, user } = useContext(UserContext);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const handleLogout = () => {
      logout();
      navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-100">
            <nav className="bg-white text-gray-800 shadow-md p-4 flex flex-col md:flex-row items-center justify-between sticky top-0 z-50">
                {/* Logo and App Title */}
                <span className="text-2xl font-extrabold text-indigo-600 cursor-pointer mb-2 md:mb-0" onClick={() => navigate('/')}>
                    News Portal
                </span>

                {/* Language Switcher and Primary Nav Buttons */}
                <div className="flex flex-col md:flex-row items-center md:space-x-4 mb-2 md:mb-0">
                    <div className="flex space-x-2 mb-2 md:mb-0">
                        <button onClick={() => changeLanguage('en')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${i18n.language === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>EN</button>
                        <button onClick={() => changeLanguage('ne')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${i18n.language === 'ne' ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>NE</button>
                    </div>

                    <div className="flex flex-wrap items-center space-x-2 md:space-x-4">
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

                {/* User Actions and Logout */}
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                    <NotificationBell />
                    {user && (
                        <button onClick={() => navigate('/profile')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                            {t('profile')}
                        </button>
                    )}
                    <span className="text-sm font-medium hidden md:block">
                        {t('welcome')} {user?.username}!
                    </span>
                    <button onClick={handleLogout} className="px-4 py-1 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors">
                        {t('logout')}
                    </button>
                </div>
            </nav>

            <main className="flex-1 container mx-auto p-4 mt-4">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;