// client/src/components/UserManagement.jsx

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaTrashAlt } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { UserContext } from '../context/UserContext'; // ADDED: Import UserContext

// This component provides an interface for an Admin to manage user roles and accounts
const UserManagement = () => {
    const { t } = useTranslation();
    // State to store the list of all users
    const [users, setUsers] = useState([]);
    // State to manage the loading status
    const [loading, setLoading] = useState(true);
    const { isDarkMode } = useContext(ThemeContext);
    // Get the currently logged-in user from context for self-protection logic
    const { user } = useContext(UserContext); // ADDED: Get the logged-in user from context

    // Function to fetch all users from the backend
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/auth/users', {
                headers: { 'x-auth-token': token }
            });
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error(t('failedToFetchUsers'));
            setLoading(false);
        }
    };

    // Effect hook to fetch users when the component mounts
    useEffect(() => {
        fetchUsers();
    }, []);

    // Handler to change a user's role
    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5001/api/auth/users/${userId}`, { role: newRole }, {
                headers: { 'x-auth-token': token }
            });
            toast.success(t('userRoleUpdated'));
            // Re-fetch the user list to show the updated data
            fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error(t('failedToUpdateRole'));
        }
    };

    // Handler to delete a user account
    const handleDeleteUser = async (userId) => {
        if (window.confirm(t('confirmDeleteUser'))) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5001/api/auth/users/${userId}`, {
                    headers: { 'x-auth-token': token }
                });
                toast.success(t('userDeleted'));
                // Re-fetch the user list to show the updated data
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error(t('failedToDeleteUser'));
            }
        }
    };

    // Conditional rendering for loading state
    if (loading) {
        return <div className="text-center p-8 text-xl font-medium text-gray-600 dark:text-gray-400">{t('loadingUsers')}</div>;
    }

    // Main component JSX
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg my-8 dark:bg-gray-900 transition-colors duration-300">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 dark:text-gray-100">{t('manageUsers')}</h2>
            <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="text-gray-600 uppercase text-sm font-semibold bg-gray-50 border-b-2 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                            <th className="py-3 px-6 text-left">{t('username')}</th>
                            <th className="py-3 px-6 text-left">{t('role')}</th>
                            <th className="py-3 px-6 text-center">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Map through the users and create a table row for each */}
                        {users.map(userItem => (
                            <tr key={userItem._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800">
                                <td className="py-4 px-6 text-left text-gray-700 font-medium whitespace-nowrap dark:text-gray-200">
                                  {userItem.username}
                                </td>
                                <td className="py-4 px-6 text-left">
                                    <select
                                        value={userItem.role}
                                        onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                        // CHANGED: Disable the select for the logged-in admin to prevent self-demotion
                                        disabled={user && user._id === userItem._id}
                                    >
                                        <option value="Admin">{t('admin')}</option>
                                        <option value="Publisher">{t('publisher')}</option>
                                        <option value="Reader">{t('reader')}</option>
                                    </select>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <button
                                        onClick={() => handleDeleteUser(userItem._id)}
                                        className="bg-red-500 text-white p-2 rounded-full text-xs hover:bg-red-600 transition-colors"
                                        // CHANGED: Disable the delete button for the logged-in admin to prevent self-deletion
                                        disabled={user && user._id === userItem._id}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;