// client/src/pages/FullAdminDashboard.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const FullAdminDashboard = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAllArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/articles/admin/all', {
        headers: { 'x-auth-token': token }
      });
      setAllArticles(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(t('failedToFetchAdminArticles'));
      setLoading(false);
      console.error('Failed to fetch all articles:', err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchAllArticles();
    }
  }, [user, t]);

  const handleStatusChange = async (articleId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5001/api/articles/${articleId}/status`, { status: newStatus }, {
        headers: { 'x-auth-token': token }
      });
      fetchAllArticles();
    } catch (err) {
      console.error('Failed to update article status:', err);
      setError('Failed to update article status.');
    }
  };

  const handleViewClick = async (articleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/articles/${articleId}`, {
        headers: { 'x-auth-token': token }
      });
      setSelectedArticle(response.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch article details:', err);
      setError('Failed to load article details.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  if (loading) {
    return <div className="text-center mt-10 text-xl">{t('loadingPendingArticles')}</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('allArticles')}</h1>
      {allArticles.length === 0 ? (
        <p className="text-center text-gray-500">{t('noArticlesFound')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">{t('title')}</th>
                <th className="py-3 px-6 text-left">{t('author')}</th>
                <th className="py-3 px-6 text-left">{t('status')}</th>
                <th className="py-3 px-6 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {allArticles.map(article => (
                <tr key={article._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium">{article.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span>{article.author?.username}</span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold ${
                      article.status === 'published' ? 'bg-green-200 text-green-600' :
                      article.status === 'rejected' ? 'bg-red-200 text-red-600' :
                      'bg-yellow-200 text-yellow-600'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleViewClick(article._id)}
                      className="text-indigo-600 hover:text-indigo-900 mx-2"
                    >
                      {t('view')}
                    </button>
                    {article.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleStatusChange(article._id, 'published')}
                                className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600 mr-2"
                            >
                                {t('approve')}
                            </button>
                            <button
                                onClick={() => handleStatusChange(article._id, 'rejected')}
                                className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                            >
                                {t('reject')}
                            </button>
                        </>
                    )}
                    {article.status === 'published' && (
                        <button
                          onClick={() => handleStatusChange(article._id, 'pending')} // Unpublishing sets it to pending
                          className="bg-gray-500 text-white py-1 px-3 rounded text-xs hover:bg-gray-600"
                        >
                          Unpublish
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
            </div>
            <div className="text-gray-700">
              <p className="font-semibold text-sm mb-2">Author: {selectedArticle.author?.username}</p>
              <p className="font-semibold text-sm mb-4">Status: {selectedArticle.status}</p>
              <div className="border-t pt-4">
                <p>{selectedArticle.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullAdminDashboard;