import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Add this import

const AdminDashboard = () => {
  const { t } = useTranslation(); // Get the translation function
  const [pendingArticles, setPendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Function to fetch pending articles from the backend
  const fetchPendingArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        'http://localhost:5001/api/articles/pending',
        {
          headers: {
            'x-auth-token': token, // CORRECTED: Use 'x-auth-token'
          },
        }
      );
      setPendingArticles(response.data.data);
    } catch (err) {
      // Translate the error message
      setError(t('failedToFetchAdminArticles'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingArticles();
  }, [token]); // Added dependency to re-run on token change

  // Function to handle the approval or rejection of an article
  const handleStatusUpdate = async (articleId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5001/api/articles/${articleId}/status`,
        { status: newStatus },
        {
          headers: {
            'x-auth-token': token, // CORRECTED: Use 'x-auth-token'
          },
        }
      );
      
      setPendingArticles(pendingArticles.filter(article => article._id !== articleId));
    } catch (err) {
      // Translate the error message
      setError(t('failedToUpdateArticleStatus'));
    }
  };

  const handleApprove = (articleId) => handleStatusUpdate(articleId, 'published');
  const handleReject = (articleId) => handleStatusUpdate(articleId, 'rejected');

  // Translate the loading and error messages
  if (loading) return <div className="text-center p-4">{t('loadingPendingArticles')}</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Translate the heading */}
      <h1 className="text-3xl font-bold mb-6">{t('adminDashboard')} - {t('pendingArticles')}</h1>
      
      {pendingArticles.length === 0 ? (
        // Translate the message for no articles
        <div className="text-center text-gray-500">{t('noPendingArticles')}</div>
      ) : (
        <div className="space-y-4">
          {pendingArticles.map(article => (
            <div key={article._id} className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold">{article.title}</h2>
              <p className="text-gray-600 mt-2 line-clamp-3">{article.content}</p>
              <div className="mt-4 text-sm text-gray-500">
                {/* Translate "Author" and "Category" */}
                <span className="font-medium">{t('author')}:</span> {article.author.username}
                <span className="ml-4 font-medium">{t('category')}:</span> {article.category}
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => handleApprove(article._id)}
                  className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                >
                  {t('approve')}
                </button>
                <button
                  onClick={() => handleReject(article._id)}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                >
                  {t('reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;