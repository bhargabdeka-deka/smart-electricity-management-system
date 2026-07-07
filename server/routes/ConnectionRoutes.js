// routes/ConnectionRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/authMiddleware');
const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');

const mongoose = require('mongoose');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/applications/');
  },
  filename: (req, file, cb) => {
    const uniqueId = new mongoose.Types.ObjectId().toHexString();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${file.fieldname}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = /pdf|jpg|jpeg|png/i;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.originalname}. Only PDF, JPG, JPEG, and PNG are allowed.`));
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter 
});

const uploadMiddleware = upload.fields([
  { name: 'aadhaar', maxCount: 1 },
  { name: 'proof', maxCount: 1 }
]);

const handleUpload = (req, res, next) => {
  uploadMiddleware(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// POST – submit new connection request (unchanged)
router.post(
  '/',
  verifyToken,
  handleUpload,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const activeRequest = await ConnectionRequest.findOne({
        userId: user._id,
        status: { 
          $nin: ['Withdrawn', 'Rejected'] 
        }
      });
      if (activeRequest) {
        return res.status(400).json({ message: 'You already have an active connection request.' });
      }

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
          req.files.aadhaar ? req.files.aadhaar[0].path.replace(/\\/g, '/') : '',
          req.files.proof ? req.files.proof[0].path.replace(/\\/g, '/') : ''
        ].filter(Boolean)
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
      }).sort({ createdAt: -1 });
      if (!reqDoc) return res.status(404).json({ status: 'Not Applied' });
      return res.json(reqDoc);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch status' });
    }
  }
);

// GET - fetch connection history for current user
router.get(
  '/history',
  verifyToken,
  async (req, res) => {
    try {
      const history = await ConnectionRequest.find({
        userId: req.user.userId
      }).sort({ createdAt: -1 });
      res.json(history);
    } catch (err) {
  console.error("===== HISTORY ERROR =====");
  console.error(err);
  console.error(err.stack);

  res.status(500).json({
    message: err.message
  });
}
  }
);
// GET - fetch specific connection request
router.get(
  '/:id',
  verifyToken,
  async (req, res) => {
    try {
      const reqDoc = await ConnectionRequest.findOne({
        _id: req.params.id,
        userId: req.user.userId
      });
      if (!reqDoc) return res.status(404).json({ message: 'Application not found' });
      res.json(reqDoc);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch application details' });
    }
  }
);

// PUT – withdraw application
router.put(
  '/withdraw',
  verifyToken,
  async (req, res) => {
    try {
      const reqDoc = await ConnectionRequest.findOne({
        userId: req.user.userId,
        status: { $nin: ['Withdrawn', 'Completed', 'Activated', 'Meter Installed'] }
      }).sort({ createdAt: -1 });

      if (!reqDoc) {
        return res.status(400).json({ message: 'No active application found to withdraw.' });
      }

      reqDoc.status = 'Withdrawn';
      reqDoc.withdrawnAt = new Date();
      reqDoc.withdrawalReason = 'Customer Request';
      await reqDoc.save();

      res.status(200).json({ message: 'Application withdrawn successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;