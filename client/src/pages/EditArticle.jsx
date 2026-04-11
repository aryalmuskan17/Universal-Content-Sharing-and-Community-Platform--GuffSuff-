// client/src/pages/EditArticle.jsx 

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Define the categories, consistent with other components that use them.
const categories = ['Sports', 'Technology', 'Science', 'Health', 'Business', 'Entertainment'];

// This component provides a form to edit an existing article.
const EditArticle = () => {
  // Extract the article ID from the URL parameters
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode } = useContext(ThemeContext);
  // Get the logged-in user from the context to check for their role
  const { user } = useContext(UserContext); // Get the user object from context

  // State to hold the article data for the form
  const [article, setArticle] = useState({ 
    title: '', 
    content: '', 
    status: '',
    category: '',
    tags: '',
    language: 'en'
  });
  const [media, setMedia] = useState(null);
  // State to manage loading status
  const [loading, setLoading] = useState(true);
  // State for any error messages
  const [error, setError] = useState('');
    const handleContentChange = (value) => {
    setArticle(prevArticle => ({ ...prevArticle, content: value }));
  };
  // Effect hook to fetch the specific article's data when the component mounts or articleId changes
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5001/api/articles/${articleId}`, {
          headers: { 'x-auth-token': token }
        });
        const data = response.data;
          setArticle({
            ...data,
            tags: data.tags ? data.tags.join(', ') : '' 
          });
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError('Failed to fetch article.');
        setLoading(false);
        toast.error(t('failedToFetchArticle'));
      }
    };
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  // Handler for text and select input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    // Update the corresponding field in the article state
    setArticle(prevArticle => ({ ...prevArticle, [name]: value }));
  };

  // Handler for form submission to update the article
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Store the original status to compare after the update
      const originalStatus = article.status;
      
      // Send a PUT request with the updated article data
      const editData = new FormData();
        editData.append('title', article.title);
        editData.append('content', article.content);
        editData.append('category', article.category);
        editData.append('tags', article.tags);
        editData.append('language', article.language);
        if (article.status) editData.append('status', article.status);
        if (media) editData.append('media', media);

        const response = await axios.put(`http://localhost:5001/api/articles/${articleId}`, editData, {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data' 
          }
        });
      // Update the state with the new data from the response
      setArticle(response.data.data);

      const updatedData = response.data.data;
        setArticle({
          ...updatedData,
          tags: updatedData.tags ? updatedData.tags.join(', ') : ''
        });

      const newStatus = response.data.data.status;
      // Provide user feedback with a specific message if the status changed
      if (originalStatus !== newStatus) {
        toast.success(t('articleStatusUpdatedTo', { status: newStatus }));
      } else {
        toast.success(t('articleUpdatedSuccessfully'));
      }

    } catch (err) {
      console.error('Failed to update article:', err);
      setError('Failed to update article.');
      toast.error(t('failedToUpdateArticle'));
    }
  };

    const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean'],
    ],
  };

  // Conditional rendering for loading state
  if (loading) {
    return <div className="text-center p-8 text-xl font-medium text-gray-600 dark:text-gray-400">{t('loading')}...</div>;
  }
  // Conditional rendering for error state
  if (error) {
    return <div className="text-center p-8 text-red-500 font-medium">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg my-8 max-w-4xl mx-auto dark:bg-gray-900 transition-colors duration-300">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 dark:text-gray-100">{t('editArticle')}</h2>
      
      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('title')}</label>
          <input
            type="text"
            name="title"
            value={article.title}
            onChange={handleEditChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            required
          />
        </div>
        
        {/* Content Textarea */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('content')}</label>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden relative z-0">
            <ReactQuill
              theme="snow"
              value={article.content}
              onChange={handleContentChange}
              modules={modules}
              className="dark:text-gray-100"
            />
          </div>
          <style>{`
            .ql-container { min-height: 250px; font-size: 16px; }
            .dark .ql-toolbar.ql-snow { background-color: #1f2937 !important; border-color: #374151 !important; }
            .dark .ql-container.ql-snow { background-color: #1f2937 !important; border-color: #374151 !important; }
            .dark .ql-snow .ql-stroke { stroke: #f3f4f6 !important; }
            .dark .ql-snow .ql-fill { fill: #f3f4f6 !important; }
            .dark .ql-snow .ql-picker { color: #f3f4f6 !important; }
            .dark .ql-snow .ql-picker-options { background-color: #1f2937 !important; border-color: #4b5563 !important; }
          `}</style>
          </div>
        {/* Media Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('media')}</label>
            <input 
              type="file" 
              onChange={(e) => setMedia(e.target.files[0])} 
              className="w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-gray-800 dark:file:text-indigo-400" 
            />
          </div>

          {/* Tags Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('tags')}</label>
              <input 
                type="text" 
                name="tags" 
                value={article.tags} 
                onChange={handleEditChange} 
                placeholder="e.g. tech, news, nepal"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none" 
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
            value={article.category}
            onChange={handleEditChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          >
            <option value="" disabled>{t('selectCategory')}</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {t(cat.toLowerCase())}
              </option>
            ))}
          </select>
          </div>
            {/* Language Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('language')}</label>
              <select 
                name="language" 
                value={article.language} 
                onChange={handleEditChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="en">{t('english')}</option>
                <option value="ne">{t('nepali')}</option>
              </select>
            </div>
        
        {/* CRITICAL FIX: Conditionally render the status dropdown for admins only */}
        {user && user.role === 'Admin' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">{t('status')}</label>
            <select
              name="status"
              value={article.status}
              onChange={handleEditChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="draft">{t('draft')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="published">{t('published')}</option>
            </select>
          </div>
        )}
        
        {/* Submit Button */}
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