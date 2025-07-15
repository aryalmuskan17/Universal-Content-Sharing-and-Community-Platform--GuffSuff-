const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure this path is correct
const router = express.Router();

const secret = process.env.JWT_SECRET || 'defaultsecret'; // Gets JWT_SECRET from .env

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  // --- 1. Basic Input Validation ---
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required.' });
  }

  try {
    // --- 2. Check if user already exists ---
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists. Please choose a different one.' }); // 409 Conflict is appropriate for duplicates
    }

    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({ username, password: hashed, role });
    await newUser.save();

    // --- 3. Send a more appropriate success status ---
    res.status(201).json({ message: '✅ User registered successfully!' }); // 201 Created is standard for successful resource creation

  } catch (error) {
    // --- 4. Log and handle errors gracefully ---
    console.error('Error during user registration:', error); // This will log the actual error to your terminal!

    // Check for Mongoose validation errors (e.g., if schema rules are violated)
    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }
    // For any other unexpected server errors during registration
    res.status(500).json({ error: 'Server error during registration. Please try again later.' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Also add basic input validation for login
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required for login.' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error during user login:', error); // Log login errors too
    res.status(500).json({ error: 'Server error during login. Please try again later.' });
  }
});

module.exports = router;