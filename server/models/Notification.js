const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // The user who receives the notification (e.g., the publisher)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The user who caused the event (e.g., the person who liked or commented)
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
  },
  // CORRECTED: The type of notification (e.g., like, share, comment, publish)
  type: {
    type: String,
    // Add 'review' to the list of valid enum values
    enum: ['like', 'share', 'comment', 'subscribe', 'publish', 'review'], 
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);