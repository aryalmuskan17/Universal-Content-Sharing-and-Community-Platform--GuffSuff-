// src/pages/SingleArticle.jsx (Styled Version)

import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import { UserContext } from '../context/UserContext'; // NEW: Import UserContext
import SubscribeButton from '../components/SubscribeButton'; // NEW: Import SubscribeButton

const SingleArticle = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const isViewIncremented = useRef(false);
  const { t } = useTranslation();
  const { user } = useContext(UserContext); // NEW: Get user from context

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {},
        };
        if (token) {
          config.headers['x-auth-token'] = token;
        }

        const res = await axios.get(`http://localhost:5001/api/articles/${articleId}`, config);
        setArticle(res.data);
      } catch (err) {
        toast.error('Failed to fetch article');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    const incrementViews = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.patch(`http://localhost:5001/api/articles/${articleId}/view`, {}, {
            headers: {
              'x-auth-token': token,
            },
          });
        }
      } catch (err) {
        console.error('Failed to increment views:', err);
      }
    };

    if (articleId) {
      fetchArticle();
      if (!isViewIncremented.current) {
          incrementViews();
          isViewIncremented.current = true;
      }
    }
  }, [articleId]);

  // NEW: Admin approval/rejection handlers
  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.patch(
        `http://localhost:5001/api/articles/${articleId}/status`,
        { status: newStatus },
        config
      );
      setArticle(res.data.data);
      toast.success(`Article has been ${newStatus}.`);
      // Optional: navigate back to the feed after approval/rejection
      // navigate('/articles'); 
    } catch (err) {
      toast.error(`Failed to change article status.`);
      console.error(err);
    }
  };

  const handleApprove = () => handleStatusChange('published');
  const handleReject = () => handleStatusChange('rejected');

  if (loading) {
    return <div className="text-center p-8 text-xl font-medium text-gray-600">{t('loadingArticle')}</div>;
  }

  if (!article) {
    return <div className="text-center p-8 text-xl font-medium text-red-500">{t('articleNotFound')}</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-2xl my-8">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
      >
        <FaArrowLeft />
        <span>{t('backToArticles')}</span>
      </button>

      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">{article.title}</h1>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between text-gray-500 text-sm mb-6 font-medium">
        <p className="mb-2 md:mb-0">
          {t('by')}: <span className="font-semibold">{article.author?.username}</span> | {t('publishedOn')}: {new Date(article.createdAt).toLocaleDateString()}
        </p>
        
        {user && article.author && user._id !== article.author._id && article.author.role !== 'Admin' && (
          <div className="mt-2 md:mt-0">
            <SubscribeButton publisherId={article.author._id} />
          </div>
        )}
      </div>

      {/* NEW: Admin Approve/Reject buttons */}
      {user?.role === 'Admin' && article.status === 'pending' && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleApprove}
            className="flex-1 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={handleReject}
            className="flex-1 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {article.mediaUrl && (
          <div className="my-6">
              {article.mediaUrl.toLowerCase().match(/\.(jpeg|jpg|png|gif)$/) ? (
                  <img 
                      src={`http://localhost:5001/${article.mediaUrl}`} 
                      alt={article.title} 
                      className="w-full h-auto rounded-xl shadow-lg"
                  />
              ) : (
                  <video 
                      controls 
                      src={`http://localhost:5001/${article.mediaUrl}`} 
                      className="w-full h-auto rounded-xl shadow-lg"
                  />
              )}
          </div>
      )}
      
      <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: article.content }}></div>
      
      <div className="mt-10 flex flex-wrap gap-6 items-center text-gray-600 text-lg font-semibold">
        <div className="flex items-center space-x-2">
            <span>{article.views || 0}</span>
            <span>Likes</span>
        </div>
        <div className="flex items-center space-x-2">
            <span>{article.likes || 0}</span>
            <span>Likes</span>
        </div>
        <div className="flex items-center space-x-2">
            <span>{article.shares || 0}</span>
            <span>Shares</span>
        </div>
      </div>
    </div>
  );
};

export default SingleArticle;