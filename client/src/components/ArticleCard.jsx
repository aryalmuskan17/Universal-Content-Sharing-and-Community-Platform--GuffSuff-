// client/src/components/ArticleCard.jsx (Final Corrected Version with Dark Mode)

import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import SubscribeButton from './SubscribeButton';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext'; // CHANGE: Import ThemeContext
import { useNavigate } from 'react-router-dom';

const ArticleCard = ({ article }) => {
  const { t } = useTranslation();
  const [currentArticle, setCurrentArticle] = useState(article);
  const { user } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext
  const navigate = useNavigate();

  const isLiked = user && currentArticle?.likedBy?.includes(user._id);

  if (currentArticle.status === 'rejected') {
    return null;
  }

  const contentSnippet = currentArticle.content.substring(0, 150) + '...';
  const formattedDate = new Date(currentArticle.createdAt).toLocaleDateString();

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
      await axios.patch(`http://localhost:5001/api/articles/${currentArticle._id}/like`);
      
      setCurrentArticle(prevArticle => ({
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
      await axios.patch(`http://localhost:5001/api/articles/${currentArticle._id}/unlike`);
      
      setCurrentArticle(prevArticle => ({
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
      const articleUrl = `${window.location.origin}/article/${currentArticle._id}`;

      await navigator.clipboard.writeText(articleUrl);
      
      await axios.patch(`http://localhost:5001/api/articles/${currentArticle._id}/share`);
      
      toast.success('Link copied to clipboard and share count updated!');
    } catch (err) {
      toast.error('Failed to copy link or share article.');
      console.error(err);
    }
  };

  const handleArticleClick = () => {
    navigate(`/article/${currentArticle._id}`);
  };

  const handleStatusChange = async (e, newStatus) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.patch(
        `http://localhost:5001/api/articles/${currentArticle._id}/status`,
        { status: newStatus },
        config
      );
      setCurrentArticle(res.data.data);
      toast.success(`Article has been ${newStatus}.`);
    } catch (err) {
      toast.error(`Failed to change article status.`);
      console.error(err);
    }
  };

  const handleApprove = (e) => handleStatusChange(e, 'published');
  const handleReject = (e) => handleStatusChange(e, 'rejected');
  
  const handleCommentClick = (e) => {
    e.stopPropagation();
    navigate(`/article/${currentArticle._id}`);
  };

  return (
    <div 
      // CHANGE: Add dark mode styles to the main container
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer flex flex-col h-full dark:bg-gray-900 dark:text-gray-100 dark:hover:shadow-lg dark:hover:shadow-indigo-500/50"
      onClick={handleArticleClick}
    >
      {currentArticle.mediaUrl && (
        <div className="h-56 w-full overflow-hidden">
          {currentArticle.mediaUrl.toLowerCase().match(/\.(jpeg|jpg|png|gif)$/) ? (
            <img
              src={`http://localhost:5001/${currentArticle.mediaUrl}`}
              alt={currentArticle.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <video
              controls
              src={`http://localhost:5001/${currentArticle.mediaUrl}`}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      )}

      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide dark:text-indigo-400">
            {currentArticle.category || t('uncategorized')}
          </span>
          
          <h2 className="mt-2 text-2xl font-bold leading-tight text-gray-900 line-clamp-2 dark:text-gray-100">
            {currentArticle.title}
          </h2>
          
          <p className="mt-4 text-gray-500 line-clamp-3 dark:text-gray-300">
            {contentSnippet}
          </p>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="text-sm text-gray-400">
              <span className="font-semibold">{t('by')}:</span>
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {currentArticle.author?.username || 'Unknown'}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {currentArticle.author && user?._id !== currentArticle.author._id && currentArticle.author.role !== 'Admin' && (
              <SubscribeButton publisherId={currentArticle.author._id} />
            )}
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4 items-center text-gray-500 text-sm dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <span className="font-semibold">{currentArticle.views || 0}</span>
            <span>Views</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-semibold">{currentArticle.likes || 0}</span>
            <span>Likes</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-semibold">{currentArticle.shares || 0}</span>
            <span>Shares</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="font-semibold">{currentArticle.commentCount || 0}</span>
            <span>Comments</span>
          </div>
          
          <div className="ml-auto text-sm text-gray-400">
            {formattedDate}
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          {user?.role === 'Admin' && currentArticle.status === 'pending' ? (
            <>
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
            </>
          ) : (
            <>
              <button
                onClick={isLiked ? handleUnlike : handleLike}
                className={`flex-1 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${
                  isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'
                }`}
              >
                {isLiked ? 'Unlike' : 'Like'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Share
              </button>
              
              <button
                onClick={handleCommentClick}
                className="flex-1 py-2 text-sm font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Comment
              </button>
            </>
          )}
        </div>

        {currentArticle.tags && currentArticle.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentArticle.tags.map(tag => (
              // CHANGE: Add dark mode styles to tags
              <span key={tag} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium dark:bg-gray-700 dark:text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleCard;