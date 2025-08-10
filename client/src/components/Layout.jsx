// src/components/Layout.jsx (Final Corrected Version)

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Outlet, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell.jsx'; // <-- IMPORT THE COMPONENT

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
        <div className="min-h-screen flex flex-col">
            <nav className="bg-gray-800 text-white p-4 flex justify-between">
                <span className="text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>News Portal</span>
                <div>
                    <button onClick={() => changeLanguage('en')} className="p-2 hover:bg-gray-700 rounded">EN</button>
                    <button onClick={() => changeLanguage('ne')} className="p-2 hover:bg-gray-700 rounded">NE</button>
                </div>
                <div>
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-700 rounded">{t('articles')}</button>
                    
                    {user && (user.role === 'Publisher' || user.role === 'Admin') && (
                        <>
                            <button onClick={() => navigate('/create-article')} className="p-2 hover:bg-gray-700 rounded">{t('createArticle')}</button>
                            <button onClick={() => navigate('/publisher-analytics')} className="p-2 hover:bg-gray-700 rounded">Analytics</button>
                        </>
                    )}
                    
                    {user?.role === 'Admin' && (
                        <>
                            <button onClick={() => navigate('/admin-dashboard')} className="p-2 hover:bg-gray-700 rounded">{t('adminDashboard')}</button>
                            <button onClick={() => navigate('/full-admin-dashboard')} className="p-2 hover:bg-gray-700 rounded">Full CMS Dashboard</button>
                            <button onClick={() => navigate('/analytics-dashboard')} className="p-2 hover:bg-gray-700 rounded">Admin Analytics</button>
                            <button onClick={() => navigate('/user-management')} className="p-2 hover:bg-gray-700 rounded">Manage Users</button>
                        </>
                    )}
                </div>
                <div>
                    {/* Add the notification bell here */}
                    <NotificationBell />
                    
                    {user && (
                        <button onClick={() => navigate('/profile')} className="p-2 mr-4 hover:bg-gray-700 rounded">
                            {t('profile')}
                        </button>
                    )}
                    <span className="p-2">{t('welcome')} {user?.username}!</span>
                    <button onClick={handleLogout} className="p-2 ml-4 bg-red-600 rounded hover:bg-red-700">{t('logout')}</button>
                </div>
            </nav>
            <main className="flex-1 container mx-auto p-4">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;