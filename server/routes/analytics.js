// server/routes/analytics.js

const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const User = require('../models/User'); // We need the User model to get usernames
const auth = require('../middleware/auth');

// @desc    Get all analytics data for the dashboard
// @route   GET /api/analytics/dashboard
// @access  Private (Admin only)
router.get('/dashboard', auth(['Admin']), async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments();

    const articlesByStatus = await Article.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const articlesByPublisher = await Article.aggregate([
      {
        $group: {
          _id: '$author',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      {
        $unwind: '$authorInfo'
      },
      {
        $project: {
          _id: 0,
          publisher: '$authorInfo.username',
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalArticles,
        articlesByStatus,
        articlesByPublisher,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;