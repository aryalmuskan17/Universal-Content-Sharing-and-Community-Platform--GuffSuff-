// client/src/pages/CreateArticle.jsx (Final Corrected Version)
import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateArticle = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    category: '',
    language: 'en',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error(t('mustBeLoggedIn'));
      setLoading(false);
      return;
    }

    try {
      const articleData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()),
      };

      const response = await axios.post(
        'http://localhost:5001/api/articles',
        articleData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token, // CORRECTED: Changed header to 'x-auth-token'
          },
        }
      );

      console.log('Article created successfully:', response.data);
      toast.success(t('articleSubmittedForReview'));
      
      setFormData({
        title: '',
        content: '',
        tags: '',
        category: '',
        language: 'en',
      });

    } catch (err) {
      console.error('Error creating article:', err.response?.data || err.message);
      toast.error(t('failedToCreateArticle'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('createArticle')}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">{t('title')}</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">{t('content')}</label>
          <textarea
            id="content"
            name="content"
            rows="10"
            value={formData.content}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">{t('tags')}</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder={t('tagsPlaceholder')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-200 focus:ring-opacity-50"
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">{t('category')}</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-200 focus:ring-opacity-50"
          />
        </div>
        
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">{t('language')}</label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-200 focus:ring-opacity-50"
          >
            <option value="en">{t('english')}</option>
            <option value="ne">{t('nepali')}</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? t('submitting') : t('submitArticle')}
        </button>
      </form>
    </div>
  );
};

export default CreateArticle;