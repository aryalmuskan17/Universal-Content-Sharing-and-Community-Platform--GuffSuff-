// index.js (with global error handler added at the end)

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Your authentication routes

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Your API routes
app.use('/api', authRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// --- ADD THIS GLOBAL ERROR HANDLER AT THE VERY END OF THE FILE ---
app.use((err, req, res, next) => {
  console.error('--- Uncaught Server Error ---');
  console.error(err.stack); // Logs the full error stack to the terminal
  res.status(err.statusCode || 500).json({
    error: 'An unexpected error occurred on the server.',
    details: err.message // Provide some detail but avoid sensitive info
  });
});
// -----------------------------------------------------------------