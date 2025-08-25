//client/src/pages/CreateArticle.jsx

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeContext } from '../context/ThemeContext';

// Define the categories, consistent with other components that use them.
const categories = ['Sports', 'Technology', 'Science', 'Health', 'Business', 'Entertainment'];

// This component provides a form for publishers to create and submit a new article.
const CreateArticle = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useContext(ThemeContext);

  // State to manage all form data fields
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    category: '',
    language: 'en',
  });

  // State to manage the selected media file
  const [media, setMedia] = useState(null);
  // State to manage the loading status of the submission
  const [loading, setLoading] = useState(false);

  // General handler for text and select input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Handler specifically for file input changes
  const handleFileChange = (e) => {
    setMedia(e.target.files[0]);
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    
    // Check if the user is authenticated before proceeding
    if (!token) {
      toast.error(t('mustBeLoggedIn'));
      setLoading(false);
      return;
    }

    try {
      // Split and trim the tags string into an array
      const articleTags = formData.tags.split(',').map(tag => tag.trim());
      
      // Use FormData to correctly handle both text fields and a file upload
      const articleFormData = new FormData();
      articleFormData.append('title', formData.title);
      articleFormData.append('content', formData.content);
      articleFormData.append('tags', articleTags);
      articleFormData.append('category', formData.category);
      articleFormData.append('language', formData.language);

      if (media) {
        articleFormData.append('media', media);
      }

      // Make the POST request to the API
      await axios.post(
        'http://localhost:5001/api/articles',
        articleFormData,
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );

      console.log('Article created successfully');
      toast.success(t('articleSubmittedForReview'));
      
      // Reset the form state upon successful submission
      setFormData({
        title: '',
        content: '',
        tags: '',
        category: '',
        language: 'en',
      });
      setMedia(null);
    } catch (err) {
      console.error('Error creating article:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || t('failedToCreateArticle'));
    } finally {
      // Always set loading to false after the request completes
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg dark:bg-gray-900 transition-colors duration-300">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6 dark:text-gray-100">{t('createArticle')}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">
              {t('title')}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">
              {t('content')}
            </label>
            <textarea
              id="content"
              name="content"
              rows="10"
              value={formData.content}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            ></textarea>
          </div>
          
          {/* Media File Input */}
          <div>
            <label htmlFor="media" className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">
              {t('media')}
            </label>
            <input
              type="file"
              id="media"
              name="media"
              onChange={handleFileChange}
              className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors dark:text-gray-300 dark:file:bg-indigo-900 dark:file:text-indigo-200 dark:hover:file:bg-indigo-800"
            />
          </div>
          
          {/* Tags Input */}
          <div>
            <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">
              {t('tags')}
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder={t('tagsPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          
          {/* Category Select */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">
              {t('category')}
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="" disabled>{t('selectCategory')}</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          {/* Language Select */}
          <div>
            <label htmlFor="language" className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">
              {t('language')}
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="en">{t('english')}</option>
              <option value="ne">{t('nepali')}</option>
            </select>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-white font-bold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600"
          >
            {loading ? t('submitting') : t('submitArticle')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateArticle;