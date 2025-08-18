// client/src/components/PublisherAnalytics.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaThumbsUp, FaShareAlt, FaComments } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PublisherAnalytics = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        const res = await axios.get('http://localhost:5001/api/articles/publisher/analytics', {
          headers: {
            'x-auth-token': token,
          },
        });
        setArticles(res.data.data);
        setLoading(false);
      } catch (err) {
        toast.error(t('failedToFetchAnalytics'));
        console.error(err);
        setLoading(false);
      }
    };

    fetchAnalytics();
    
  }, [t]);

  if (loading) {
    return <div className="text-center p-8 text-xl font-medium text-gray-600">{t('loadingAnalytics')}</div>;
  }
  
  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);
  const totalShares = articles.reduce((sum, article) => sum + (article.shares || 0), 0);
  const totalComments = articles.reduce((sum, article) => sum + (article.commentCount || 0), 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg my-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">{t('yourArticlePerformance')}</h2>

      {articles.length > 0 ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow flex items-center space-x-4">
              <FaEye className="text-4xl text-indigo-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-800">{totalViews}</h3>
                <p className="text-gray-500">{t('totalViews')}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow flex items-center space-x-4">
              <FaThumbsUp className="text-4xl text-indigo-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-800">{totalLikes}</h3>
                <p className="text-gray-500">{t('totalLikes')}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow flex items-center space-x-4">
              <FaShareAlt className="text-4xl text-indigo-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-800">{totalShares}</h3>
                <p className="text-gray-500">{t('totalShares')}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow flex items-center space-x-4">
              <FaComments className="text-4xl text-indigo-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-800">{totalComments}</h3>
                <p className="text-gray-500">{t('totalComments')}</p>
              </div>
            </div>
          </div>
          
          {/* Detailed Table */}
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="text-gray-600 uppercase text-sm font-semibold bg-gray-50 border-b-2 border-gray-200">
                  <th className="py-3 px-6 text-left">{t('title')}</th>
                  <th className="py-3 px-6 text-left">{t('author')}</th>
                  <th className="py-3 px-6 text-center">{t('views')}</th>
                  <th className="py-3 px-6 text-center">{t('likes')}</th>
                  <th className="py-3 px-6 text-center">{t('shares')}</th>
                  <th className="py-3 px-6 text-center">{t('comments')}</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-left text-gray-700 font-medium whitespace-nowrap">
                       <Link to={`/article/${article._id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors">
                          {article.title}
                       </Link>
                    </td>
                    <td className="py-4 px-6 text-left text-gray-700 whitespace-nowrap">
                       {article.author ? article.author.username : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-700">
                      <Link to={`/article/${article._id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors">
                          {article.views}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-700">
                      <Link to={`/article/${article._id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors">
                          {article.likes}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-700">
                      <Link to={`/article/${article._id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors">
                          {article.shares}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-700">
                      <Link to={`/article/${article._id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors">
                          {article.commentCount}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center p-8 text-xl text-gray-500">
          {t('noArticlesFoundForAnalytics')}
        </div>
      )}
    </div>
  );
};

export default PublisherAnalytics;