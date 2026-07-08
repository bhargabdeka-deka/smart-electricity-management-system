// routes/HelpdeskRoutes.js OR routes/userRoutes.js (depending on your setup)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Usage = require('../models/Usage');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
require('dotenv').config();

// 📝 Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phoneNumber, district, meterNumber } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !phoneNumber?.trim() ||
      !district?.trim() ||
      !meterNumber?.trim()
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      name,
      email,
      password, // will be hashed by schema pre-save hook
      phoneNumber,
      district,
      meterNumber
    });

    console.log('💾 Trying to save new user...');
    const savedUser = await newUser.save();
    console.log('✅ Saved user to DB:', {
      email: savedUser.email,
      meterNumber: savedUser.meterNumber
    });

    const token = jwt.sign(
      {
        userId: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        meterNumber: savedUser.meterNumber
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      phoneNumber: savedUser.phoneNumber,
      district: savedUser.district,
      meterNumber: savedUser.meterNumber
    });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// 🔐 Login Route
router.post('/login', async (req, res) => {
  console.log('🚦 Login route hit with:', req.body);
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = await User.findOne({ email });
    console.log('🧠 Found user:', user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔍 Password match result:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        meterNumber: user.meterNumber
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      district: user.district,
      meterNumber: user.meterNumber
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// 🛡️ Dashboard
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      name: user.name,
      email: user.email,
      district: user.district,
      meterNumber: user.meterNumber
    });
  } catch (err) {
    console.error('❌ Dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📊 Usage Tracker for authenticated user
// GET /api/users/usage
router.get('/usage', verifyToken, async (req, res) => {
  try {
    const meter = req.user.meterNumber;

    console.log("\n========== USAGE DEBUG ==========");
    console.log("Meter:", meter);

    const count = await Usage.countDocuments();
    console.log("Total Usage Docs:", count);

    const all = await Usage.find();
    console.log("Mongo DB Name:", mongoose.connection.db.databaseName);
    console.log("All Docs:", JSON.stringify(all, null, 2));

    const record = await Usage.findOne({ meterNumber: meter });

    console.log("Matched Record:", JSON.stringify(record, null, 2));

    if (!record) {
      console.log("Returning []");
      return res.json([]);
    }

    console.log("Returning DB Usage");
    return res.json(record.monthlyUsage);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// 👤 Profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      district: user.district,
      meterNumber: user.meterNumber
    });
  } catch (err) {
    console.error('❌ Profile fetch error:', err.message);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

/* 
// KYC routes commented out—unmodified 
router.post('/kyc', verifyToken, multer(...), userController.submitKYC);
router.get('/kyc-status', verifyToken, async ...);
*/

module.exports = router;