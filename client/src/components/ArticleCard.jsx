// src/components/ArticleCard.jsx (Final Corrected Version)

import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css"; // CORRECTED: Fixed the file name
import SubscribeButton from './SubscribeButton';
import { UserContext } from '../context/UserContext';

const ArticleCard = ({ article, onViewArticleClick }) => {
  const { t } = useTranslation();
  const [currentArticle, setCurrentArticle] = useState(article);
  const { user } = useContext(UserContext);

  const contentSnippet = currentArticle.content.substring(0, 150) + '...';
  const formattedDate = new Date(currentArticle.createdAt).toLocaleDateString();

  const handleLike = async () => {
    try {
      const res = await axios.patch(`http://localhost:5001/api/articles/${currentArticle._id}/like`);
      setCurrentArticle(res.data.data);
      toast.success('Article liked!');
    } catch (err) {
      toast.error('Failed to like article.');
      console.error(err);
    }
  };

  const handleShare = async () => {
    try {
      const res = await axios.patch(`http://localhost:5001/api/articles/${currentArticle._id}/share`);
      setCurrentArticle(res.data.data);
      toast.success('Article shared!');
    } catch (err) {
      toast.error('Failed to share article.');
      console.error(err);
    }
  };

  const handleArticleClick = () => {
    onViewArticleClick(currentArticle._id);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transition-transform duration-200 hover:scale-105">
      <div className="p-6">
        <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
          {currentArticle.category || t('uncategorized')}
        </div>
        
        <h2 
          className="block mt-1 text-2xl leading-tight font-medium text-black hover:underline cursor-pointer"
          onClick={handleArticleClick}
        >
          {currentArticle.title}
        </h2>
        
        <p className="mt-2 text-gray-500">
          {contentSnippet}
        </p>
        
        <div className="mt-4 flex items-center space-x-2">
          <div className="text-gray-400 text-sm">
            <span className="font-semibold">{t('by')}:</span> {currentArticle.author?.username || 'Unknown'}
          </div>

          {user && currentArticle.author && user._id !== currentArticle.author._id && (
            <SubscribeButton publisherId={currentArticle.author._id} />
          )}

          <span className="ml-4 text-gray-400 text-sm">
            <span className="font-semibold">{t('publishedOn')}:</span> {formattedDate}
          </span>
        </div>

        <div className="mt-4 flex items-center space-x-4 text-gray-500 text-sm">
            <span className="flex items-center">
                <span className="font-semibold">{currentArticle.views || 0}</span> Views
            </span>
            <span className="flex items-center">
                <span className="font-semibold">{currentArticle.likes || 0}</span> Likes
            </span>
            <span className="flex items-center">
                <span className="font-semibold">{currentArticle.shares || 0}</span> Shares
            </span>
        </div>
        
        <div className="mt-4 flex space-x-2">
            <button
                onClick={handleLike}
                className="bg-green-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-green-600 transition-colors"
            >
                Like
            </button>
            <button
                onClick={handleShare}
                className="bg-blue-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
                Share
            </button>
        </div>

        {currentArticle.tags && currentArticle.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentArticle.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
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