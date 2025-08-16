// client/src/components/ArticleCard.jsx (Final Corrected Version)

import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import SubscribeButton from './SubscribeButton';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const ArticleCard = ({ article }) => {
  const { t } = useTranslation();
  const [currentArticle, setCurrentArticle] = useState(article);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // If the article is already rejected, don't show it in the feed
  if (currentArticle.status === 'rejected') {
    return null;
  }

  const contentSnippet = currentArticle.content.substring(0, 150) + '...';
  const formattedDate = new Date(currentArticle.createdAt).toLocaleDateString();

  // UPDATED: Now redirects to login if the user is not logged in
  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please log in to like this article.');
      navigate('/login');
      return;
    }
    try {
      // Step 1: Call the API to update the like count on the backend
      await axios.patch(`http://localhost:5001/api/articles/${currentArticle._id}/like`);
      
      // Step 2: Manually update the likes count in the state
      setCurrentArticle(prevArticle => ({
        ...prevArticle,
        likes: (prevArticle.likes || 0) + 1
      }));
      
      toast.success('Article liked!');
    } catch (err) {
      toast.error('Failed to like article.');
      console.error(err);
    }
  };

  // UPDATED: Now redirects to login if the user is not logged in
  const handleShare = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please log in to share this article.');
      navigate('/login');
      return;
    }
    try {
      // Step 1: Construct the article URL
      const articleUrl = `${window.location.origin}/article/${currentArticle._id}`;

      // Step 2: Copy the URL to the clipboard
      await navigator.clipboard.writeText(articleUrl);
      
      // Step 3: Call the API to increment the share count
      await axios.patch(`http://localhost:5001/api/articles/${currentArticle._id}/share`);
      
      // Step 4: Provide feedback to the user
      toast.success('Link copied to clipboard and share count updated!');
    } catch (err) {
      toast.error('Failed to copy link or share article.');
      console.error(err);
    }
  };

  const handleArticleClick = () => {
    navigate(`/article/${currentArticle._id}`);
  };

  // NEW: Admin approval/rejection handlers
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

  return (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer flex flex-col h-full"
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
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            {currentArticle.category || t('uncategorized')}
          </span>
          
          <h2 className="mt-2 text-2xl font-bold leading-tight text-gray-900 line-clamp-2">
            {currentArticle.title}
          </h2>
          
          <p className="mt-4 text-gray-500 line-clamp-3">
            {contentSnippet}
          </p>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="text-sm text-gray-400">
              <span className="font-semibold">{t('by')}:</span>
            </div>
            <div className="text-sm font-medium text-gray-700">
              {currentArticle.author?.username || 'Unknown'}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {currentArticle.author && user?._id !== currentArticle.author._id && currentArticle.author.role !== 'Admin' && (
              <SubscribeButton publisherId={currentArticle.author._id} />
            )}
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4 items-center text-gray-500 text-sm">
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
          <div className="ml-auto text-sm text-gray-400">
            {formattedDate}
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          {user?.role === 'Admin' && currentArticle.status === 'pending' ? (
            // Render Approve/Reject buttons for admin on pending articles
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
            // Existing Like/Share buttons for other users/statuses
            <>
              <button
                onClick={handleLike}
                className="flex-1 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Like
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Share
              </button>
            </>
          )}
        </div>

        {currentArticle.tags && currentArticle.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentArticle.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
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