const express = require('express');
const auth = require('../middleware/auth'); // Importing authentication middleware
const router = express.Router();

// This route is protected so only 'Admin' role can access it
router.get('/admin-data', auth(['Admin']), (req, res) => {
  // If the request reaches here, it means the token was valid AND the user's role is 'Admin'
  res.json({ message: '👑 Secret admin data from backend' });
});

module.exports = router;