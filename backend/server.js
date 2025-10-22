// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/registrationDB';

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define Schema and Model
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  country: { type: String, required: true },
  gender: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// --- POST /register ---
app.post('/register', async (req, res) => {
  try {
    const { fullname, email, phone, password, country, gender } = req.body;

    // Basic validation
    if (!fullname || !email || !phone || !password || !country || !gender) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({
      fullname,
      email,
      phone,
      password: hashedPassword,
      country,
      gender
    });

    await newUser.save();
    res.status(201).json({ message: '✅ Registration successful!' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

// --- GET /get-users (for testing) ---
app.get('/get-users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('🌐 Backend server is running!');
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
