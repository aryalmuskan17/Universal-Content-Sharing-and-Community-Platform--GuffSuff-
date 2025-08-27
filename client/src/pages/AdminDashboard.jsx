// client/src/pages/AdminDashboard.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; 
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { ThemeContext } from '../context/ThemeContext'; 

// This component serves as the admin dashboard for managing pending articles.
const AdminDashboard = () => {
  const { t } = useTranslation();
  // State to hold the list of articles awaiting approval
  const [pendingArticles, setPendingArticles] = useState([]);
  // State for managing the loading status
  const [loading, setLoading] = useState(true);
  // State for managing and displaying any errors
  const [error, setError] = useState('');
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext

  // Get the authentication token from local storage
  const token = localStorage.getItem('token');

  // Function to fetch articles with a 'pending' status from the backend
  const fetchPendingArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        'http://localhost:5001/api/articles/pending',
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );
      setPendingArticles(response.data.data);
    } catch (err) {
      setError(t('failedToFetchAdminArticles'));
      toast.error(t('failedToFetchAdminArticles'));
    } finally {
      setLoading(false);
    }
  };

  // Effect hook to fetch pending articles when the component mounts or the token changes
  useEffect(() => {
    fetchPendingArticles();
  }, [token, t]);

  // Handler to update an article's status (e.g., publish or reject)
  const handleStatusUpdate = async (articleId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5001/api/articles/${articleId}/status`,
        { status: newStatus },
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );
      
      // Optimistically update the UI by removing the article from the list
      setPendingArticles(pendingArticles.filter(article => article._id !== articleId));
      toast.success(t('articleStatusUpdated'));
    } catch (err) {
      setError(t('failedToUpdateArticleStatus'));
      toast.error(t('failedToUpdateArticleStatus'));
    }
  };

  // Convenience handlers for specific status updates
  const handleApprove = (articleId) => handleStatusUpdate(articleId, 'published');
  const handleReject = (articleId) => handleStatusUpdate(articleId, 'rejected');

  // Conditional rendering for loading state
  if (loading) {
    return <div className="text-center p-8 text-xl font-medium text-gray-600 dark:text-gray-400">{t('loadingPendingArticles')}</div>;
  }
  // Conditional rendering for error state
  if (error) {
    return <div className="text-center p-8 text-red-500 font-medium">{error}</div>;
  }

  return (
    // Main container with dark mode styles
    <div className="bg-white p-6 rounded-xl shadow-lg my-8 dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-gray-100">{t('adminDashboard')} - {t('pendingArticles')}</h1>
      
      {/* Conditional rendering based on the number of pending articles */}
      {pendingArticles.length === 0 ? (
        <div className="text-center text-gray-500 p-4 dark:text-gray-400">{t('noPendingArticles')}</div>
      ) : (
        <div className="space-y-6">
          {/* Map through the pending articles and render a card for each */}
          {pendingArticles.map(article => (
            <div key={article._id} className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              
              {/* Conditional thumbnail display for images or videos */}
              {article.mediaUrl && (
                <div className="h-64 w-full overflow-hidden">
                  {/* Check file extension to determine if it's an image or video */}
                  {article.mediaUrl.toLowerCase().match(/\.(jpeg|jpg|png|gif)$/) ? (
                    <img
                      src={`http://localhost:5001/${article.mediaUrl}`}
                      alt={article.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      controls
                      src={`http://localhost:5001/${article.mediaUrl}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              )}
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{article.title}</h2>
                <p className="text-gray-600 mt-2 line-clamp-3 dark:text-gray-300">{article.content}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{t('author')}:</span> {article.author.username}
                  </span>
                  <span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{t('category')}:</span> {t(article.category)}
                  </span>
                </div>
                <div className="mt-6 flex space-x-4">
                  {/* Action buttons for approving or rejecting the article */}
                  <button
                    onClick={() => handleApprove(article._id)}
                    className="flex-1 py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t('approve')}
                  </button>
                  <button
                    onClick={() => handleReject(article._id)}
                    className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {t('reject')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;