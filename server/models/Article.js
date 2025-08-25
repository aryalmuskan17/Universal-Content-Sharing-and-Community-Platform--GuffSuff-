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
  mediaUrl: String, 
  
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
  likedBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  // NEW: This is required to make virtuals appear when converted to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// NEW: Create a virtual field to count comments
ArticleSchema.virtual('commentCount', {
  ref: 'Comment', // The model to use
  localField: '_id', // Find documents where `localField` is equal to `foreignField`
  foreignField: 'article', // In the `Comment` model, find where `article` matches the article's `_id`
  count: true // This option makes it count the documents instead of populating them
});

module.exports = mongoose.models.Article || mongoose.model('Article', ArticleSchema);