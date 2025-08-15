// client/src/pages/AnalyticsDashboard.jsx (Styled Version)

import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { FaFileAlt, FaChartPie, FaUsers } from 'react-icons/fa';

const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

    if (user?.role === 'Admin') {
      fetchAnalyticsData();
    }
  }, [user, t]);

  if (loading) {
    return <div className="text-center p-8 text-xl font-medium text-gray-600">{t('loadingAnalytics')}</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500 font-medium">{error}</div>;
  }

  if (!analyticsData) {
    return <div className="text-center p-8 text-xl font-medium text-gray-500">{t('noDataAvailable')}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg my-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('analyticsDashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Articles Card */}
        <div className="bg-indigo-50 p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaFileAlt className="text-4xl text-indigo-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{t('totalArticles')}</h2>
            <p className="text-4xl font-bold text-gray-800">{analyticsData.totalArticles}</p>
          </div>
        </div>

        {/* Articles by Status Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4 space-x-2">
            <FaChartPie className="text-2xl text-indigo-500" />
            <h2 className="text-xl font-semibold text-gray-800">{t('articlesByStatus')}</h2>
          </div>
          <ul className="space-y-2">
            {analyticsData.articlesByStatus.map(item => (
              <li key={item._id} className="flex justify-between items-center text-lg text-gray-700">
                <span>{item._id.charAt(0).toUpperCase() + item._id.slice(1)}:</span>
                <span className="font-bold">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Articles by Publisher Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4 space-x-2">
            <FaUsers className="text-2xl text-indigo-500" />
            <h2 className="text-xl font-semibold text-gray-800">{t('articlesByPublisher')}</h2>
          </div>
          <ul className="space-y-2">
            {analyticsData.articlesByPublisher.map(item => (
              <li key={item.publisher} className="flex justify-between items-center text-lg text-gray-700">
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