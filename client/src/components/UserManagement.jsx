// client/src/components/UserManagement.jsx (Styled Version with Dark Mode)

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaTrashAlt } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { UserContext } from '../context/UserContext'; // ADDED: Import UserContext

const UserManagement = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isDarkMode } = useContext(ThemeContext);
    const { user } = useContext(UserContext); // ADDED: Get the logged-in user from context

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

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5001/api/auth/users/${userId}`, { role: newRole }, {
                headers: { 'x-auth-token': token }
            });
            toast.success(t('userRoleUpdated'));
            fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error(t('failedToUpdateRole'));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm(t('confirmDeleteUser'))) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5001/api/auth/users/${userId}`, {
                    headers: { 'x-auth-token': token }
                });
                toast.success(t('userDeleted'));
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error(t('failedToDeleteUser'));
            }
        }
    };

    if (loading) {
        return <div className="text-center p-8 text-xl font-medium text-gray-600 dark:text-gray-400">{t('loadingUsers')}</div>;
    }

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
                                        // CHANGED: Prevent an admin from demoting themselves
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
                                        // CHANGED: Prevent an admin from deleting themselves
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