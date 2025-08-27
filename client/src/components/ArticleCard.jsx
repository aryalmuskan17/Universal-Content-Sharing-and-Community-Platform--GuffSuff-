// client/src/components/ArticleCard.jsx

import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import SubscribeButton from './SubscribeButton';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

// ArticleCard component receives an article object as a prop
const ArticleCard = ({ article }) => {
  const { t } = useTranslation();
  const [currentArticle, setCurrentArticle] = useState(article); // State to manage the article's data (e.g., likes, shares)
  const { user } = useContext(UserContext); // Access user data from context
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Check if the current user has already liked the article
  const isLiked = user && currentArticle?.likedBy?.includes(user._id);

  // If the article is rejected, do not render the card
  if (currentArticle.status === 'rejected') {
    return null;
  }

  // Generate a short snippet of the article content for the card
  const contentSnippet = currentArticle.content.substring(0, 150) + '...';
  // Format the article creation date
  const formattedDate = new Date(currentArticle.createdAt).toLocaleDateString();

  // --- Event Handlers ---

  // Handles the like action for the article
  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) { // Check if the user is logged in
      toast.info(t('loginToLikeMessage'));
      navigate('/login');
      return;
    }
    if (isLiked) { // Check if the user has already liked it
      toast.info(t('alreadyLikedMessage'));
      return;
    }
    try {
      // Send a request to the server to like the article
      await axios.patch(`http://localhost:5001/api/articles/${currentArticle._id}/like`);
      
      // Optimistically update the local state to show the change immediately
      setCurrentArticle(prevArticle => ({
        ...prevArticle,
        likes: (prevArticle.likes || 0) + 1,
        likedBy: [...(prevArticle.likedBy || []), user._id]
      }));
      
      toast.success(t('articleLikedSuccess'));
    } catch (err) {
      toast.error(t('articleLikeFailure'));
      console.error(err);
    }
  };

  // Handles the unlike action for the article
  const handleUnlike = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please log in to unlike this article.');
      navigate('/login');
      return;
    }
    try {
      await axios.patch(`http://localhost:5001/api/articles/${currentArticle._id}/unlike`);
      
      // Update the local state to decrement the like count
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

  // Handles the share action, copies the link to the clipboard and updates share count
  const handleShare = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info(t('loginToShareMessage'));
      navigate('/login');
      return;
    }
    try {
      const articleUrl = `${window.location.origin}/article/${currentArticle._id}`;
      await navigator.clipboard.writeText(articleUrl); // Copy the article URL to the clipboard
      
      await axios.patch(`http://localhost:5001/api/articles/${currentArticle._id}/share`);
      
      toast.error(t('articleShareFailure'));
    } catch (err) {
      toast.error('Failed to copy link or share article.');
      console.error(err);
    }
  };

  // Navigates to the full article page when the card is clicked
  const handleArticleClick = () => {
    navigate(`/article/${currentArticle._id}`);
  };

  // Handles changing the article's status (for admin actions)
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
      setCurrentArticle(res.data.data); // Update article state with new data from the server
      toast.success(t('articleStatusChangeSuccess', { status: newStatus }));
    } catch (err) {
      toast.error(t('articleStatusChangeFailure'));
      console.error(err);
    }
  };

  // Helper functions for specific status changes
  const handleApprove = (e) => handleStatusChange(e, 'published');
  const handleReject = (e) => handleStatusChange(e, 'rejected');
  
  // Handles navigation to the comments section
  const handleCommentClick = (e) => {
    e.stopPropagation();
    navigate(`/article/${currentArticle._id}`);
  };

  // --- Component JSX ---

  return (
    <div 
      // Add dark mode styles and hover effects to the card container
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer flex flex-col h-full dark:bg-gray-900 dark:text-gray-100 dark:hover:shadow-lg dark:hover:shadow-indigo-500/50"
      onClick={handleArticleClick}
    >
      {/* Conditionally render media (image or video) if available */}
      {currentArticle.mediaUrl && (
        <div className="h-56 w-full overflow-hidden">
          {/* Check file extension to render image or video */}
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

      {/* Main content area of the card */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          {/* Article category */}
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide dark:text-indigo-400">
            {currentArticle.category || t('uncategorized')}
          </span>
          
          {/* Article title */}
          <h2 className="mt-2 text-2xl font-bold leading-tight text-gray-900 line-clamp-2 dark:text-gray-100">
            {currentArticle.title}
          </h2>
          
          {/* Article content snippet */}
          <p className="mt-4 text-gray-500 line-clamp-3 dark:text-gray-300">
            {contentSnippet}
          </p>
        </div>
        
        {/* Author information and subscribe button */}
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
            {/* Conditionally render subscribe button */}
            {currentArticle.author && user?._id !== currentArticle.author._id && currentArticle.author.role !== 'Admin' && (
              <SubscribeButton publisherId={currentArticle.author._id} />
            )}
          </div>
        </div>
        
        {/* Article stats section (views, likes, shares, comments) */}
        <div className="mt-4 flex flex-wrap gap-4 items-center text-gray-500 text-sm dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <span className="font-semibold">{currentArticle.views || 0}</span>
            <span>{t('views')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-semibold">{currentArticle.likes || 0}</span>
            <span>{t('likes')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-semibold">{currentArticle.shares || 0}</span>
            <span>{t('shares')}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="font-semibold">{currentArticle.commentCount || 0}</span>
            <span>{t('comments')}</span>
          </div>
          
          {/* Formatted date */}
          <div className="ml-auto text-sm text-gray-400">
            {formattedDate}
          </div>
        </div>
        
        {/* Buttons for interaction (Admin actions vs. Publishers) */}
        <div className="mt-4 flex space-x-2">
          {/* Show Approve/Reject buttons for Admin if article is pending */}
          {user?.role === 'Admin' && currentArticle.status === 'pending' ? (
            <>
              <button
                onClick={handleApprove}
                className="flex-1 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
              >
                {t('approve')}
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                {t('reject')}
              </button>
            </>
          ) : (
            // Show Like, Share, Comment buttons for other users
            <>
              <button
                onClick={isLiked ? handleUnlike : handleLike}
                className={`flex-1 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${
                  isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'
                }`}
              >
                {isLiked ? t('unlike') : t('like')}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('share')}
              </button>
              
              <button
                onClick={handleCommentClick}
                className="flex-1 py-2 text-sm font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors"
              >
                {t('comment')}
              </button>
            </>
          )}
        </div>

        {/* Display tags if they exist */}
        {currentArticle.tags && currentArticle.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentArticle.tags.map(tag => (
              // Add dark mode styles to the tags
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