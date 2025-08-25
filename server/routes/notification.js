// server/routes/notification.js 

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// @desc    Get all notifications for a logged-in user
// @route   GET /api/notifications
// @access  Private
router.get('/', auth(), async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      //  Populate 'fromUser' instead of 'publisher'
      .populate('fromUser', 'name username') 
      .populate('article', 'title') 
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    console.error('An error occurred getting notifications:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
router.patch('/:id/read', auth(), async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, 
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    console.error('An error occurred marking notification as read:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;