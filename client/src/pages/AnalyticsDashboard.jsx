// client/src/pages/AnalyticsDashboard.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext'; 
import { FaFileAlt, FaChartPie, FaUsers } from 'react-icons/fa';

// This component displays a high-level analytics dashboard for platform administrators.
const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext
  // State to store the analytics data fetched from the API
  const [analyticsData, setAnalyticsData] = useState(null);
  // State for managing the loading status
  const [loading, setLoading] = useState(true);
  // State for managing and displaying any errors
  const [error, setError] = useState('');

  // Effect hook to fetch analytics data when the component mounts
  // and only if the logged-in user is an Admin.
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/analytics/dashboard', {
          headers: { 'x-auth-token': token }
        });
        setAnalyticsData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(t('failedToLoadAnalytics'));
        setLoading(false);
        console.error('Failed to fetch analytics data:', err);
      }
    };

    // Only fetch data if the user has the 'Admin' role
    if (user?.role === 'Admin') {
      fetchAnalyticsData();
    }
  }, [user, t]); // The effect depends on the user object to run the check

  // Conditional rendering for the loading state
  if (loading) {
    return <div className="text-center p-8 text-xl font-medium text-gray-600 dark:text-gray-400">{t('loadingAnalytics')}</div>;
  }

  // Conditional rendering for the error state
  if (error) {
    return <div className="text-center p-8 text-red-500 font-medium">{error}</div>;
  }

  // Conditional rendering if no data is available after the fetch attempt
  if (!analyticsData) {
    return <div className="text-center p-8 text-xl font-medium text-gray-500 dark:text-gray-400">{t('noDataAvailable')}</div>;
  }

  return (
    // Main container with dark mode styles
    <div className="bg-white p-6 rounded-xl shadow-lg my-8 dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 dark:text-gray-100">{t('analyticsDashboard')}</h1>
      
      {/* Grid layout for the analytics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Articles Card */}
        <div className="bg-indigo-50 p-6 rounded-lg shadow-md flex items-center space-x-4 dark:bg-gray-800">
          <FaFileAlt className="text-4xl text-indigo-500 dark:text-indigo-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('totalArticles')}</h2>
            <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">{analyticsData.totalArticles}</p>
          </div>
        </div>

        {/* Articles by Status Card */}
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <div className="flex items-center mb-4 space-x-2">
            <FaChartPie className="text-2xl text-indigo-500 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{t('articlesByStatus')}</h2>
          </div>
          {/* Map through the articlesByStatus array to create a list of items */}
          <ul className="space-y-2">
            {analyticsData.articlesByStatus.map(item => (
              <li key={item._id} className="flex justify-between items-center text-lg text-gray-700 dark:text-gray-200">
                {/* Capitalize the first letter of the status for display */}
                <span>{item._id.charAt(0).toUpperCase() + item._id.slice(1)}:</span>
                <span className="font-bold">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Articles by Publisher Card */}
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <div className="flex items-center mb-4 space-x-2">
            <FaUsers className="text-2xl text-indigo-500 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{t('articlesByPublisher')}</h2>
          </div>
          {/* Map through the articlesByPublisher array to create a list of items */}
          <ul className="space-y-2">
            {analyticsData.articlesByPublisher.map(item => (
              <li key={item.publisher} className="flex justify-between items-center text-lg text-gray-700 dark:text-gray-200">
                <span>{item.publisher}:</span>
                <span className="font-bold">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;