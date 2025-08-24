// server/routes/auth.js (Final and Complete Merged Version with Google Redirect Fix)

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const router = express.Router();

// ------------------------------------------
// Passport.js Imports and Setup
// ------------------------------------------
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

router.use(session({
  secret: process.env.SESSION_SECRET || 'a_very_secret_key', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

router.use(passport.initialize());
router.use(passport.session());

// Passport Google Strategy configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // CORRECTED: For new users, do NOT save yet.
        // Instead, return a temporary user object with a flag.
        user = {
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          isNewUser: true, // This flag signals that it's a new user
        };
        return done(null, user);
      }
      
      // For existing users, return the user object
      done(null, user);
      
    } catch (err) {
      done(err, null);
    }
  }
));

// Serialize and Deserialize user for session management
passport.serializeUser((user, done) => {
  // Check for the isNewUser flag before serializing
  if (user.isNewUser) {
    // If it's a new user, we don't have an ID yet. Serialize the temporary object.
    done(null, user);
  } else {
    // If it's an existing user, serialize the ID as normal.
    done(null, user.id);
  }
});

passport.deserializeUser(async (id, done) => {
  try {
    // If the ID is a temporary object (from a new user), don't try to find it.
    if (typeof id === 'object' && id.isNewUser) {
      return done(null, id);
    }
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ------------------------------------------
// END OF PASSPORT.JS SETUP
// ------------------------------------------

// ------------------------------------------
// CORRECTED GOOGLE AUTHENTICATION ROUTES
// ------------------------------------------

const CLIENT_URL_DEV = "http://localhost:5173"; // Your frontend URL

// Route to initiate Google authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route for Google's callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL_DEV}/login` }),
  (req, res) => {
    // CORRECTED: This logic now handles both new and existing users
    const user = req.user;
    
    if (user.isNewUser) {
      // NEW USER: Redirect to registration page with user details in the URL
      const redirectUrl = `${CLIENT_URL_DEV}/register?googleId=${user.googleId}&username=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email)}`;
      return res.redirect(redirectUrl);
    }
    
    // EXISTING USER: Create a token and redirect to the login success page
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`${CLIENT_URL_DEV}/login-success?token=${token}`);
  }
);

// ------------------------------------------
// END OF CORRECTED GOOGLE AUTHENTICATION ROUTES
// ------------------------------------------


// Corrected Middleware to verify JWT token and get user info
const protect = (req, res, next) => {
  let token = req.header('x-auth-token');

  if (!token && req.header('Authorization')) {
    const authHeader = req.header('Authorization');
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
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

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/profilePictures';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

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

// Route to update a user's own profile with new fields and a file upload
router.patch('/profile', protect, upload.single('profilePicture'), async (req, res) => {
  const { fullName, bio, contactInfo } = req.body;
  let updateData = { fullName, bio, contactInfo };

  try {
    if (req.file) {
      updateData.picture = req.file.path;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to update a user's username
router.patch('/profile/username', protect, async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(409).json({ error: 'This username is already taken.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).json({ error: 'Server error updating username.' });
  }
});

// NEW: Route to update a user's password
router.patch('/profile/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Server error updating password.' });
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

// CORRECTED: The registration route now handles googleId
router.post('/register', async (req, res) => {
  const { username, email, password, role, googleId } = req.body; // <-- ADDED 'googleId'
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Check if a user with that username or email already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }]
    });

    // Check for existing users to avoid duplicates
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ message: 'Username already exists. Please choose a different one.' });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ message: 'Email already exists. Please use the login page to sign in.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      googleId // <-- ADDED googleId here to link the accounts
    });
    
    await newUser.save();

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

// Route to update a user's role (Admin only, with super-admin protection)
router.put('/users/:id', protect, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  
  const { id } = req.params;
  const { role } = req.body;

  // NEW: Super-admin protection check
  if (id.toString() === process.env.MAIN_ADMIN_ID) {
    return res.status(403).json({ message: 'Access denied. The role of the main admin cannot be changed.' });
  }

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

// Route to delete a user (Admin only, with super-admin protection)
router.delete('/users/:id', protect, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  const { id } = req.params;

  // NEW: Super-admin protection check
  if (id.toString() === process.env.MAIN_ADMIN_ID) {
    return res.status(403).json({ message: 'Access denied. The main admin account cannot be deleted.' });
  }
  
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

// NEW ROUTE: Fetch a list of a user's subscribed publishers
router.get('/subscriptions', protect, async (req, res) => {
  try {
    const reader = await User.findById(req.user.id)
      .populate({
        path: 'subscriptions',
        select: 'username email picture' // Only retrieve these fields from the publisher user
      });
    
    if (!reader) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(reader.subscriptions);

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Server error while fetching subscriptions.' });
  }
});


module.exports = router;