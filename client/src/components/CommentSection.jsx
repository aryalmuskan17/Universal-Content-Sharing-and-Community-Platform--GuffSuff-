// client/src/components/CommentSection.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext'; // CHANGE: Import ThemeContext
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const CommentSection = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useContext(UserContext);
  const { t } = useTranslation();
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/comments/${articleId}`);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info(t('loginToComment'));
      return;
    }
    if (!newComment.trim()) {
      toast.error(t('commentEmpty'));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };
      await axios.post(`http://localhost:5001/api/comments/${articleId}`, { content: newComment }, config);
      setNewComment('');
      toast.success(t('commentPosted'));
      fetchComments(); // Refresh comments list
    } catch (err) {
      console.error('Failed to post comment:', err);
      toast.error(t('failedToPostComment'));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm(t('confirmDeleteComment'))) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      await axios.delete(`http://localhost:5001/api/comments/${commentId}`, config);
      toast.success(t('commentDeleted'));
      fetchComments(); // Refresh comments list
    } catch (err) {
      console.error('Failed to delete comment:', err);
      toast.error(t('failedToDeleteComment'));
    }
  };

  return (
    // CHANGE: Add dark mode classes to the main container
    <div className="bg-white p-6 rounded-xl shadow-lg my-8 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <h3 className="text-xl font-bold text-gray-800 mb-4 dark:text-gray-100">{t('comments')} ({comments.length})</h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handlePostComment} className="mb-6">
          <textarea
            // CHANGE: Add dark mode classes to the textarea
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            rows="3"
            placeholder={t('writeYourComment')}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            className="mt-3 py-2 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            {t('postComment')}
          </button>
        </form>
      ) : (
        <p className="text-center text-gray-500 mb-6 dark:text-gray-400">{t('loginToCommentMessage')}</p>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            // CHANGE: Add dark mode classes to each comment block
            <div key={comment._id} className="bg-gray-100 p-4 rounded-lg shadow dark:bg-gray-800 dark:shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-100">{comment.user?.username || t('anonymousUser')}</div>
                  <div className="text-gray-500 text-sm dark:text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</div>
                </div>
                {user && (user._id === comment.user?._id || user.role === 'Admin') && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    {t('delete')}
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">{t('noCommentsYet')}</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;