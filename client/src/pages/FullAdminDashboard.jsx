// client/src/pages/FullAdminDashboard.jsx (Corrected Version with Dark Mode)

import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext'; // CHANGE: Import ThemeContext
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaEye, FaUndo } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // NEW: Import Link for clickable titles

const FullAdminDashboard = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext
  const { t } = useTranslation();

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAllArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/articles', {
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
      toast.success(t('articleStatusUpdated'));
      fetchAllArticles();
    } catch (err) {
      console.error('Failed to update article status:', err);
      toast.error('Failed to update article status.');
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
      toast.error('Failed to load article details.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  if (loading) {
    // CHANGE: Add dark mode text color
    return <div className="text-center p-8 text-xl font-medium text-gray-600 dark:text-gray-400">{t('loadingPendingArticles')}</div>;
  }

  if (error) {
    // CHANGE: No dark mode needed for red text
    return <div className="text-center p-8 text-red-500 font-medium">{error}</div>;
  }
  
  if (user?.role !== 'Admin') {
    // CHANGE: No dark mode needed for red text
    return <div className="text-center p-8 text-red-500 font-medium">{t('accessDenied')}</div>;
  }

  return (
    // CHANGE: Add dark mode classes to the main container
    <div className="bg-white p-6 rounded-xl shadow-lg my-8 dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-gray-100">{t('allArticles')}</h1>
      {allArticles.length === 0 ? (
        // CHANGE: Add dark mode text color
        <p className="text-center text-gray-500 p-4 dark:text-gray-400">{t('noArticlesFound')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full leading-normal">
            <thead>
              {/* CHANGE: Add dark mode classes to the table header */}
              <tr className="text-gray-600 uppercase text-sm font-semibold bg-gray-50 border-b-2 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                <th className="py-3 px-6 text-left">{t('title')}</th>
                <th className="py-3 px-6 text-left">{t('author')}</th>
                <th className="py-3 px-6 text-left">{t('status')}</th>
                <th className="py-3 px-6 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {allArticles.map(article => (
                // CHANGE: Add dark mode classes to table rows
                <tr key={article._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800">
                  <td className="py-4 px-6 text-left whitespace-nowrap">
                    {/* CHANGE: Make the title clickable with <Link> */}
                    <Link to={`/article/${article._id}`} className="font-medium text-indigo-600 hover:text-indigo-900 transition-colors dark:text-indigo-400 dark:hover:text-indigo-200">
                      {article.title}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-left text-gray-700 dark:text-gray-200">
                    <span>{article.author?.username}</span>
                  </td>
                  <td className="py-4 px-6 text-left">
                    {/* CHANGE: Add dark mode classes to status badges */}
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold ${
                      article.status === 'published' ? 'bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-100' :
                      article.status === 'rejected' ? 'bg-red-200 text-red-700 dark:bg-red-700 dark:text-red-100' :
                      'bg-yellow-200 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center flex justify-center items-center space-x-2">
                    {/* CHANGE: Add dark mode classes to action icons */}
                    <button
                      onClick={() => handleViewClick(article._id)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors dark:text-indigo-400 dark:hover:text-indigo-200"
                      title={t('viewArticle')}
                    >
                      <FaEye />
                    </button>
                    {article.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleStatusChange(article._id, 'published')}
                                className="text-green-500 hover:text-green-700 transition-colors dark:text-green-400 dark:hover:text-green-200"
                                title={t('approve')}
                            >
                                <FaCheckCircle />
                            </button>
                            <button
                                onClick={() => handleStatusChange(article._id, 'rejected')}
                                className="text-red-500 hover:text-red-700 transition-colors dark:text-red-400 dark:hover:text-red-200"
                                title={t('reject')}
                            >
                                <FaTimesCircle />
                            </button>
                        </>
                    )}
                    {article.status === 'published' && (
                        <button
                          onClick={() => handleStatusChange(article._id, 'pending')}
                          className="text-gray-500 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
                          title={t('unpublish')}
                        >
                          <FaUndo />
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          {/* CHANGE: Add dark mode classes to the modal content */}
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 dark:bg-gray-800">
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedArticle.title}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 text-4xl leading-none dark:text-gray-400 dark:hover:text-gray-100">&times;</button>
            </div>
            <div className="text-gray-700 dark:text-gray-200">
              <p className="font-semibold text-sm mb-2">{t('author')}: {selectedArticle.author?.username}</p>
              <p className="font-semibold text-sm mb-4">{t('status')}: <span className={`py-1 px-2 rounded-full text-xs font-semibold ${
                      selectedArticle.status === 'published' ? 'bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-100' :
                      selectedArticle.status === 'rejected' ? 'bg-red-200 text-red-700 dark:bg-red-700 dark:text-red-100' :
                      'bg-yellow-200 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100'
                    }`}>
                      {selectedArticle.status}
                    </span>
              </p>
              <div className="prose max-w-none text-gray-800 dark:text-gray-200">
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