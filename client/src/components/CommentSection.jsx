// client/src/components/CommentSection.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext'; // CHANGE: Import ThemeContext
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// This component displays and handles comments for a specific article
const CommentSection = ({ articleId }) => {
  // State to store the list of comments fetched from the server
  const [comments, setComments] = useState([]);
  // State for the new comment content being typed by the user
  const [newComment, setNewComment] = useState('');
  // Access user information from the UserContext
  const { user } = useContext(UserContext);
  // Hook for internationalization (i18n)
  const { t } = useTranslation();
  // Access dark mode state from the ThemeContext
  const { isDarkMode } = useContext(ThemeContext); // CHANGE: Use ThemeContext

  // Function to fetch comments from the server for the given article
  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/comments/${articleId}`);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  // useEffect hook to fetch comments when the component mounts or articleId changes
  useEffect(() => {
    fetchComments();
  }, [articleId]);

  // Handler for posting a new comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!user) { // Check if a user is logged in
      toast.info(t('loginToComment'));
      return;
    }
    if (!newComment.trim()) { // Validate that the comment is not empty
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
      setNewComment(''); // Clear the input field after posting
      toast.success(t('commentPosted'));
      fetchComments(); // Refresh the comment list to show the new comment
    } catch (err) {
      console.error('Failed to post comment:', err);
      toast.error(t('failedToPostComment'));
    }
  };

  // Handler for deleting a comment
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
      fetchComments(); // Refresh the comment list after deletion
    } catch (err) {
      console.error('Failed to delete comment:', err);
      toast.error(t('failedToDeleteComment'));
    }
  };

  // The component's JSX
  return (
    // Main container with dark mode and styling
    <div className="bg-white p-6 rounded-xl shadow-lg my-8 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <h3 className="text-xl font-bold text-gray-800 mb-4 dark:text-gray-100">{t('comments')} ({comments.length})</h3>

      {/* Conditional rendering of the comment form */}
      {user ? (
        <form onSubmit={handlePostComment} className="mb-6">
          <textarea
            // Textarea for writing comments with dark mode styles
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
        // Message shown when a user is not logged in
        <p className="text-center text-gray-500 mb-6 dark:text-gray-400">{t('loginToCommentMessage')}</p>
      )}

      {/* Container for the comments list */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          // Map over the comments array to render each comment
          comments.map((comment) => (
            <div key={comment._id} className="bg-gray-100 p-4 rounded-lg shadow dark:bg-gray-800 dark:shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  {/* Display the username and comment date */}
                  <div className="font-semibold text-gray-800 dark:text-gray-100">{comment.user?.username || t('anonymousUser')}</div>
                  <div className="text-gray-500 text-sm dark:text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</div>
                </div>
                {/* Conditionally render the delete button for the user who wrote the comment or an Admin */}
                {user && (user._id === comment.user?._id || user.role === 'Admin') && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    {t('delete')}
                  </button>
                )}
              </div>
              {/* Display the comment content */}
              <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          ))
        ) : (
          // Message displayed when there are no comments
          <p className="text-center text-gray-500 dark:text-gray-400">{t('noCommentsYet')}</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;