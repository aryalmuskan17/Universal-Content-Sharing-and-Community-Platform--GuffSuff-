// server/models/User.js
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
  bio: {
    type: String,
    default: '',
  },
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