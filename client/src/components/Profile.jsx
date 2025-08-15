// client/src/components/Profile.jsx (Styled Version)

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaUserCircle } from 'react-icons/fa'; // Make sure you have react-icons installed

const Profile = () => {
    const { user, updateUserContext } = useContext(UserContext);
    const { t } = useTranslation();
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
                    // Merge fetched profile with current user info
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
        return <div className="text-center p-8 text-xl font-medium text-gray-600">{t('loadingProfile')}</div>;
    }

    if (!user) {
        return <div className="text-center p-8 text-xl font-medium text-red-500">{t('loginToViewProfile')}</div>;
    }

    return (
        <div className="flex justify-center items-center p-4">
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{t('profile')}</h2>
                
                <div className="flex flex-col items-center border-b pb-6 mb-6">
                    {profile.picture ? (
                        <img 
                            src={profile.picture} 
                            alt="Profile" 
                            className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-indigo-200" 
                        />
                    ) : (
                        <FaUserCircle className="w-32 h-32 text-gray-400 mb-4" />
                    )}
                    <h3 className="text-2xl font-semibold text-gray-800">{user.username}</h3>
                    <p className="text-gray-500 font-medium capitalize">{user.role}</p>
                </div>
                
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('bio')}</label>
                            <textarea
                                name="bio"
                                value={profile.bio || ''}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('pictureUrl')}</label>
                            <input
                                type="text"
                                name="picture"
                                value={profile.picture || ''}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('contactInfo')}</label>
                            <input
                                type="text"
                                name="contactInfo"
                                value={profile.contactInfo || ''}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(false)} 
                                className="px-6 py-2 font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
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
                            <h4 className="text-xl font-bold text-gray-800">{t('bio')}</h4>
                            <p className="text-gray-600 mt-2">{profile.bio || 'No bio provided.'}</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800">{t('contactInfo')}</h4>
                            <p className="text-gray-600 mt-2">{profile.contactInfo || 'No contact info provided.'}</p>
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