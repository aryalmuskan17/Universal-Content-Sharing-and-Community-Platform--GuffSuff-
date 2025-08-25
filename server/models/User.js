// server/models/User.js 

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // IMPORTANT CHANGE: Password is no longer 'required' for Google-authenticated users
  password: {
    type: String,
    // Note: We've removed `required: true` so Google users don't need a password field.
  },
  
  // NEW: Fields for Google login
  email: { 
    type: String,
    unique: true,
    trim: true,
    sparse: true, // Allows multiple users without an email (e.g., if you don't collect it for manual registration)
  },
  googleId: { 
    type: String,
    unique: true,
    sparse: true, // Allows multiple users without a Google ID (e.g., manually registered users)
  },
  
  role: {
    type: String,
    enum: ['Reader', 'Publisher', 'Admin'],
    default: 'Reader',
  },
  
  // Existing fields
  fullName: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  picture: { // Renamed from 'profilePicture' in a previous step
    type: String,
    default: '',
  },
  contactInfo: {
    type: String,
    default: '',
  },
  balance: {
    type: Number,
    default: 0,
  },
  subscriptions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);