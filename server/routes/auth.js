// server/routes/auth.js (Final Corrected Version)

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// NOTE: We are removing the 'secret' variable and will use process.env.JWT_SECRET directly for consistency.

// Corrected Middleware to verify JWT token and get user info
const protect = (req, res, next) => {
  let token = req.header('x-auth-token');

  // FIX: This section now correctly checks for the Authorization: Bearer token
  if (!token && req.header('Authorization')) {
    const authHeader = req.header('Authorization');
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Extract the token string
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Route to get a user's own profile (Full profile, including subscriptions)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to update a user's own profile
router.patch('/profile', protect, async (req, res) => {
  const { bio, picture, contactInfo } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { bio, picture, contactInfo },
      { new: true }
    ).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to subscribe to a publisher
router.put('/profile/subscribe/:publisherId', protect, async (req, res) => {
  const { publisherId } = req.params;
  const readerId = req.user.id;

  try {
    if (readerId.toString() === publisherId) {
      return res.status(400).json({ message: 'Cannot subscribe to your own account.' });
    }

    const reader = await User.findById(readerId);
    if (!reader) {
      return res.status(404).json({ message: 'Reader not found.' });
    }

    const publisher = await User.findById(publisherId);
    if (!publisher || publisher.role !== 'Publisher') {
      return res.status(404).json({ message: 'Publisher not found or invalid user role.' });
    }

    if (reader.subscriptions.includes(publisherId)) {
      return res.status(400).json({ message: 'Already subscribed to this publisher.' });
    }

    reader.subscriptions.push(publisherId);
    await reader.save();

    res.status(200).json({ message: 'Successfully subscribed to publisher.', subscriptions: reader.subscriptions });
  } catch (error) {
    console.error('Error subscribing to publisher:', error);
    res.status(500).json({ message: 'Server error while subscribing.' });
  }
});

// Route to unsubscribe from a publisher
router.put('/profile/unsubscribe/:publisherId', protect, async (req, res) => {
  const { publisherId } = req.params;
  const readerId = req.user.id;

  try {
    const reader = await User.findById(readerId);
    if (!reader) {
      return res.status(404).json({ message: 'Reader not found.' });
    }

    const subscriptionIndex = reader.subscriptions.indexOf(publisherId);
    if (subscriptionIndex === -1) {
      return res.status(400).json({ message: 'Not subscribed to this publisher.' });
    }

    reader.subscriptions.splice(subscriptionIndex, 1);
    await reader.save();

    res.status(200).json({ message: 'Successfully unsubscribed from publisher.', subscriptions: reader.subscriptions });
  } catch (error) {
    console.error('Error unsubscribing from publisher:', error);
    res.status(500).json({ message: 'Server error while unsubscribing.' });
  }
});

// Registration route
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists. Please choose a different one.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    // FIX: Using process.env.JWT_SECRET directly for consistency
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: '✅ User registered successfully!',
      token: token,
      user: { _id: newUser._id, username: newUser.username, role: newUser.role, subscriptions: newUser.subscriptions || [] }
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during registration. Please try again later.' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required for login.' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // FIX: Using process.env.JWT_SECRET directly for consistency
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: { _id: user._id, username: user.username, role: user.role, subscriptions: user.subscriptions || [] } });
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error during login. Please try again later.' });
  }
});

// Route to get all users
router.get('/users', protect, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// Route to update a user's role (Admin only)
router.put('/users/:id', protect, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  const { id } = req.params;
  const { role } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error updating user.' });
  }
});

// Route to delete a user (Admin only)
router.delete('/users/:id', protect, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
});

module.exports = router;