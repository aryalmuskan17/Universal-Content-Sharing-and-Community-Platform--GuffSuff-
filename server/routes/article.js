// server/routes/article.js (Final Corrected Version)

const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const auth = require('../middleware/auth');

// @desc    Create a new article
// @route   POST /api/articles
// @access  Private (Publisher, Admin)
router.post('/', auth(['Publisher', 'Admin']), async (req, res) => {
  try {
    const article = await Article.create({ ...req.body, author: req.user.id });
    res.status(201).json({ success: true, data: article });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Get all published articles with filtering, searching, and sorting
// @route   GET /api/articles
// @access  Public (Reader)
router.get('/', async (req, res) => {
  try {
    const query = { status: 'published' };

    // Filter by category if a category is provided in the query
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search by title or content if a search query is provided
    if (req.query.q) {
      query.$or = [
        { title: { $regex: req.query.q, $options: 'i' } }, // Search by title (case-insensitive)
        { content: { $regex: req.query.q, $options: 'i' } }, // Search by content (case-insensitive)
      ];
    }

    const articles = await Article.find(query).populate('author');
    res.status(200).json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get all pending articles for Admin review
// @route   GET /api/articles/pending
// @access  Private (Admin only)
router.get('/pending', auth(['Admin']), async (req, res) => {
  try {
    const articles = await Article.find({ status: 'pending' }).populate('author');
    res.status(200).json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get all articles for Admin dashboard with filtering, searching, and sorting
// @route   GET /api/articles/admin/all
// @access  Private (Admin only)
router.get('/admin/all', auth(['Admin']), async (req, res) => {
  try {
    // Corrected logic to handle search and filters for the Admin route
    const query = {};

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.q) {
      query.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { content: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    const articles = await Article.find(query).populate('author').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get a single article by ID
// @route   GET /api/articles/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('author');
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
        );
        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }
        res.status(200).json({ success: true, data: article });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Increment the likes count for an article
// @route   PATCH /api/articles/:id/like
// @access  Public
router.patch('/:id/like', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true, runValidators: true }
    );
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
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
    );
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
router.get('/publisher/analytics', auth(['Publisher', 'Admin']), async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user.id });
    res.status(200).json({ success: true, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Update an existing article
// @route   PUT /api/articles/:id
// @access  Private (Publisher, Admin)
router.put('/:id', auth(['Publisher', 'Admin']), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

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
    );

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
    );

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.status(200).json({ success: true, data: article });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;