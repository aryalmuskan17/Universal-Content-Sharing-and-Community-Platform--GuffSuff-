// client/src/pages/MySubscribers.jsx (Updated with Donation Data)

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MySubscribers = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

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
                const config = {
                    headers: {
                        'x-auth-token': token
                    }
                };
                
                // The backend now returns a more detailed list
                const response = await axios.get('http://localhost:5001/api/auth/subscribers', config);
                setSubscribers(response.data);
                
            } catch (err) {
                console.error('Error fetching subscribers:', err);
                if (err.response && err.response.status === 403) {
                    setError("Access Denied: You must be a Publisher to view this page.");
                } else {
                    setError("Failed to fetch subscribers. Please try again.");
                }
                toast.error("Failed to fetch subscribers.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubscribers();
    }, [user, navigate]);

    if (loading) {
        return <div className="text-center p-8 text-gray-600 dark:text-gray-400">Loading subscribers...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b-2 border-gray-300 dark:border-gray-700 pb-2">My Subscribers</h1>
            
            {subscribers.length === 0 ? (
                <div className="text-center p-12 text-gray-500 dark:text-gray-400 text-lg">
                    <p>You do not have any subscribers yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {subscribers.map((subscriber) => (
                        <div 
                            key={subscriber._id} 
                            className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex-shrink-0">
                                {subscriber.picture && (
                                    <img
                                        src={`http://localhost:5001/${subscriber.picture.replace(/\\/g, '/')}`}
                                        alt={subscriber.username}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 w-full">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{subscriber.username}</h2>
                                <p className="text-gray-600 dark:text-gray-400">{subscriber.email}</p>
                                
                                {/* NEW: Display total donation amount and a list of donations */}
                                <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                                    Total Donated: Rs. {subscriber.totalDonated ? subscriber.totalDonated.toFixed(2) : '0.00'}
                                </p>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Total Donations: {subscriber.donations ? subscriber.donations.length : 0}
                                </p>

                                {subscriber.donations?.length > 0 && (
                                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-2">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Donation History</h3>
                                        <ul className="space-y-2">
                                            {subscriber.donations.map(donation => (
                                                <li key={donation._id} className="text-gray-700 dark:text-gray-300">
                                                    Donated <span className="font-bold">Rs. {donation.amount.toFixed(2)}</span> on {new Date(donation.createdAt).toLocaleDateString()}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySubscribers;