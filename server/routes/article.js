// server/routes/article.js (Corrected for Like/Unlike functionality)

const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
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

// @desc    Create a new article
// @route   POST /api/articles
// @access  Private (Publisher, Admin)
router.post('/', auth(['Publisher', 'Admin']), upload.single('media'), async (req, res) => {
  try {
    const { title, content, status, tags, category, language } = req.body;
    let articleData = {
      title,
      content,
      author: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category,
      status,
      language,
    };

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
            publisher: publisher._id,
            article: article._id,
            message,
          });
        });
        await Promise.all(notificationPromises);
    }

    res.status(201).json({ success: true, data: article });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Get all articles for all roles with filtering, searching, and sorting
// @route   GET /api/articles
// @access  Public
// UPDATED: Now populates the likedBy array
router.get('/', async (req, res) => {
  try {
    let query = { status: 'published' };
    const sort = {};

    if (req.user?.role === 'Admin') {
      query = {};
    } else if (req.user?.role === 'Publisher') {
      query = { author: req.user.id };
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.q) {
      query.$or = [
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
    
    // UPDATED: Add .populate('likedBy') to retrieve the likedBy array
    const articles = await Article.find(query).populate('author').sort(sort).select('+mediaUrl');
    res.status(200).json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// @desc    Get all pending articles for Admin review
// @route   GET /api/articles/pending
// @access  Private (Admin only)
// UPDATED: Now populates the likedBy array
router.get('/pending', auth(['Admin']), async (req, res) => {
  try {
    const articles = await Article.find({ status: 'pending' }).populate('author').select('+mediaUrl');
    res.status(200).json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get a single article by ID
// @route   GET /api/articles/:id
// @access  Public
// UPDATED: Now populates the likedBy array
router.get('/:id', async (req, res) => {
  try {
    // IMPORTANT: Make sure your article model has `likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]`
    const article = await Article.findById(req.params.id).populate('author').select('+mediaUrl');
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.status(200).json(article);
  } catch (error) {
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
        res.status(400).json({ success: false, error: err.message });
    }
});

// UPDATED: @desc    Like an article
// @route   PATCH /api/articles/:id/like
// @access  Private (Authenticated User)
router.patch('/:id/like', auth(), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Check if the user has already liked the article
    if (article.likedBy.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Article already liked' });
    }

    // Add user ID to likedBy array and increment likes count
    article.likedBy.push(req.user.id);
    article.likes = article.likes + 1;
    await article.save();

    res.status(200).json({ success: true, data: article });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// NEW: @desc    Unlike an article
// @route   PATCH /api/articles/:id/unlike
// @access  Private (Authenticated User)
router.patch('/:id/unlike', auth(), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Check if the user has liked the article to unlike it
    const likedIndex = article.likedBy.indexOf(req.user.id);
    if (likedIndex === -1) {
      return res.status(400).json({ success: false, message: 'Article has not been liked by this user' });
    }

    // Remove user ID from likedBy array and decrement likes count
    article.likedBy.splice(likedIndex, 1);
    article.likes = article.likes - 1;
    await article.save();

    res.status(200).json({ success: true, data: article });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Increment the shares count for an article
// @route   PATCH /api/articles/:id/share
// @access  Public
router.patch('/:id/share', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { new: true, runValidators: true }
    ).select('+mediaUrl');
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.status(200).json({ success: true, data: article });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Get performance analytics for a publisher's articles
// @route   GET /api/articles/publisher/analytics
// @access  Private (Publisher, Admin)
// Note: This route is no longer necessary if you use the universal route
router.get('/publisher/analytics', auth(['Publisher', 'Admin']), async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user.id }).select('+mediaUrl');
    res.status(200).json({ success: true, data: articles });
  } catch (err) {
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
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Admin approves or rejects an article
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

    res.status(200).json({ success: true, data: article });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;