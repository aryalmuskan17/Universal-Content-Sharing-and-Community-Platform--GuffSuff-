// 1. Loading environment variables first.
require('dotenv').config();
console.log('Connecting to MongoDB with URI:', process.env.MONGO_URI);

// 2. Importing all necessary modules at the top.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import your route files
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/article');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// 3. Connect to the database before setting up routes.
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.error('❌ MongoDB error:', err));

// 4. Use your middlewares.

// FIX: Explicit CORS configuration to allow all origins and headers
app.use(cors({
  origin: '*', // This allows all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // All common HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'], // Custom headers your app needs
}));

app.use(express.json());

// 5. Define your API routes.
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/analytics', analyticsRoutes);

// 6. Start the server.
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});