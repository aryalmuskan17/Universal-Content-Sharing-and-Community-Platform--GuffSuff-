// client/src/pages/EditArticle.jsx (Final Corrected Version)
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';

const EditArticle = () => {
  const { articleId } = useParams(); // CORRECTED: Get 'articleId' from the URL
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  const [article, setArticle] = useState({ title: '', content: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const token = localStorage.getItem('token');
        // Use the correct variable name 'articleId'
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
    // Use the correct variable name 'articleId'
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
      // Use the correct variable name 'articleId'
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

  if (loading) return <div className="text-center mt-10">{t('loading')}...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">{t('editArticle')}</h2>
      
      <form onSubmit={handleUpdate} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">{t('title')}</label>
          <input
            type="text"
            name="title"
            value={article.title}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">{t('content')}</label>
          <textarea
            name="content"
            value={article.content}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
            rows="10"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">{t('status')}</label>
          <select
            name="status"
            value={article.status}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          {t('updateArticle')}
        </button>
      </form>
    </div>
  );
};

export default EditArticle;