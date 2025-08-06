// server/models/Article.js

const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String],
  category: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'published'], default: 'pending' },
  language: { type: String, enum: ['en', 'ne'], default: 'en' },
  mediaUrl: String, // for images/videos
  
  // --- NEW ANALYTICS FIELDS ---
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// This line prevents the "OverwriteModelError" if the model is required multiple times.
module.exports = mongoose.models.Article || mongoose.model('Article', ArticleSchema);