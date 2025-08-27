// src/pages/MySubscriptions.jsx 

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";

// This component allows a user to view and manage their subscriptions to publishers.
const MySubscriptions = () => {
    // State to hold the list of subscribed publishers
    const [publishers, setPublishers] = useState([]);
    // State to manage loading status
    const [loading, setLoading] = useState(true);
    // State for any error messages
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);
    const { t } = useTranslation();

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
                setError("Failed to fetch subscriptions. Please try again.");
                toast.error(t('failedToFetchSubscriptions'));
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, [user]); // The effect depends on the user object to trigger fetching

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
        return <div className="text-center p-8 text-gray-600 dark:text-gray-400">{t('loadingSubscriptions')}</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b-2 border-gray-300 dark:border-gray-700 pb-2">{t('mySubscriptions')}</h1>
            
            {/* Conditional rendering for when there are no subscriptions */}
            {publishers.length === 0 ? (
                <div className="text-center p-12 text-gray-500 dark:text-gray-400 text-lg">
                    <p>{t('findAndSubscribe')}</p>
                    <p className="mt-2">{t('findAndSubscribe')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Map through the subscribed publishers to display each one */}
                    {publishers.map((publisher) => (
                        <div 
                            key={publisher._id} 
                            className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex-shrink-0">
                                {publisher.picture && (
                                    <img
                                        src={`http://localhost:5001/${publisher.picture.replace(/\\/g, '/')}`}
                                        alt={publisher.username}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 w-full">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{publisher.username}</h2>
                                <p className="text-gray-600 dark:text-gray-400">{publisher.email}</p>
                                {/* Display total donation count and amount */}
                                <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                                    Total Donated: Rs. {publisher.totalDonated ? publisher.totalDonated.toFixed(2) : '0.00'}
                                </p>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Total Donations: {publisher.donationCount || 0}
                                </p>

                                {/* Conditional rendering to show the donation history list */}
                                {individualDonations[publisher._id]?.length > 0 && (
                                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-2">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Donation History</h3>
                                        <ul className="space-y-2">
                                            {individualDonations[publisher._id].map(donation => (
                                                <li key={donation._id} className="text-gray-700 dark:text-gray-300">
                                                    Donated <span className="font-bold">Rs. {donation.amount.toFixed(2)}</span> on {new Date(donation.createdAt).toLocaleDateString()}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0 mt-4 md:mt-0">
                                {/* Unsubscribe button */}
                                <button
                                    onClick={() => handleUnsubscribe(publisher._id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    {t('unsubscribe')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySubscriptions;