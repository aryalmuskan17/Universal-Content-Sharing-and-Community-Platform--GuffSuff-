import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";
import { FaDonate, FaHistory, FaUserTie } from 'react-icons/fa';

// This component allows a user to view and manage their subscriptions to publishers.
const MySubscriptions = () => {
    // State to hold the list of subscribed publishers
    const [publishers, setPublishers] = useState([]);
    // State to manage loading status
    const [loading, setLoading] = useState(true);
    // State for any error messages
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);
    const { t, i18n } = useTranslation();

    // State to store the individual donation history, indexed by publisher ID
    const [individualDonations, setIndividualDonations] = useState({});

    useEffect(() => {
        const fetchSubscriptions = async () => {
            // Initial authentication check
            if (!user) {
                setLoading(false);
                setError(t('mustBeLoggedInSubscriptions'));
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                setError(t('authenticationTokenNotFound'));
                return;
            }

            try {
                const config = {
                    headers: {
                        'x-auth-token': token
                    }
                };
                
                // Fetch the list of subscribed publishers
                const subscriptionsRes = await axios.get('http://localhost:5001/api/auth/subscriptions', config);
                const publishersList = subscriptionsRes.data;

                // Use Promise.all to concurrently fetch donation history for each publisher
                const donationPromises = publishersList.map(async (publisher) => {
                    try {
                        // Fetch the LIST of individual donations using the new route
                        const donationsRes = await axios.get(`http://localhost:5001/api/auth/donations/list/${publisher._id}`, config);
                        
                        // Calculate total amount and count from the fetched list
                        const totalDonated = donationsRes.data.reduce((sum, donation) => sum + donation.amount, 0);
                        const donationCount = donationsRes.data.length;

                        // Store the individual donations list in a separate state
                        setIndividualDonations(prev => ({
                            ...prev,
                            [publisher._id]: donationsRes.data
                        }));

                        // Return the publisher data enriched with donation totals
                        return { ...publisher, totalDonated, donationCount };
                    } catch (err) {
                        console.error(`Error fetching donations for ${publisher.username}:`, err);
                        // Return default values in case of an error for this specific publisher
                        return { ...publisher, totalDonated: 0, donationCount: 0 };
                    }
                });

                // Wait for all donation fetches to complete before updating the state
                const publishersWithDonations = await Promise.all(donationPromises);
                setPublishers(publishersWithDonations);

            } catch (err) {
                console.error('Error fetching subscriptions:', err);
                setError(t('failedToFetchSubscriptions'));
                toast.error(t('failedToFetchSubscriptions'));
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, [user, t]); // The effect depends on the user object to trigger fetching

    // Handler for unsubscribing from a publisher
    const handleUnsubscribe = async (publisherId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error(t('notLoggedIn'));
            return;
        }

        try {
            const config = {
                headers: {
                    'x-auth-token': token
                }
            };
            // Send a PUT request to the unsubscribe endpoint
            await axios.put(`http://localhost:5001/api/auth/profile/unsubscribe/${publisherId}`, {}, config);
            
            // Optimistically update the UI by filtering out the unsubscribed publisher
            setPublishers(publishers.filter(p => p._id !== publisherId));
            toast.success(t('successfullyUnsubscribed'));
            
        } catch (err) {
            console.error('Error unsubscribing:', err);
            toast.error(t('failedToUnsubscribe'));

        }
    };

    // Conditional rendering for various states
    if (loading) {
        return <div className="flex justify-center items-center h-64 text-indigo-600 animate-pulse font-medium">{t('loadingSubscriptions')}</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg max-w-2xl mx-auto mt-10">{error}</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <header className="mb-8 border-b dark:border-gray-800 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('mySubscriptions')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('findAndSubscribe')}</p>
                </div>
                <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t('analytics')}</span>
                    <p className="text-2xl font-mono font-bold text-indigo-600">{publishers.length}</p>
                </div>
            </header>
            
            {/* Conditional rendering for when there are no subscriptions */}
            {publishers.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <FaUserTie className="mx-auto text-4xl text-gray-300 mb-4" />
                    <p className="text-xl text-gray-500 dark:text-gray-400">{t('noSubscriptionsYet')}</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {/* Map through the subscribed publishers to display each one */}
                    {publishers.map((publisher) => (
                        <div 
                            key={publisher._id} 
                            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all hover:shadow-md"
                        >
                            <div className="p-5 flex flex-col md:flex-row gap-6">
                                {/* Profile Section */}
                                <div className="flex flex-row md:flex-col items-center gap-4 md:w-40 flex-shrink-0">
                                    {publisher.picture ? (
                                        <img
                                            src={`http://localhost:5001/${publisher.picture.replace(/\\/g, '/')}`}
                                            alt={publisher.username}
                                            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-50 dark:ring-indigo-900/30"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                            {publisher.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="text-left md:text-center">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate w-32">{publisher.username}</h2>
                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">{t('publisher')}</span>
                                    </div>
                                </div>

                                {/* Stats & History Section */}
                                <div className="flex-1">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            {/* Display total donation count and amount */}
                                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FaDonate /> {t('totalSupport')}</p>
                                            <p className="text-lg font-bold text-green-600">{t('currency')} {publisher.totalDonated ? publisher.totalDonated.toFixed(2) : '0.00'}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FaHistory /> {t('contributions')}</p>
                                            <p className="text-lg font-bold text-gray-800 dark:text-white">{publisher.donationCount || 0}</p>
                                        </div>
                                    </div>

                                    {/* Conditional rendering to show the donation history list */}
                                    {individualDonations[publisher._id]?.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                {t('donationHistory')}
                                            </h3>
                                            <div className="max-h-32 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                                {individualDonations[publisher._id].slice().reverse().map(donation => (
                                                    <div key={donation._id} className="flex justify-between items-center p-2 rounded bg-white dark:bg-gray-800 border border-gray-50 dark:border-gray-700 text-sm">
                                                        <span className="text-gray-600 dark:text-gray-300">
                                                            {t('donated').replace('{{currency}}', t('currency')).replace('{{amount}}', donation.amount.toFixed(2))}
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

                                <div className="flex-shrink-0 flex items-start">
                                    {/* Unsubscribe button */}
                                    <button
                                        onClick={() => handleUnsubscribe(publisher._id)}
                                        className="w-full md:w-auto px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200 border border-red-100"
                                    >
                                        {t('unsubscribe')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySubscriptions;