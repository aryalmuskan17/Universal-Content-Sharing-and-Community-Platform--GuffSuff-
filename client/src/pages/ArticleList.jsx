// client/src/pages/ArticleList.jsx (Final Corrected Version - Inline Debounce)

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import ArticleCard from '../components/ArticleCard';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const ArticleList = () => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: '', tags: '' });
  const [searchTerm, setSearchTerm] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    // NEW: Debounce the API call
    const delayDebounceFn = setTimeout(() => {
      const fetchArticles = async () => {
        setLoading(true);
        setError('');
        try {
          const token = localStorage.getItem('token');
          let apiUrl = 'http://localhost:5001/api/articles';
  
          if (user?.role === 'Admin') {
              apiUrl = 'http://localhost:5001/api/articles/admin/all';
          }
  
          const combinedFilters = { ...filters, q: searchTerm }; // Use the current searchTerm
          
          const config = {
            params: combinedFilters,
            headers: {
              'x-auth-token': token,
            },
          };
          const response = await axios.get(apiUrl, config);
          setArticles(response.data.data);
        } catch (err) {
          setError(t('failedToFetchArticles'));
          toast.error(t('failedToFetchArticles'));
        } finally {
          setLoading(false);
        }
      };

      fetchArticles();

    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn); // Clear the timeout if searchTerm changes
  }, [filters, t, user, searchTerm]); // UPDATED: Dependency is now searchTerm

  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };
  
  const handleEditClick = (articleId) => {
    navigate(`/edit-article/${articleId}`);
  };

  const onViewArticleClick = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  if (loading) return <div className="text-center p-4">{t('loadingArticles')}</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('latestArticles')}</h1>
      
      <div className="mb-6">
        <input 
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />
        <div className="flex space-x-4">
          <button onClick={() => handleFilterChange({ category: 'Sports' })} className="py-2 px-4 bg-gray-200 rounded-md">{t('sports')}</button>
          <button onClick={() => handleFilterChange({ category: 'Technology' })} className="py-2 px-4 bg-gray-200 rounded-md">{t('technology')}</button>
          <button onClick={() => handleFilterChange({ category: '' })} className="py-2 px-4 text-gray-500">{t('all')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.length > 0 ? (
          articles.map((article) => {
            return (
              <div key={article._id}>
                <ArticleCard article={article} onViewArticleClick={onViewArticleClick} />
                {user && article.author && user._id === article.author._id && (
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => handleEditClick(article._id)}
                      className="bg-blue-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-blue-600"
                    >
                      {t('edit')}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500">{t('noArticlesFound')}</div>
        )}
      </div>
    </div>
  );
};

export default ArticleList;