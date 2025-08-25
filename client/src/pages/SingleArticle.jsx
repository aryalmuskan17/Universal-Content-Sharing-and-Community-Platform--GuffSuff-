// src/pages/SingleArticle.jsx 

import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import SubscribeButton from '../components/SubscribeButton';
import CommentSection from '../components/CommentSection';
import PayButton from '../components/PayButton';

// This component displays a single article, handling all user interactions like views, likes, shares, comments, and donations.
const SingleArticle = () => {
  // `useParams` hook extracts the articleId from the URL
  const { articleId } = useParams();
  const navigate = useNavigate();
  // State for the article data
  const [article, setArticle] = useState(null);
  // State for loading status
  const [loading, setLoading] = useState(true);
  // `useRef` to ensure the view count is incremented only once per page load, not on every re-render
  const isViewIncremented = useRef(false);
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext);
  
  // State for the donation amount, starting with a default value
  const [donationAmount, setDonationAmount] = useState(100);
  // State to control visibility of the donation input field
  const [showDonationInput, setShowDonationInput] = useState(false);

  // Derived state to check if the current user has already liked the article
  const isLiked = user && article?.likedBy?.includes(user._id);

  // Main effect hook for fetching article data and incrementing views
  useEffect(() => {
    // Function to fetch the article data from the backend
    const fetchArticle = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {},
        };
        // Include the auth token if the user is logged in
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
    
    // Function to increment the article's view count
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
      // Use the ref to ensure `incrementViews` is called only once
      if (!isViewIncremented.current) {
          incrementViews();
          isViewIncremented.current = true;
      }
    }
  }, [articleId]); // Effect re-runs only when the article ID changes

  // Handler for liking an article
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
      // Optimistically update the UI to show the new like count and user ID
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

  // Handler for unliking an article
  const handleUnlike = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please log in to unlike this article.');
      navigate('/login');
      return;
    }
    try {
      await axios.patch(`http://localhost:5001/api/articles/${article._id}/unlike`);
      // Optimistically update the UI by decrementing the like count and removing the user's ID
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

  // Handler for sharing an article
  const handleShare = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please log in to share this article.');
      navigate('/login');
      return;
    }
    try {
      const articleUrl = `${window.location.origin}/article/${article._id}`;
      // Use the Clipboard API to copy the article's URL
      await navigator.clipboard.writeText(articleUrl);
      // Update the share count on the backend
      await axios.patch(`http://localhost:5001/api/articles/${article._id}/share`);
      // Optimistically update the share count in the UI
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

  // Handler for changing an article's status (for admins)
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

  // Helper functions for admin status changes
  const handleApprove = () => handleStatusChange('published');
  const handleReject = () => handleStatusChange('rejected');

  // Conditional rendering for loading and error states
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

      {/* Article Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 dark:text-gray-100">{article.title}</h1>
      
      {/* Article Meta Data */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between text-gray-500 text-sm mb-6 font-medium dark:text-gray-400">
        <p className="mb-2 md:mb-0">
          {t('by')}: <span className="font-semibold">{article.author?.username}</span> | {t('publishedOn')}: {new Date(article.createdAt).toLocaleDateString()}
        </p>
        
        {/* User Interaction Buttons */}
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          {/* Like/Unlike Button */}
          <button
            onClick={isLiked ? handleUnlike : handleLike}
            className={`py-2 px-4 text-sm font-semibold text-white rounded-lg transition-colors ${
              isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
          >
            {isLiked ? 'Unlike' : 'Like'}
          </button>
          
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="py-2 px-4 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Share
          </button>
          
          {/* Edit button, only visible to the article's author */}
          {article.author && user && user._id === article.author._id && (
            <Link 
              to={`/edit-article/${articleId}`}
              className="py-2 px-4 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
            >
              Edit Article
            </Link>
          )}

          {/* Subscribe button, only visible to non-author readers */}
          {article.author && user?._id !== article.author._id && user.role !== 'Admin' && (  
            <SubscribeButton publisherId={article.author._id} />
          )}
        </div>
      </div>

      {/* Admin Action Buttons, only visible to an Admin for pending articles */}
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

      {/* Article Media (Image or Video) */}
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
      
      {/* Article Content */}
      <div className="prose prose-lg max-w-none text-gray-700 dark:prose-invert dark:text-gray-300" dangerouslySetInnerHTML={{ __html: article.content }}></div>
      
      {/* Metrics Section */}
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
        
        {/* Donation Section, only visible to a Reader for another publisher's article */}
        {user && user._id !== article.author._id && user.role === 'Reader' && (
            <>
              {!showDonationInput ? (
                // Show "Donate" button initially
                <button
                  onClick={() => setShowDonationInput(true)}
                  className="py-2 px-4 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Donate
                </button>
              ) : (
                // Show input and "Pay" button when donating
                <>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    min="1"
                    className="w-24 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Amount"
                  />
                  {/* PayButton component handles the payment logic */}
                  <PayButton
                    amount={donationAmount}
                    purpose="publisher_payment"
                    publisherId={article.author._id}
                    articleId={articleId}
                    userToken={localStorage.getItem('token')}
                  />
                  {/* Cancel button to hide the donation input */}
                  <button
                    onClick={() => {
                      setShowDonationInput(false);
                      setDonationAmount(100); // Reset amount on cancel
                    }}
                    className="py-2 px-4 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </>
        )}
      </div>
      
      {/* Comments Section */}
      <div className="mt-12">
        <CommentSection articleId={articleId} articleAuthorId={article.author._id} />
      </div>

    </div>
  );
};

export default SingleArticle;