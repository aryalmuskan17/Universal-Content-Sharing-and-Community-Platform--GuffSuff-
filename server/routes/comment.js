// server/routes/comment.js

const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Article = require('../models/Article');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification'); 
const User = require('../models/User'); 

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
    
    // Check if the commenter is not the article's author
    if (req.user.id.toString() !== article.author.toString()) {
      const publisher = await User.findById(article.author);
      const commenter = await User.findById(req.user.id);

      if (publisher && commenter) {
        try {
          await Notification.create({
            user: publisher._id,
            fromUser: commenter._id,
            article: article._id,
            type: 'comment',
            message: `${commenter.username} commented on your article: "${article.title}"`,
          });
        } catch (notificationErr) {
          console.error('ERROR: Failed to create notification:', notificationErr);
        }
    }
    }


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