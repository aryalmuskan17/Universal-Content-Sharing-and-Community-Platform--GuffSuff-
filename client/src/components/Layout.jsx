import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaSun, FaMoon, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa'; 
import { Outlet, useNavigate, Link } from 'react-router-dom';
import NotificationBell from './NotificationBell.jsx';

import logo from '../assets/logo.png'; 

const Layout = () => {
    const { logout, user } = useContext(UserContext);
    const { t, i18n } = useTranslation();
    const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ne' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = () => {
      logout();
      navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-100 dark:bg-black dark:text-gray-100 transition-colors duration-300">

            <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
    {/* TOP BAR: Logo, Nav, and Actions */}
    <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-5">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} alt="GuffSuff Logo" className="h-8 w-auto mr-2" />
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 hidden sm:block">
                    Guff Suff
                </span>
            </div>

            {/* Language Toggle */}
            <button onClick={toggleLanguage} className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 shadow-sm">
                {i18n.language === 'en' ? (
                    <><img src="https://flagcdn.com/w40/gb.png" alt="English" className="w-5 h-auto rounded-sm" /><span className="text-sm font-bold">EN</span></>
                ) : (
                    <><img src="https://flagcdn.com/w40/np.png" alt="Nepali" className="w-4 h-auto" /><span className="text-sm font-bold">NE</span></>
                )}
            </button>

            {/* DESKTOP NAVIGATION */}
            <div className="hidden lg:flex items-center space-x-2 border-l pl-5 border-gray-200 dark:border-gray-700">
                <button onClick={() => navigate('/')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('articles')}</button>
                {user?.role === 'Reader' && <button onClick={() => navigate('/my-subscriptions')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('mySubscriptions')}</button>}
                {user?.role === 'Publisher' && (
                    <><button onClick={() => navigate('/create-article')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('createArticle')}</button>
                    <button onClick={() => navigate('/publisher-analytics')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('analytics')}</button>
                    <button onClick={() => navigate('/my-subscribers')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('subscribers')}</button></>
                )}
                {user?.role === 'Admin' && (
                    <><button onClick={() => navigate('/create-article')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('createArticle')}</button>
                    <button onClick={() => navigate('/user-management')} className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('manageUsers')}</button>
                    <div className="relative group">
                        <button className="flex items-center px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            {t('insights')} <FaChevronDown className="ml-1 text-[10px] transition-transform group-hover:rotate-180" />
                        </button>
                        <div className="absolute left-0 pt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-100 dark:border-gray-700">
                                <button onClick={() => navigate('/admin-dashboard')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('adminDashboard')}</button>
                                <button onClick={() => navigate('/full-admin-dashboard')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('fullCmsDashboard')}</button>
                                <button onClick={() => navigate('/analytics-dashboard')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('overallAnalytics')}</button>
                                <button onClick={() => navigate('/publisher-analytics')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('analytics')}</button>
                            </div>
                        </div>
                    </div></>
                )}
            </div>
        </div>

        {/* RIGHT SIDE: Theme, Menu Toggle, and User Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {isDarkMode ? <FaSun className="text-yellow-400 text-xl" /> : <FaMoon className="text-gray-700 text-xl" />}
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-2xl text-gray-600 dark:text-gray-300">
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            <div className="flex items-center space-x-1 sm:space-x-2">
                {user ? (
                    <>
                        <NotificationBell />
                        {/* Corrected: Username always visible and links to profile */}
                        <Link to="/profile" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-1 sm:px-2 whitespace-nowrap">
                            {user.username}
                        </Link>
                        <button onClick={handleLogout} className="px-3 sm:px-4 py-1 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors">
                            {t('logout')}
                        </button>
                    </>
                ) : (
                    <><button onClick={() => navigate('/login')} className="px-3 sm:px-4 py-1 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">{t('login')}</button>
                    <button onClick={() => navigate('/register')} className="hidden sm:block px-4 py-1 text-sm font-semibold text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors">{t('register')}</button></>
                )}
            </div>
        </div>
    </div>

    {/* MOBILE MENU */}
    {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700 px-6 py-4 space-y-4 flex flex-col">
            <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="text-left font-medium">{t('articles')}</button>
            {user?.role === 'Reader' && <button onClick={() => { navigate('/my-subscriptions'); setIsMenuOpen(false); }} className="text-left font-medium">{t('mySubscriptions')}</button>}
            {user?.role === 'Publisher' && (
                <><button onClick={() => { navigate('/create-article'); setIsMenuOpen(false); }} className="text-left font-medium">{t('createArticle')}</button>
                <button onClick={() => { navigate('/publisher-analytics'); setIsMenuOpen(false); }} className="text-left font-medium">{t('analytics')}</button>
                <button onClick={() => { navigate('/my-subscribers'); setIsMenuOpen(false); }} className="text-left font-medium">{t('subscribers')}</button></>
            )}
            {user?.role === 'Admin' && (
                <><button onClick={() => { navigate('/create-article'); setIsMenuOpen(false); }} className="text-left font-medium">{t('createArticle')}</button>
                <button onClick={() => { navigate('/user-management'); setIsMenuOpen(false); }} className="text-left font-medium">{t('manageUsers')}</button>
                <button onClick={() => { navigate('/admin-dashboard'); setIsMenuOpen(false); }} className="text-left font-medium pl-4 text-indigo-500 border-l-2 border-indigo-500">{t('adminDashboard')}</button>
                <button onClick={() => { navigate('/full-admin-dashboard'); setIsMenuOpen(false); }} className="text-left font-medium pl-4 text-indigo-500 border-l-2 border-indigo-500">{t('fullCmsDashboard')}</button>
                <button onClick={() => { navigate('/analytics-dashboard'); setIsMenuOpen(false); }} className="text-left font-medium pl-4 text-indigo-500 border-l-2 border-indigo-500">{t('overallAnalytics')}</button>
                <button onClick={() => { navigate('/publisher-analytics'); setIsMenuOpen(false); }} className="text-left font-medium pl-4 text-indigo-500 border-l-2 border-indigo-500">{t('analytics')}</button></>
            )}
        </div>
    )}
</nav>

            <main className="flex-1 container mx-auto p-4 mt-4 bg-white dark:bg-black rounded-lg shadow-md transition-colors duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;