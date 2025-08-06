import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/auth/users/${userId}`, {
                headers: { 'x-auth-token': token }
            });
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    if (loading) {
        return <div className="text-center mt-10">Loading users...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-3xl font-bold mb-6">Manage Users</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Username</th>
                            <th className="py-3 px-6 text-left">Role</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {users.map(user => (
                            <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{user.username}</td>
                                <td className="py-3 px-6 text-left">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Publisher">Publisher</option>
                                    </select>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                                    >
                                        Delete
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