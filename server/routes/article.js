const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = require('../models/Article');
const Comment = require('../models/Comment'); 
const auth = require('../middleware/auth');
const User = require('../models/User'); 
const Notification = require('../models/Notification');
const multer = require('multer');
const { check, validationResult } = require('express-validator');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

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
    
    if (req.user.role === 'Publisher') {
      articleData.status = 'pending';
    } else { 
      articleData.status = req.body.status || 'draft';
    }

    if (req.file) { 
      articleData.mediaUrl = req.file.path;
    }

    const article = await Article.create(articleData);
    
    // NEW: Only send notification to admins for review
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

router.get('/', async (req, res) => {
  try {
    let matchQuery = { status: 'published' };
    const sort = {};

    if (req.user?.role === 'Admin') {
      matchQuery = {};
      if (req.query.status) {
        matchQuery.status = req.query.status;
      }
    } else if (req.user?.role === 'Publisher') {
      matchQuery = { author: new mongoose.Types.ObjectId(req.user.id) };
      if (req.query.status) {
        matchQuery.status = req.query.status;
      }
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
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users', 
          localField: 'author',
          foreignField: '_id',
          as: 'authorDetails'
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'article',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      { $sort: sort },
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

router.get('/:id', auth(), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author')
      .select('+mediaUrl');

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const isPublic = article.status === 'published';
    const isAuthorized = req.user && (
      req.user.role === 'Admin' ||
      article.author._id.toString() === req.user.id.toString()
    );

    if (!isPublic && !isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this article' });
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

router.patch('/:id/view', auth(), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized to increment views' });
        }
        
        // Find the article to check the author
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }
        
        // NEW: Check if the viewer is the author
        if (article.author.toString() === req.user.id.toString()) {
            return res.status(200).json({ success: true, message: 'Author view not counted', data: article });
        }
        
        // If not the author, increment the view count
        const updatedArticle = await Article.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true, runValidators: true }
        ).select('+mediaUrl');

        res.status(200).json({ success: true, data: updatedArticle });
    } catch (err) {
        console.error('An error occurred in the view route:', err);
        res.status(400).json({ success: false, error: err.message });
    }
});

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
    
    if (req.user.id.toString() !== article.author.toString()) {
      const sharer = await User.findById(req.user.id);
      const publisher = await User.findById(article.author);
      if (publisher) {
        await Notification.create({
          user: publisher._id, 
          fromUser: sharer._id, 
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

router.get('/publisher/analytics', auth(['Publisher', 'Admin']), async (req, res) => {
  try {
    let matchStage = { 
        author: new mongoose.Types.ObjectId(req.user.id) 
    };

    if (req.query.status) {
        matchStage.status = req.query.status;
    }
    
    const analytics = await Article.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorDetails'
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'article',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          title: 1,
          status: 1,
          views: 1,
          likes: 1,
          shares: 1,
          createdAt: 1,
          author: { $arrayElemAt: ['$authorDetails', 0] },
          commentCount: 1,
        }
      }
    ]);

    res.status(200).json({ success: true, data: analytics });
  } catch (err) {
    console.error('An error occurred in the publisher analytics route:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// server/routes/articles.js (Corrected 'update article' route)

router.put('/:id', auth(['Publisher', 'Admin']), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).select('+mediaUrl');

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    if (article.author.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this article' });
    }
    
    let updateData = { ...req.body, updatedAt: Date.now() };

    if (req.user.role === 'Publisher' && req.body.status) {
       
        delete updateData.status;
        console.log(`Publisher ${req.user.id} attempted to change article status. Action blocked.`);
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('+mediaUrl');

    res.status(200).json({ success: true, data: updatedArticle });
  } catch (err) {
    console.error('An error occurred in the update route:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

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
    
    // Check if a notification should be sent based on status change
    const publisher = await User.findById(article.author);
    const admin = await User.findById(req.user.id);
    
    if (publisher && admin) {
        if (status === 'published') {
            // Notify the article's publisher
            await Notification.create({
                user: publisher._id,
                fromUser: admin._id,
                article: article._id,
                type: 'publish',
                message: `Your article "${article.title}" has been approved and published by an admin.`,
            });
            
            // NEW: Logic to notify all readers
            const readers = await User.find({ role: 'Reader' });
            if (readers.length > 0) {
                const readerNotificationPromises = readers.map(reader => {
                    return Notification.create({
                        user: reader._id,
                        fromUser: admin._id,
                        article: article._id,
                        type: 'new_article', // A new type for readers
                        message: `A new article has been published: "${article.title}"`,
                    });
                });
                await Promise.all(readerNotificationPromises);
            }
        } else if (status === 'rejected') {
            await Notification.create({
                user: publisher._id,
                fromUser: admin._id,
                article: article._id,
                type: 'reject',
                message: `Your article "${article.title}" has been rejected by an admin.`,
            });
        }
    }

    res.status(200).json({ success: true, data: article });
  } catch (err) {
    console.error('An error occurred in the status update route:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE route to delete an article by ID
router.delete('/:id', auth(['Publisher', 'Admin']), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Check if the user is the author or an admin
    if (req.user.role !== 'Admin' && article.author.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this article' });
    }

    // Delete associated comments and notifications first to avoid orphaned data
    await Comment.deleteMany({ article: req.params.id });
    await Notification.deleteMany({ article: req.params.id });

    // Now, delete the article
    await article.deleteOne();

    res.status(200).json({ success: true, message: 'Article and related data deleted successfully' });
  } catch (err) {
    console.error('An error occurred deleting the article:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
module.exports = router;