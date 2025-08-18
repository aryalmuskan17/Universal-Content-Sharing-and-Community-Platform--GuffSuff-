const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Comment = require('../models/Comment'); 
const auth = require('../middleware/auth');
const User = require('../models/User'); 
const Notification = require('../models/Notification');
const multer = require('multer');

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// FINAL CORRECTED POST /api/articles ROUTE
// @desc    Create a new article
// @route   POST /api/articles
// @access  Private (Publisher, Admin)
router.post('/', auth(['Publisher', 'Admin']), upload.single('media'), async (req, res) => {
  try {
    const { title, content, tags, category, language } = req.body;
    let articleData = {
      title,
      content,
      author: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category,
      language,
    };
    
    // Set status based on user role
    if (req.user.role === 'Publisher') {
      articleData.status = 'pending';
    } else { 
      articleData.status = req.body.status || 'draft';
    }

    if (req.file) { 
      articleData.mediaUrl = req.file.path;
    }

    const article = await Article.create(articleData);

    const publisher = await User.findById(req.user.id);
    if (publisher) { 
        const subscribers = await User.find({ subscriptions: publisher._id });
        const notificationPromises = subscribers.map(subscriber => {
          const message = `${publisher.name || publisher.username} has published a new article: "${article.title}"`;
          return Notification.create({
            user: subscriber._id,
            fromUser: publisher._id, 
            type: 'publish', 
            article: article._id,
            message,
          });
        });
        await Promise.all(notificationPromises);
    }
    
    // Admin notification logic
    if (articleData.status === 'pending') {
        const fromUser = await User.findById(req.user.id);
        if (!fromUser) {
            console.error('User not found for notification:', req.user.id);
            return res.status(500).json({ success: false, error: 'User not found' });
        }
        
        const admins = await User.find({ role: 'Admin' });
        const adminNotificationPromises = admins.map(admin => {
            return Notification.create({
                user: admin._id,
                fromUser: fromUser._id, 
                article: article._id,
                type: 'review',
                message: `${fromUser.name || fromUser.username} has submitted a new article for review: "${article.title}"`,
            });
        });
        await Promise.all(adminNotificationPromises);
    }
    
    res.status(201).json({ success: true, data: article });
  } catch (err) {
    console.error('An error occurred creating a new article:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// CORRECTED GET /api/articles ROUTE - Now with Comment Count and Correct Data Structure
// @desc    Get all articles for all roles with filtering, searching, and sorting
// @route   GET /api/articles
// @access  Public
router.get('/', async (req, res) => {
  try {
    let matchQuery = { status: 'published' };
    const sort = {};

    if (req.user?.role === 'Admin') {
      matchQuery = {};
    } else if (req.user?.role === 'Publisher') {
      matchQuery = { author: req.user.id };
    }

    if (req.query.category) {
      matchQuery.category = req.query.category;
    }

    if (req.query.q) {
      matchQuery.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { content: { $regex: req.query.q, $options: 'i' } },
      ];
    }
    
    if (req.query.sortBy) {
        if (req.query.sortBy === 'views') {
            sort.views = -1;
        } else if (req.query.sortBy === 'date') {
            sort.createdAt = -1;
        }
    } else {
        sort.createdAt = -1;
    }

    const articles = await Article.aggregate([
      // Stage 1: Filter articles based on the query
      { $match: matchQuery },
      // Stage 2: Look up the author from the users collection
      {
        $lookup: {
          from: 'users', 
          localField: 'author',
          foreignField: '_id',
          as: 'authorDetails'
        }
      },
      // Stage 3: Look up comments for each article from the comments collection
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'article',
          as: 'comments'
        }
      },
      // Stage 4: Add a new field 'commentCount'
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      // Stage 5: Sort the articles
      { $sort: sort },
      // Stage 6: Project the final document shape
      {
        $project: {
          _id: '$_id', 
          title: '$title',
          content: '$content',
          author: { $arrayElemAt: ['$authorDetails', 0] },
          status: '$status',
          tags: '$tags',
          category: '$category',
          language: '$language',
          views: '$views',
          likes: '$likes',
          likedBy: '$likedBy',
          shares: '$shares',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          mediaUrl: '$mediaUrl',
          commentCount: '$commentCount',
        }
      }
    ]);

    res.status(200).json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    console.error('An error occurred getting articles with comments:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get all pending articles for Admin review
// @route   GET /api/articles/pending
// @access  Private (Admin only)
router.get('/pending', auth(['Admin']), async (req, res) => {
  try {
    const articles = await Article.find({ status: 'pending' })
      .populate('author')
      .select('+mediaUrl');
      
    res.status(200).json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    console.error('An error occurred getting pending articles:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get a single article by ID
// @route   GET /api/articles/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author')
      .select('+mediaUrl');
      
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.status(200).json(article);
  } catch (error) {
    console.error('An error occurred getting a single article:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// NEW: @desc Increment the views count for an article
// @route PATCH /api/articles/:id/view
// @access Public (view increments only if a token is provided)
router.patch('/:id/view', auth(), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized to increment views' });
        }
        
        const article = await Article.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true, runValidators: true }
        ).select('+mediaUrl');
        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }
        res.status(200).json({ success: true, data: article });
    } catch (err) {
        console.error('An error occurred in the view route:', err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// FIXED: @desc    Like an article and create a notification
// @route   PATCH /api/articles/:id/like
// @access  Private (Authenticated User)
router.patch('/:id/like', auth(), async (req, res) => {
  try {
    const articleToUpdate = await Article.findById(req.params.id);
    if (!articleToUpdate) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    if (articleToUpdate.likedBy.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Article already liked' });
    }
    
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { likes: 1 },
        $addToSet: { likedBy: req.user.id }
      },
      { new: true, runValidators: true }
    );

    if (req.user.id.toString() !== articleToUpdate.author.toString()) {
      const liker = await User.findById(req.user.id);
      const publisher = await User.findById(articleToUpdate.author);
      if (publisher) {
        await Notification.create({
          user: publisher._id,
          fromUser: liker._id,
          article: updatedArticle._id,
          type: 'like',
          message: `${liker.username} liked your article: "${updatedArticle.title}"`,
        });
      }
    }

    res.status(200).json({ success: true, data: updatedArticle });
  } catch (err) {
    console.error('An error occurred in the like route:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// FIXED: @desc    Unlike an article
// @route   PATCH /api/articles/:id/unlike
// @access  Private (Authenticated User)
router.patch('/:id/unlike', auth(), async (req, res) => {
  try {
    const articleToUpdate = await Article.findById(req.params.id);
    if (!articleToUpdate) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    if (!articleToUpdate.likedBy.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Article has not been liked by this user' });
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { likes: -1 },
        $pull: { likedBy: req.user.id }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedArticle });
  } catch (err) {
    console.error('An error occurred in the unlike route:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// UPDATED: @desc    Increment the shares count for an article and create a notification
// @route   PATCH /api/articles/:id/share
// @access  Private (Authenticated User)
router.patch('/:id/share', auth(), async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { new: true, runValidators: true }
    ).select('+mediaUrl');
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    
    // NEW: Create a notification for the publisher
    if (req.user.id.toString() !== article.author.toString()) {
      const sharer = await User.findById(req.user.id);
      const publisher = await User.findById(article.author);
      if (publisher) {
        await Notification.create({
          user: publisher._id, // The publisher is the recipient
          fromUser: sharer._id, // The sharer is the sender
          article: article._id,
          type: 'share',
          message: `${sharer.username} shared your article: "${article.title}"`,
        });
      }
    }

    res.status(200).json({ success: true, data: article });
  } catch (err) {
    console.error('An error occurred in the share route:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Get performance analytics for a publisher's articles
// @route   GET /api/articles/publisher/analytics
// @access  Private (Publisher, Admin)
router.get('/publisher/analytics', auth(['Publisher', 'Admin']), async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user.id }).select('+mediaUrl');
    res.status(200).json({ success: true, data: articles });
  } catch (err) {
    console.error('An error occurred in the publisher analytics route:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update an existing article
// @route   PUT /api/articles/:id
// @access  Private (Publisher, Admin)
router.put('/:id', auth(['Publisher', 'Admin']), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).select('+mediaUrl');

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    if (article.author.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this article' });
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('+mediaUrl');

    res.status(200).json({ success: true, data: updatedArticle });
  } catch (err) {
    console.error('An error occurred in the update route:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// FINAL CORRECTED: @desc Admin approves or rejects an article
// @route   PATCH /api/articles/:id/status
// @access  Private (Admin only)
router.patch('/:id/status', auth(['Admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('+mediaUrl');

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // NEW LOGIC: Notify the publisher if the article is approved
    if (status === 'published') {
      const publisher = await User.findById(article.author);
      const admin = await User.findById(req.user.id); // Fetch admin details for the message
      if (publisher && admin) {
        await Notification.create({
          user: publisher._id,
          fromUser: admin._id,
          article: article._id,
          type: 'publish',
          message: `Your article "${article.title}" has been approved and published by an admin.`,
        });
      }
    }

    res.status(200).json({ success: true, data: article });
  } catch (err) {
    console.error('An error occurred in the status update route:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;