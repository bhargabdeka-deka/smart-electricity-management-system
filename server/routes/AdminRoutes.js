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
  assignEngineer,
  updateApplicationStatus
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
  updateApplicationStatus
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

/**
 * GET /api/admin/stats
 * Dashboard summary statistics — aggregated counts across all collections
 */
router.get(
  '/stats',
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const KycSubmission = require('../models/KycSubmission');

      const [appStats, kycStats, ticketStats] = await Promise.all([
        ConnectionRequest.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        KycSubmission.aggregate([
          { $group: { _id: '$kycStatus', count: { $sum: 1 } } }
        ]),
        HelpdeskTicket.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      ]);

      const toMap = (arr) =>
        arr.reduce((acc, { _id, count }) => {
          acc[_id] = count;
          return acc;
        }, {});

      const apps    = toMap(appStats);
      const kyc     = toMap(kycStats);
      const tickets = toMap(ticketStats);

      const totalApps = Object.values(apps).reduce((a, b) => a + b, 0);

      return res.json({
        applications: {
          total:            totalApps,
          pending:          apps['Pending']           || 0,
          approved:         apps['Approved']          || 0,
          rejected:         apps['Rejected']          || 0,
          withdrawn:        apps['Withdrawn']         || 0,
          completed:        (apps['Completed'] || 0) + (apps['Meter Installed'] || 0),
          engineerAssigned: apps['Engineer Assigned'] || 0,
          underReview:      apps['Under Review']      || 0
        },
        kyc: {
          pending:  kyc['Pending']  || 0,
          approved: kyc['Approved'] || 0,
          rejected: kyc['Rejected'] || 0
        },
        tickets: {
          open:     tickets['Pending']  || 0,
          replied:  tickets['Replied']  || 0,
          resolved: tickets['Resolved'] || 0
        }
      });
    } catch (err) {
      console.error('❌ Stats fetch failed:', err.message);
      return res.status(500).json({ message: 'Failed to fetch stats' });
    }
  }
);

/**
 * GET /api/admin/applications/:id
 * Fetch a single connection application with populated engineer details
 */
router.get(
  '/applications/:id',
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid application ID' });
      }
      const app = await ConnectionRequest
        .findById(req.params.id)
        .populate('assignedEngineer', 'name email phoneNumber')
        .populate('assignedBy', 'name email');

      if (!app) {
        return res.status(404).json({ message: 'Application not found' });
      }
      return res.json(app);
    } catch (err) {
      console.error('❌ Single application fetch failed:', err.message);
      return res.status(500).json({ message: 'Failed to fetch application' });
    }
  }
);

/**
 * PUT /api/admin/applications/:id/remarks
 * Add admin remarks to an application
 */
router.put(
  '/applications/:id/remarks',
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const { remarks } = req.body;
      if (!remarks?.trim()) {
        return res.status(400).json({ message: 'Remarks are required' });
      }
      const updated = await ConnectionRequest.findByIdAndUpdate(
        req.params.id,
        { installationRemarks: remarks },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ message: 'Application not found' });
      }
      return res.json({ message: 'Remarks saved', updated });
    } catch (err) {
      console.error('❌ Add remarks failed:', err.message);
      return res.status(500).json({ message: 'Failed to save remarks' });
    }
  }
);

/**
 * PUT /api/admin/tickets/:id/close
 * Mark a helpdesk ticket as Resolved
 */
router.put(
  '/tickets/:id/close',
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const updated = await HelpdeskTicket.findByIdAndUpdate(
        req.params.id,
        { status: 'Resolved' },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      return res.json({ message: 'Ticket closed', ticket: updated });
    } catch (err) {
      console.error('❌ Close ticket failed:', err.message);
      return res.status(500).json({ message: 'Failed to close ticket' });
    }
  }
);

module.exports = router;