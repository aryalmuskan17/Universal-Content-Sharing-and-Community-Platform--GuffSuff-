// server/models/User.js (Corrected with new fields)
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Reader', 'Publisher', 'Admin'],
    default: 'Reader',
  },
  // NEW: Add a field for the user's full name
  fullName: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  // The 'picture' field will now store the file path to the uploaded image
  picture: {
    type: String,
    default: '',
  },
  contactInfo: {
    type: String,
    default: '',
  },
  subscriptions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

module.exports = mongoose.model('User', UserSchema);