import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { FaDonate, FaHistory, FaUser } from 'react-icons/fa';

const MySubscribers = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const fetchSubscribers = async () => {
            if (!user) {
                setLoading(false);
                return navigate('/login');
            }
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return navigate('/login');
            }
            try {
                const config = { headers: { 'x-auth-token': token } };
                const response = await axios.get('http://localhost:5001/api/auth/subscribers', config);
                setSubscribers(response.data);
            } catch (err) {
                setError(err.response?.status === 403 ? t('accessDeniedPublisher') : t('failedToFetchSubscribers'));
                toast.error(t('failedToFetchSubscribers'));
            } finally {
                setLoading(false);
            }
        };
        fetchSubscribers();
    }, [user, navigate, t]);

    if (loading) return <div className="flex justify-center items-center h-64 text-indigo-600 animate-pulse font-medium">{t('loadingSubscribers')}</div>;
    if (error) return <div className="text-center p-8 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">{error}</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <header className="mb-8 border-b dark:border-gray-800 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('mySubscribers')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('manageCommunity')}</p>
                </div>
                <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t('subscribers')}</span>
                    <p className="text-2xl font-mono font-bold text-indigo-600">{subscribers.length}</p>
                </div>
            </header>
            
            {subscribers.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <FaUser className="mx-auto text-4xl text-gray-300 mb-4" />
                    <p className="text-xl text-gray-500 dark:text-gray-400">{t('noSubscribersYet')}</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {subscribers.map((subscriber) => (
                        <div key={subscriber._id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all hover:shadow-md">
                            <div className="p-5 flex flex-col md:flex-row gap-6">
                                {/* Profile Section */}
                                <div className="flex flex-row md:flex-col items-center gap-4 md:w-40 flex-shrink-0">
                                    {subscriber.picture ? (
                                        <img
                                            src={`http://localhost:5001/${subscriber.picture.replace(/\\/g, '/')}`}
                                            alt={subscriber.username}
                                            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-50 dark:ring-indigo-900/30"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                            {subscriber.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="text-left md:text-center">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate w-32">{subscriber.username}</h2>
                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">{t('subscriberRole')}</span>
                                    </div>
                                </div>

                                {/* Stats & History Section */}
                                <div className="flex-1">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FaDonate /> {t('totalSupport')}</p>
                                            <p className="text-lg font-bold text-green-600">{t('currency')} {subscriber.totalDonated?.toFixed(2) || '0.00'}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FaHistory /> {t('contributions')}</p>
                                            <p className="text-lg font-bold text-gray-800 dark:text-white">{subscriber.donations?.length || 0}</p>
                                        </div>
                                    </div>

                                    {subscriber.donations?.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                {t('recentActivity')}
                                            </h3>
                                            <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                                {subscriber.donations.slice().reverse().map(donation => (
                                                    <div key={donation._id} className="flex justify-between items-center p-2 rounded bg-white dark:bg-gray-800 border border-gray-50 dark:border-gray-700 text-sm">
                                                        <span className="text-gray-600 dark:text-gray-300">
                                                            {t('received')} <span className="font-semibold text-gray-900 dark:text-white">{t('currency')} {donation.amount.toFixed(2)}</span>
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(donation.createdAt).toLocaleDateString(i18n.language === 'ne' ? 'ne-NP' : 'en-US')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySubscribers;