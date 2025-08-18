// client/src/pages/EditArticle.jsx (Styled Version with Dark Mode)

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext'; // CHANGE: Import ThemeContext
import { toast } from 'react-toastify';

const EditArticle = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext

  const [article, setArticle] = useState({ title: '', content: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5001/api/articles/${articleId}`, {
          headers: { 'x-auth-token': token }
        });
        setArticle(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError('Failed to fetch article.');
        setLoading(false);
        toast.error('Failed to fetch article.');
      }
    };
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setArticle(prevArticle => ({ ...prevArticle, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/articles/${articleId}`, article, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Article updated successfully!');
      navigate('/');
    } catch (err) {
      console.error('Failed to update article:', err);
      setError('Failed to update article.');
      toast.error('Failed to update article.');
    }
  };

  if (loading) {
    // CHANGE: Add dark mode text color
    return <div className="text-center p-8 text-xl font-medium text-gray-600 dark:text-gray-400">{t('loading')}...</div>;
  }
  if (error) {
    // CHANGE: No dark mode needed for red text
    return <div className="text-center p-8 text-red-500 font-medium">{error}</div>;
  }

  return (
    // CHANGE: Add dark mode classes to the main container
    <div className="bg-white p-6 rounded-xl shadow-lg my-8 max-w-4xl mx-auto dark:bg-gray-900 transition-colors duration-300">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 dark:text-gray-100">{t('editArticle')}</h2>
      
      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('title')}</label>
          <input
            type="text"
            name="title"
            value={article.title}
            onChange={handleEditChange}
            // CHANGE: Add dark mode classes to the input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('content')}</label>
          <textarea
            name="content"
            value={article.content}
            onChange={handleEditChange}
            // CHANGE: Add dark mode classes to the textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            rows="10"
            required
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('status')}</label>
          <select
            name="status"
            value={article.status}
            onChange={handleEditChange}
            // CHANGE: Add dark mode classes to the select input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          >
            <option value="draft">{t('draft')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="published">{t('published')}</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 text-white font-bold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t('updateArticle')}
        </button>
      </form>
    </div>
  );
};

export default EditArticle;