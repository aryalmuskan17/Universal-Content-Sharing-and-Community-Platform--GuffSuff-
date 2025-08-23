// src/pages/SingleArticle.jsx (Corrected with Comments Section and Dark Mode)

import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate, Link } from 'react-router-dom'; // CHANGE: Added Link
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import SubscribeButton from '../components/SubscribeButton';
import CommentSection from '../components/CommentSection';
import PayButton from '../components/PayButton';

const SingleArticle = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const isViewIncremented = useRef(false);
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext);

  const isLiked = user && article?.likedBy?.includes(user._id);

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

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please log in to like this article.');
      navigate('/login');
      return;
    }
    if (isLiked) {
      toast.info('You have already liked this article.');
      return;
    }
    try {
      await axios.patch(`http://localhost:5001/api/articles/${article._id}/like`);
      setArticle(prevArticle => ({
        ...prevArticle,
        likes: (prevArticle.likes || 0) + 1,
        likedBy: [...(prevArticle.likedBy || []), user._id]
      }));
      toast.success('Article liked!');
    } catch (err) {
      toast.error('Failed to like article.');
      console.error(err);
    }
  };

  const handleUnlike = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please log in to unlike this article.');
      navigate('/login');
      return;
    }
    try {
      await axios.patch(`http://localhost:5001/api/articles/${article._id}/unlike`);
      setArticle(prevArticle => ({
        ...prevArticle,
        likes: (prevArticle.likes || 1) - 1,
        likedBy: prevArticle.likedBy.filter(id => id !== user._id)
      }));
      toast.success('Article unliked!');
    } catch (err) {
      toast.error('Failed to unlike article.');
      console.error(err);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please log in to share this article.');
      navigate('/login');
      return;
    }
    try {
      const articleUrl = `${window.location.origin}/article/${article._id}`;
      await navigator.clipboard.writeText(articleUrl);
      await axios.patch(`http://localhost:5001/api/articles/${article._id}/share`);
      setArticle(prevArticle => ({
        ...prevArticle,
        shares: (prevArticle.shares || 0) + 1
      }));
      toast.success('Link copied to clipboard and share count updated!');
    } catch (err) {
      toast.error('Failed to copy link or share article.');
      console.error(err);
    }
  };

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
    } catch (err) {
      toast.error(`Failed to change article status.`);
      console.error(err);
    }
  };

  const handleApprove = () => handleStatusChange('published');
  const handleReject = () => handleStatusChange('rejected');

  if (loading) {
    return <div className="text-center p-8 text-xl font-medium text-gray-600 dark:text-gray-400">{t('loadingArticle')}</div>;
  }

  if (!article) {
    return <div className="text-center p-8 text-xl font-medium text-red-500">{t('articleNotFound')}</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-2xl my-8 dark:bg-gray-900 transition-colors duration-300">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <FaArrowLeft />
        <span>{t('backToArticles')}</span>
      </button>

      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 dark:text-gray-100">{article.title}</h1>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between text-gray-500 text-sm mb-6 font-medium dark:text-gray-400">
        <p className="mb-2 md:mb-0">
          {t('by')}: <span className="font-semibold">{article.author?.username}</span> | {t('publishedOn')}: {new Date(article.createdAt).toLocaleDateString()}
        </p>
        
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <button
            onClick={isLiked ? handleUnlike : handleLike}
            className={`py-2 px-4 text-sm font-semibold text-white rounded-lg transition-colors ${
              isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
          >
            {isLiked ? 'Unlike' : 'Like'}
          </button>
          
          <button
            onClick={handleShare}
            className="py-2 px-4 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Share
          </button>
          
          {/* NEW: Edit button for the author */}
          {article.author && user && user._id === article.author._id && (
            <Link 
              to={`/edit-article/${articleId}`}
              className="py-2 px-4 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
            >
              Edit Article
            </Link>
          )}

          {/* NEW: Pay Button for readers */}
          {user && user._id !== article.author._id && user.role === 'Reader' && (
              <PayButton
                  amount={100} // Example: A fixed amount to pay
                  purpose="publisher_payment"
                  publisherId={article.author._id}
                  articleId={articleId}
                  userToken={localStorage.getItem('token')}
              />
          )}


          {article.author && user?._id !== article.author._id && article.author.role !== 'Admin' && (  
            <SubscribeButton publisherId={article.author._id} />
          )}
        </div>
      </div>

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
      
      <div className="prose prose-lg max-w-none text-gray-700 dark:prose-invert dark:text-gray-300" dangerouslySetInnerHTML={{ __html: article.content }}></div>
      
      <div className="mt-10 flex flex-wrap gap-6 items-center text-gray-600 text-lg font-semibold dark:text-gray-400">
        <div className="flex items-center space-x-2">
            <span>{article.views || 0}</span>
            <span>Views</span>
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
      
      <div className="mt-12">
        <CommentSection articleId={articleId} articleAuthorId={article.author._id} />
      </div>

    </div>
  );
};

export default SingleArticle;