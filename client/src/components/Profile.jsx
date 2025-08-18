// client/src/components/Profile.jsx (Styled Version with Dark Mode)

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext'; // CHANGE: Import ThemeContext
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaUserCircle } from 'react-icons/fa';

const Profile = () => {
    const { user, updateUserContext } = useContext(UserContext);
    const { t } = useTranslation();
    const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext
    const [profile, setProfile] = useState({
        bio: '',
        picture: '',
        contactInfo: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user && user._id) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get('http://localhost:5001/api/auth/profile', {
                        headers: { 'x-auth-token': token }
                    });
                    setProfile({ ...user, ...response.data });
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

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch('http://localhost:5001/api/auth/profile', profile, {
                headers: { 'x-auth-token': token }
            });
            updateUserContext(response.data);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile.');
        }
    };

    if (loading) {
        // CHANGE: Add dark mode text color
        return <div className="text-center p-8 text-xl font-medium text-gray-600 dark:text-gray-400">{t('loadingProfile')}</div>;
    }

    if (!user) {
        // CHANGE: No dark mode needed for red text
        return <div className="text-center p-8 text-xl font-medium text-red-500">{t('loginToViewProfile')}</div>;
    }

    return (
        <div className="flex justify-center items-center p-4">
            {/* CHANGE: Add dark mode classes to the main container */}
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 dark:text-gray-100">{t('profile')}</h2>
                
                {/* CHANGE: Add dark mode styles to the border and text */}
                <div className="flex flex-col items-center border-b pb-6 mb-6 dark:border-gray-700">
                    {profile.picture ? (
                        <img 
                            src={profile.picture} 
                            alt="Profile" 
                            // CHANGE: Add dark mode border color
                            className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-indigo-200 dark:border-indigo-700" 
                        />
                    ) : (
                        // CHANGE: Add dark mode text color
                        <FaUserCircle className="w-32 h-32 text-gray-400 mb-4 dark:text-gray-500" />
                    )}
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{user.username}</h3>
                    <p className="text-gray-500 font-medium capitalize dark:text-gray-400">{user.role}</p>
                </div>
                
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div>
                            {/* CHANGE: Add dark mode text color */}
                            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('bio')}</label>
                            <textarea
                                name="bio"
                                value={profile.bio || ''}
                                onChange={handleEditChange}
                                // CHANGE: Add dark mode input styles
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            ></textarea>
                        </div>
                        <div>
                            {/* CHANGE: Add dark mode text color */}
                            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('pictureUrl')}</label>
                            <input
                                type="text"
                                name="picture"
                                value={profile.picture || ''}
                                onChange={handleEditChange}
                                // CHANGE: Add dark mode input styles
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            {/* CHANGE: Add dark mode text color */}
                            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('contactInfo')}</label>
                            <input
                                type="text"
                                name="contactInfo"
                                value={profile.contactInfo || ''}
                                onChange={handleEditChange}
                                // CHANGE: Add dark mode input styles
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(false)} 
                                // CHANGE: Add dark mode button styles
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
                        <div>
                            {/* CHANGE: Add dark mode text colors */}
                            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('bio')}</h4>
                            <p className="text-gray-600 mt-2 dark:text-gray-300">{profile.bio || 'No bio provided.'}</p>
                        </div>
                        <div>
                            {/* CHANGE: Add dark mode text colors */}
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
            </div>
        </div>
    );
};

export default Profile;