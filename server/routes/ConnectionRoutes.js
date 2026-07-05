// routes/ConnectionRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/authMiddleware');
const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');

const upload = multer({ storage: multer.memoryStorage() });

// POST – submit new connection request (unchanged)
router.post(
  '/',
  verifyToken,
  upload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'proof', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // validate fields (omitted for brevity)...

      const newReq = new ConnectionRequest({
        fullName: req.body.fullName,
        userType: req.body.userType,
        address: req.body.address,
        pincode: req.body.pincode,
        load: Number(req.body.load),
        meterType: req.body.meterType,
        contact: req.body.contact,
        visitDate: req.body.visitDate,
        status: 'Pending',
        meterNumber: req.body.meterNumber.trim(),
        userId: user._id,
        email: user.email,
        documents: [
          req.files.aadhaar[0].originalname,
          req.files.proof[0].originalname
        ]
      });

      await newReq.save();
      res.status(201).json({ message: 'Application submitted successfully!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET – fetch current user’s connection status
router.get(
  '/my-request',
  verifyToken,
  async (req, res) => {
    try {
      const reqDoc = await ConnectionRequest.findOne({
        userId: req.user.userId
      });
      if (!reqDoc) return res.status(404).json({ status: 'Not Applied' });
      return res.json({ status: reqDoc.status });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch status' });
    }
  }
);

module.exports = router;