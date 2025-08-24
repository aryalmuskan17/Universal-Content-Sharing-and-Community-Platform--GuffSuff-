// src/pages/MySubscriptions.jsx (Final version without View Profile button)

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';

const MySubscriptions = () => {
    const [publishers, setPublishers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);

    // New state to hold the list of individual donations
    const [individualDonations, setIndividualDonations] = useState({});

    useEffect(() => {
        const fetchSubscriptions = async () => {
            if (!user) {
                setLoading(false);
                setError("You must be logged in to view your subscriptions.");
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                setError("Authentication token not found.");
                return;
            }

            try {
                const config = {
                    headers: {
                        'x-auth-token': token
                    }
                };
                
                const subscriptionsRes = await axios.get('http://localhost:5001/api/auth/subscriptions', config);
                const publishersList = subscriptionsRes.data;

                // Create a separate array to store promises for fetching donations
                const donationPromises = publishersList.map(async (publisher) => {
                    try {
                        // Fetch the LIST of individual donations using the new route
                        const donationsRes = await axios.get(`http://localhost:5001/api/auth/donations/list/${publisher._id}`, config);
                        
                        // Calculate total amount and count from the list
                        const totalDonated = donationsRes.data.reduce((sum, donation) => sum + donation.amount, 0);
                        const donationCount = donationsRes.data.length;

                        // Store the individual donations list
                        setIndividualDonations(prev => ({
                            ...prev,
                            [publisher._id]: donationsRes.data
                        }));

                        return { ...publisher, totalDonated, donationCount };
                    } catch (err) {
                        console.error(`Error fetching donations for ${publisher.username}:`, err);
                        return { ...publisher, totalDonated: 0, donationCount: 0 };
                    }
                });

                const publishersWithDonations = await Promise.all(donationPromises);
                setPublishers(publishersWithDonations);

            } catch (err) {
                console.error('Error fetching subscriptions:', err);
                setError("Failed to fetch subscriptions. Please try again.");
                toast.error("Failed to fetch subscriptions.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, [user]);

    const handleUnsubscribe = async (publisherId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("You are not logged in.");
            return;
        }

        try {
            const config = {
                headers: {
                    'x-auth-token': token
                }
            };
            await axios.put(`http://localhost:5001/api/auth/profile/unsubscribe/${publisherId}`, {}, config);
            
            setPublishers(publishers.filter(p => p._id !== publisherId));
            toast.success("Successfully unsubscribed.");
            
        } catch (err) {
            console.error('Error unsubscribing:', err);
            toast.error("Failed to unsubscribe.");
        }
    };

    if (loading) {
        return <div className="text-center p-8 text-gray-600 dark:text-gray-400">Loading subscriptions...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b-2 border-gray-300 dark:border-gray-700 pb-2">My Subscriptions</h1>
            
            {publishers.length === 0 ? (
                <div className="text-center p-12 text-gray-500 dark:text-gray-400 text-lg">
                    <p>You are not subscribed to any publishers yet.</p>
                    <p className="mt-2">Find a publisher you like and subscribe to their articles!</p>
                </div>
            ) : (
                <div className="space-y-4">
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
                                <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                                    Total Donated: Rs. {publisher.totalDonated ? publisher.totalDonated.toFixed(2) : '0.00'}
                                </p>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Total Donations: {publisher.donationCount || 0}
                                </p>

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
                                <button
                                    onClick={() => handleUnsubscribe(publisher._id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Unsubscribe
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