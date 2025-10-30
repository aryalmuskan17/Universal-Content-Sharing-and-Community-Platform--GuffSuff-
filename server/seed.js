// server/seed.js

const dotenv = require('dotenv');
// 1. Load environment variables FIRST
dotenv.config({ path: './.env' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import the User model
const User = require('./models/User'); 

// Define Admin credentials for seeding (uses .env or defaults)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@guffsuff.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'secure123'; 
const ADMIN_USERNAME = 'GuffSuffAdmin';

// 1. Connect to the Database
const connectDB = async () => {
    try {
        // MONGODB_URI is now guaranteed to be loaded
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully for seeding.');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// 2. The Seeding Function
const seedAdmin = async () => {
    try {
        // Check if an Admin user already exists to prevent duplicates
        const adminExists = await User.findOne({ role: 'Admin' });

        if (adminExists) {
            console.log('Admin user already exists. Seeding skipped.');
            return;
        }

        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        // Create the new Admin user
        const newAdmin = await User.create({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: hashedPassword, 
            role: 'Admin',
            fullName: 'Platform Administrator',
            contactInfo: ADMIN_EMAIL,
        });

        console.log(`✅ Admin user created successfully: ${newAdmin.email}`);
    } catch (error) {
        console.error('❌ Error during admin seeding:', error.message);
    } finally {
        mongoose.disconnect();
    }
};

// 3. Run the Seeder
const runSeeder = async () => {
    await connectDB();
    await seedAdmin();
};

runSeeder();