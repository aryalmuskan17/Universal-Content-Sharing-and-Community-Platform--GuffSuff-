// src/pages/MySubscriptions.jsx

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
                
                const res = await axios.get('http://localhost:5001/api/auth/subscriptions', config);
                setPublishers(res.data);
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

    // NEW: Function to handle unsubscription
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
            
            // On success, update the state to remove the publisher from the list
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
                            className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            {publisher.picture && (
                                <img
                                    src={`http://localhost:5001/${publisher.picture.replace(/\\/g, '/')}`}
                                    alt={publisher.username}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{publisher.username}</h2>
                                <p className="text-gray-600 dark:text-gray-400">{publisher.email}</p>
                            </div>
                            {/* UPDATED: Change to an Unsubscribe button */}
                            <button
                                onClick={() => handleUnsubscribe(publisher._id)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Unsubscribe
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySubscriptions;