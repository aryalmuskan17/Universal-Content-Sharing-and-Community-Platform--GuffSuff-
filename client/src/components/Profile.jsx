// client/src/components/Profile.jsx

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaUserCircle, FaEdit } from 'react-icons/fa';

// This component displays and allows users to edit their profile information
const Profile = () => {
    // Access user data and the context update function
    const { user, updateUserContext } = useContext(UserContext);
    const { t } = useTranslation();
    const { isDarkMode } = useContext(ThemeContext);
    
    // State to hold the user's profile information
    const [profile, setProfile] = useState({
        fullName: '',
        bio: '',
        picture: '',
        contactInfo: ''
    });
    // State for the username input field, separate from the main profile
    const [newUsername, setNewUsername] = useState('');
    // State to hold the new profile picture file
    const [pictureFile, setPictureFile] = useState(null);
    // State to toggle between view and edit mode
    const [isEditing, setIsEditing] = useState(false);
    // State to handle loading status while fetching data
    const [loading, setLoading] = useState(true);

    // NEW: State for password change form inputs
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Effect to fetch the user's profile data on component load
    useEffect(() => {
        const fetchProfile = async () => {
            if (user && user._id) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get('http://localhost:5001/api/auth/profile', {
                        headers: { 'x-auth-token': token }
                    });
                    // Populate profile state with fetched data
                    setProfile({ 
                        fullName: response.data.fullName || '',
                        bio: response.data.bio || '',
                        picture: response.data.picture || '',
                        contactInfo: response.data.contactInfo || ''
                    });
                    setNewUsername(response.data.username);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching profile:', error);
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    // Handler for changes in the profile edit form
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value
        }));
    };

    // Handler for the profile picture file input
    const handleFileChange = (e) => {
        setPictureFile(e.target.files[0]);
    };

    // NEW: Handler for password change form input
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prevPasswords => ({
            ...prevPasswords,
            [name]: value
        }));
    };

    // UPDATED: Handler to update profile information, including a file
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // Use FormData to handle both text and file data
            const formData = new FormData();
            formData.append('fullName', profile.fullName);
            formData.append('bio', profile.bio);
            formData.append('contactInfo', profile.contactInfo);
            if (pictureFile) {
                formData.append('profilePicture', pictureFile);
            }
            
            const response = await axios.patch('http://localhost:5001/api/auth/profile', formData, {
                headers: { 
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data' // Required for file uploads
                }
            });
            updateUserContext(response.data); // Update user context with new data
            toast.success('Profile updated successfully!');
            setIsEditing(false); // Switch back to view mode
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.error || 'Failed to update profile.');
        }
    };

    // NEW: Handler for username update
    const handleUsernameUpdate = async () => {
        if (newUsername.trim() === user.username) {
            toast.info('Username is the same.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch('http://localhost:5001/api/auth/profile/username', { username: newUsername }, {
                headers: { 'x-auth-token': token }
            });
            updateUserContext(response.data); // Update user context with new username
            toast.success('Username updated successfully!');
        } catch (error) {
            console.error('Error updating username:', error);
            toast.error(error.response?.data?.error || 'Failed to update username.');
        }
    };

    // NEW: Handler for password update
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.patch('http://localhost:5001/api/auth/profile/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            }, {
                headers: { 'x-auth-token': token }
            });
            toast.success('Password updated successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear the form
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(error.response?.data?.error || 'Failed to update password.');
        }
    };

    // Conditional rendering for loading state
    if (loading) {
        return <div className="text-center p-8 text-xl font-medium text-gray-600 dark:text-gray-400">{t('loadingProfile')}</div>;
    }

    // Conditional rendering if no user is logged in
    if (!user) {
        return <div className="text-center p-8 text-xl font-medium text-red-500">{t('loginToViewProfile')}</div>;
    }

    return (
        <div className="flex justify-center items-center p-4">
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 dark:text-gray-100">{t('profile')}</h2>
                
                {/* Profile Picture and Basic Info section */}
                <div className="flex flex-col items-center border-b pb-6 mb-6 dark:border-gray-700">
                    {profile.picture ? (
                        <img 
                            src={`http://localhost:5001/${profile.picture}`} 
                            alt="Profile" 
                            className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-indigo-200 dark:border-indigo-700" 
                        />
                    ) : (
                        <FaUserCircle className="w-32 h-32 text-gray-400 mb-4 dark:text-gray-500" />
                    )}
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        {profile.fullName || user.username}
                    </h3>
                    <p className="text-gray-500 font-medium capitalize dark:text-gray-400">{user.role}</p>
                </div>
                
                {/* NEW: Username change section */}
                <div className="flex items-center space-x-2 mb-6 border-b pb-6 dark:border-gray-700">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('username')}:</label>
                    <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                    <button
                        onClick={handleUsernameUpdate}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {t('changeUsername')}
                    </button>
                </div>

                {/* Conditional rendering for Edit Mode vs. View Mode */}
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-6">
                        {/* Form fields for profile information (fullName, bio, etc.) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('fullName')}</label>
                            <input
                                type="text"
                                name="fullName"
                                value={profile.fullName}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('bio')}</label>
                            <textarea
                                name="bio"
                                value={profile.bio || ''}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('profilePicture')}</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('contactInfo')}</label>
                            <input
                                type="text"
                                name="contactInfo"
                                value={profile.contactInfo || ''}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(false)} 
                                className="px-6 py-2 font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                {t('cancel')}
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {t('save')}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        {/* Display profile details in view mode */}
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('bio')}</h4>
                            <p className="text-gray-600 mt-2 dark:text-gray-300">{profile.bio || 'No bio provided.'}</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('contactInfo')}</h4>
                            <p className="text-gray-600 mt-2 dark:text-gray-300">{profile.contactInfo || 'No contact info provided.'}</p>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button 
                                onClick={() => setIsEditing(true)} 
                                className="px-6 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {t('editProfile')}
                            </button>
                        </div>
                    </div>
                )}
                
                {/* NEW: Password change section */}
                <div className="mt-8 pt-6 border-t dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 dark:text-gray-100">{t('changePassword')}</h3>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('currentPassword')}</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwords.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('newPassword')}</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('confirmNewPassword')}</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                className="px-6 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {t('updatePassword')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;