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
const notificationRoutes = require('./routes/notification'); 

const app = express();

// 3. Connect to the database before setting up routes.
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.error('❌ MongoDB error:', err));

// 4. Use your middlewares.
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'], 
}));

app.use(express.json());

// --- ADD THE NEW LINE HERE ---
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));


// 5. Define your API routes.
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes); 

// 6. Start the server.
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});