// client/src/pages/AnalyticsDashboard.jsx (Final Corrected Version)

import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

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
          headers: { 'x-auth-token': token } // CORRECTED: Use 'x-auth-token'
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
    return <div className="text-center mt-10 text-xl">{t('loadingAnalytics')}</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!analyticsData) {
    return <div className="text-center mt-10 text-gray-500">{t('noDataAvailable')}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('analyticsDashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">{t('totalArticles')}</h2>
          <p className="text-4xl font-bold text-gray-800">{analyticsData.totalArticles}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">{t('articlesByStatus')}</h2>
          <ul>
            {analyticsData.articlesByStatus.map(item => (
              <li key={item._id} className="flex justify-between items-center text-lg mb-1">
                <span>{item._id.charAt(0).toUpperCase() + item._id.slice(1)}:</span>
                <span className="font-bold">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">{t('articlesByPublisher')}</h2>
          <ul>
            {analyticsData.articlesByPublisher.map(item => (
              <li key={item.publisher} className="flex justify-between items-center text-lg mb-1">
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