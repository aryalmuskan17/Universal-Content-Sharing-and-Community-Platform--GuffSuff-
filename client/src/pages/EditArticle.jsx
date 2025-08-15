// client/src/pages/EditArticle.jsx (Styled Version)

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';

const EditArticle = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    return <div className="text-center p-8 text-xl font-medium text-gray-600">{t('loading')}...</div>;
  }
  if (error) {
    return <div className="text-center p-8 text-red-500 font-medium">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg my-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('editArticle')}</h2>
      
      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t('title')}</label>
          <input
            type="text"
            name="title"
            value={article.title}
            onChange={handleEditChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t('content')}</label>
          <textarea
            name="content"
            value={article.content}
            onChange={handleEditChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            rows="10"
            required
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t('status')}</label>
          <select
            name="status"
            value={article.status}
            onChange={handleEditChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
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