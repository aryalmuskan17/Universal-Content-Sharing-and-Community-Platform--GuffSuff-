// server/routes/comment.js

const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Article = require('../models/Article');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification'); // NEW: Import Notification model
const User = require('../models/User'); // NEW: Import User model to get commenter's name

// @desc    Create a new comment on an article
// @route   POST /api/comments/:articleId
// @access  Private
router.post('/:articleId', auth(), async (req, res) => {
  try {
    const { content } = req.body;
    const articleId = req.params.articleId;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const newComment = await Comment.create({
      article: articleId,
      user: req.user.id,
      content,
    });
    
    // START DEBUGGING
    console.log('New comment created. Checking for notification logic...');
    console.log('Commenter ID:', req.user.id);
    console.log('Article Author ID:', article.author.toString());
    
    // Check if the commenter is not the article's author
    if (req.user.id.toString() !== article.author.toString()) {
      console.log('Condition met: Commenter is not the author. Attempting to send notification...');
      const publisher = await User.findById(article.author);
      const commenter = await User.findById(req.user.id);
      
      console.log('Publisher found:', !!publisher);
      console.log('Commenter found:', !!commenter);

      if (publisher && commenter) {
        try {
          await Notification.create({
            user: publisher._id,
            fromUser: commenter._id,
            article: article._id,
            type: 'comment',
            message: `${commenter.username} commented on your article: "${article.title}"`,
          });
          console.log('SUCCESS: Notification created successfully!');
        } catch (notificationErr) {
          console.error('ERROR: Failed to create notification:', notificationErr);
        }
      } else {
        console.log('WARNING: Could not find publisher or commenter user for notification.');
      }
    } else {
      console.log('Condition not met: Commenter is the same as the article author. No notification will be sent.');
    }
    // END DEBUGGING

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all comments for a specific article
// @route   GET /api/comments/:articleId
// @access  Public
router.get('/:articleId', async (req, res) => {
  try {
    const comments = await Comment.find({ article: req.params.articleId })
      .populate('user', 'username name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
router.delete('/:id', auth(), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the logged-in user is the comment's author or an admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    res.status(200).json({ message: 'Comment removed' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;