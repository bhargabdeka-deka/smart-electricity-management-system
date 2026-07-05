// routes/AdminRoutes.js

const express              = require('express');
const router               = express.Router();
const mongoose             = require('mongoose');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const ConnectionRequest    = require('../models/ConnectionRequest');
const HelpdeskTicket       = require('../models/HelpdeskTicket');

// Import all admin controllers
const {
  fetchHelpdeskTickets,
  fetchKycSubmissions,
  updateKycStatus,
  fetchEngineers,
  assignEngineer
} = require('../controllers/adminController');

/**
 * GET /api/admin/applications
 * List all connection applications
 */
router.get(
  '/applications',
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      console.log(`🔐 Admin ${req.user.email} fetching applications`);
      const requests = await ConnectionRequest
        .find()
        .sort({ createdAt: -1 });

      return res.json(requests);
    } catch (err) {
      console.error('❌ Fetch applications failed:', err.message);
      return res
        .status(500)
        .json({ message: 'Failed to fetch applications' });
    }
  }
);

/**
 * PUT /api/admin/applications/:id/status
 * Update a connection application’s status
 */
router.put(
  '/applications/:id/status',
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res
          .status(400)
          .json({ message: 'Missing status value' });
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res
          .status(400)
          .json({ message: 'Invalid application ID' });
      }

      const updated = await ConnectionRequest.findByIdAndUpdate(
        req.params.id,
        { status, decisionDate: new Date() },
        { new: true }
      );
      if (!updated) {
        return res
          .status(404)
          .json({ message: 'Request not found' });
      }

      console.log(
        `✅ Admin ${req.user.email} set application ${req.params.id} to ${status}`
      );
      return res.json({ message: `Status updated to ${status}`, updated });
    } catch (err) {
      console.error('❌ Update status failed:', err.message);
      return res
        .status(500)
        .json({ message: 'Failed to update application status' });
    }
  }
);

/**
 * GET /api/admin/tickets
 * Fetch all helpdesk tickets WITH populated user subdocs
 */
router.get(
  '/tickets',
  verifyToken,
  isAdmin,
  fetchHelpdeskTickets
);

/**
 * PUT /api/admin/tickets/:id/reply
 * Send an admin reply and mark ticket as Replied
 */
router.put(
  '/tickets/:id/reply',
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const { reply } = req.body;
      if (!reply?.trim()) {
        return res
          .status(400)
          .json({ message: 'Reply text is required' });
      }

      const updated = await HelpdeskTicket.findByIdAndUpdate(
        req.params.id,
        {
          adminReply: { text: reply, replyTime: new Date() },
          status: 'Replied'
        },
        { new: true }
      );
      if (!updated) {
        return res
          .status(404)
          .json({ message: 'Ticket not found' });
      }

      console.log(
        `📝 Admin ${req.user.email} replied to ticket ${req.params.id}`
      );
      return res.json({ message: 'Reply sent', ticket: updated });
    } catch (err) {
      console.error('❌ Reply failed:', err.message);
      return res
        .status(500)
        .json({ message: 'Failed to send reply' });
    }
  }
);

// KYC routes
router.get(
  '/kyc-requests',
  verifyToken,
  isAdmin,
  fetchKycSubmissions
);
router.put(
  '/kyc-status/:kycId',
  verifyToken,
  isAdmin,
  updateKycStatus
);

/**
 * GET /api/admin/engineers
 * Fetch all registered field engineers
 */
router.get('/engineers', verifyToken, isAdmin, fetchEngineers);

/**
 * PUT /api/admin/applications/:id/assign
 * Assign a field engineer to an approved application
 */
router.put('/applications/:id/assign', verifyToken, isAdmin, assignEngineer);

module.exports = router;