// controllers/adminController.js

console.log('🔍 adminController loaded, exports so far:', exports);

const User               = require('../models/User');
const ConnectionRequest  = require('../models/ConnectionRequest');
const HelpdeskTicket     = require('../models/HelpdeskTicket');
const KycSubmission      = require('../models/KycSubmission');

/**
 * 📥 GET /api/admin/tickets
 * Fetch all helpdesk tickets *and* populate user.name + user.meterNumber
 */
exports.fetchHelpdeskTickets = async (req, res) => {
  try {
    const tickets = await HelpdeskTicket
      .find()
      .populate('user', 'name meterNumber')
      .sort({ createdAt: -1 });

    return res.json(tickets);
  } catch (error) {
    console.error('❌ Helpdesk fetch error:', error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch helpdesk tickets' });
  }
};

/**
 * 📄 GET /api/admin/kyc-requests
 * Fetch all KYC submissions for review
 */
exports.fetchKycSubmissions = async (req, res) => {
  try {
    const submissions = await KycSubmission
      .find()
      .sort({ uploadTime: -1 });

    return res.json(submissions);
  } catch (error) {
    console.error('❌ KYC fetch error:', error.message);
    return res
      .status(500)
      .json({ message: 'Failed to fetch KYC submissions' });
  }
};

/**
 * ✅ PUT /api/admin/kyc-status/:kycId
 * Update KYC status and optional remarks
 */
exports.updateKycStatus = async (req, res) => {
  const { status, remarks } = req.body;
  const kycId               = req.params.kycId;

  try {
    const submission = await KycSubmission.findById(kycId);
    if (!submission) {
      return res
        .status(404)
        .json({ message: 'KYC submission not found' });
    }

    submission.kycStatus    = status;
    submission.adminRemarks = remarks || '';
    submission.decisionDate = new Date();
    await submission.save();

    console.log(
      `✅ Admin ${req.user?.email} marked ${submission.fullName}'s KYC as ${status}`
    );
    return res.json({ message: `KYC ${status}`, submission });
  } catch (error) {
    console.error('❌ KYC update error:', error.message);
    return res
      .status(500)
      .json({ message: 'Failed to update KYC status' });
  }
};

/**
 * 👷 GET /api/admin/engineers
 * Fetch all users with role = 'engineer'
 */
exports.fetchEngineers = async (req, res) => {
  try {
    const engineers = await User.find({ role: 'engineer' }, 'name email phoneNumber');
    return res.json(engineers);
  } catch (error) {
    console.error('❌ Fetch engineers error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch engineers' });
  }
};

/**
 * 🔧 PUT /api/admin/applications/:id/assign
 * Assign a field engineer to an approved connection request
 */
exports.assignEngineer = async (req, res) => {
  const { engineerId } = req.body;
  const { id } = req.params;

  if (!engineerId) {
    return res.status(400).json({ message: 'Engineer ID is required' });
  }

  try {
    const engineer = await User.findOne({ _id: engineerId, role: 'engineer' });
    if (!engineer) {
      return res.status(404).json({ message: 'Engineer not found or invalid role' });
    }

    const updated = await ConnectionRequest.findByIdAndUpdate(
      id,
      {
        assignedEngineer: engineerId,
        assignedBy:       req.user.userId,
        assignmentDate:   new Date(),
        status:           'Engineer Assigned'
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    console.log(
      `✅ Admin ${req.user.email} assigned engineer ${engineer.name} to request ${id}`
    );
    return res.json({ message: `Engineer ${engineer.name} assigned successfully`, updated });
  } catch (error) {
    console.error('❌ Assign engineer error:', error.message);
    return res.status(500).json({ message: 'Failed to assign engineer' });
  }
};