// client/src/components/Profile.jsx (Final Corrected Version)

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { useTranslation } from 'react-i18next';

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
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (user && user._id) { // Added a check to prevent unnecessary requests
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get('http://localhost:5001/api/auth/profile', {
                        headers: { 'x-auth-token': token }
                    });
                    setProfile(response.data);
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
            // CORRECTED: Changed endpoint to '/profile' to match backend
            const response = await axios.patch('http://localhost:5001/api/auth/profile', profile, {
                headers: { 'x-auth-token': token }
            });
            updateUserContext(response.data);
            setMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Failed to update profile.');
        }
    };

    if (loading) {
        return <div className="text-center mt-10">{t('loadingProfile')}</div>;
    }

    if (!user) {
        return <div className="text-center mt-10 text-red-500">Please log in to view your profile.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-3xl font-bold mb-6">{t('profile')}</h2>
            {message && <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">{message}</div>}

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col items-center">
                    {profile.picture && <img src={profile.picture} alt="Profile" className="w-32 h-32 rounded-full mb-4 object-cover" />}
                    <h3 className="text-2xl font-semibold">{profile.username}</h3>
                    <p className="text-gray-500">{profile.role}</p>
                </div>
                
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="mt-6 space-y-4">
                        <div>
                            <label className="block text-gray-700">{t('bio')}</label>
                            <textarea
                                name="bio"
                                value={profile.bio || ''}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-gray-700">{t('pictureUrl')}</label>
                            <input
                                type="text"
                                name="picture"
                                value={profile.picture || ''}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">{t('contactInfo')}</label>
                            <input
                                type="text"
                                name="contactInfo"
                                value={profile.contactInfo || ''}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                                {t('cancel')}
                            </button>
                            <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                {t('save')}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="mt-6 space-y-4">
                        <div>
                            <h4 className="text-lg font-semibold">{t('bio')}</h4>
                            <p className="text-gray-600">{profile.bio || 'No bio provided.'}</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold">{t('contactInfo')}</h4>
                            <p className="text-gray-600">{profile.contactInfo || 'No contact info provided.'}</p>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
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