// client/src/pages/AdminDashboard.jsx (Styled Version)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; 
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [pendingArticles, setPendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

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

  useEffect(() => {
    fetchPendingArticles();
  }, [token, t]);

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
      
      setPendingArticles(pendingArticles.filter(article => article._id !== articleId));
      toast.success(t('articleStatusUpdated'));
    } catch (err) {
      setError(t('failedToUpdateArticleStatus'));
      toast.error(t('failedToUpdateArticleStatus'));
    }
  };

  const handleApprove = (articleId) => handleStatusUpdate(articleId, 'published');
  const handleReject = (articleId) => handleStatusUpdate(articleId, 'rejected');

  if (loading) {
    return <div className="text-center p-8 text-xl font-medium text-gray-600">{t('loadingPendingArticles')}</div>;
  }
  if (error) {
    return <div className="text-center p-8 text-red-500 font-medium">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg my-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard')} - {t('pendingArticles')}</h1>
      
      {pendingArticles.length === 0 ? (
        <div className="text-center text-gray-500 p-4">{t('noPendingArticles')}</div>
      ) : (
        <div className="space-y-6">
          {pendingArticles.map(article => (
            <div key={article._id} className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
              
              {/* Conditional thumbnail display */}
              {article.mediaUrl && (
                <div className="h-64 w-full overflow-hidden">
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
                <h2 className="text-2xl font-bold text-gray-800">{article.title}</h2>
                <p className="text-gray-600 mt-2 line-clamp-3">{article.content}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>
                    <span className="font-semibold text-gray-700">{t('author')}:</span> {article.author.username}
                  </span>
                  <span>
                    <span className="font-semibold text-gray-700">{t('category')}:</span> {article.category}
                  </span>
                </div>
                <div className="mt-6 flex space-x-4">
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