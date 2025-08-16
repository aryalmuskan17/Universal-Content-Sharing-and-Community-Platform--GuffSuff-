// client/src/pages/ArticleList.jsx (Final Version)

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

  // NEW: State for sorting, 'date' is the default
  const [sortBy, setSortBy] = useState('date'); 

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const fetchArticles = async () => {
        setLoading(true);
        setError('');
        try {
          const token = localStorage.getItem('token');
          // The backend now handles role-based fetching and sorting from this single endpoint
          let apiUrl = 'http://localhost:5001/api/articles';
  
          // NEW: Add sortBy to the combined filters
          const combinedFilters = { ...filters, q: searchTerm, sortBy };
          
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

    }, 500);

    // NEW: Add sortBy to the dependency array
    return () => clearTimeout(delayDebounceFn);
  }, [filters, t, user, searchTerm, sortBy]);

  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };
  
  const handleEditClick = (articleId) => {
    navigate(`/edit-article/${articleId}`);
  };

  const onViewArticleClick = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  if (loading) return <div className="text-center p-8 text-xl font-medium text-gray-600">{t('loadingArticles')}</div>;
  if (error) return <div className="text-center p-8 text-xl font-medium text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">{t('latestArticles')}</h1>
      
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0 md:space-x-4">
        <input 
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
        />
        <div className="flex flex-wrap space-x-2">
          <button 
            onClick={() => handleFilterChange({ category: 'Sports' })} 
            className="py-2 px-4 rounded-lg font-medium text-sm transition-colors bg-gray-200 hover:bg-gray-300"
          >
            {t('sports')}
          </button>
          <button 
            onClick={() => handleFilterChange({ category: 'Technology' })} 
            className="py-2 px-4 rounded-lg font-medium text-sm transition-colors bg-gray-200 hover:bg-gray-300"
          >
            {t('technology')}
          </button>
          <button 
            onClick={() => handleFilterChange({ category: '' })} 
            className="py-2 px-4 rounded-lg font-medium text-sm transition-colors text-gray-600 hover:bg-gray-200"
          >
            {t('all')}
          </button>
        </div>
      </div>
      
      {/* NEW: Sorting Dropdown */}
      <div className="flex justify-end mb-6">
        <label htmlFor="sort-by" className="mr-2 text-sm font-medium text-gray-700">{t('sortBy')}</label>
        <select 
          id="sort-by"
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="date">{t('newestFirst')}</option>
          <option value="views">{t('mostViewed')}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div key={article._id} className="relative">
              <ArticleCard article={article} onViewArticleClick={onViewArticleClick} />
              {user && article.author && user._id === article.author._id && (
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => handleEditClick(article._id)}
                    className="bg-indigo-500 text-white p-2 rounded-full shadow-lg text-sm transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {t('edit')}
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 p-8 font-medium">{t('noArticlesFound')}</div>
        )}
      </div>
    </div>
  );
};

export default ArticleList;