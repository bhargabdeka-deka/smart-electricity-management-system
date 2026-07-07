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
 * Includes dynamic workload and availability calculation.
 */
exports.fetchEngineers = async (req, res) => {
  try {
    // 1. Fetch engineers with required fields (including new 'district' field)
    const engineers = await User.find(
      { role: 'engineer' },
      'name email phoneNumber district'
    ).lean();

    // 2. Fetch active workloads in a single efficient query (Avoids N+1)
    const activeStatuses = ['Engineer Assigned', 'Visit Scheduled', 'Installation In Progress'];
    
    const workloadStats = await ConnectionRequest.aggregate([
      {
        $match: {
          assignedEngineer: { $in: engineers.map(e => e._id) },
          status: { $in: activeStatuses }
        }
      },
      {
        $group: {
          _id: '$assignedEngineer',
          count: { $sum: 1 },
          visitDates: { $push: '$visitDate' }
        }
      }
    ]);

    // 3. Create a map for O(1) lookup
    const workloadMap = workloadStats.reduce((acc, curr) => {
      acc[curr._id.toString()] = {
        count: curr.count,
        visitDates: curr.visitDates.filter(d => d) // remove nulls
      };
      return acc;
    }, {});

    // 4. Merge data and derive availability (frontend will handle dynamic badge based on selected date)
    const enrichedEngineers = engineers.map(eng => {
      const stats = workloadMap[eng._id.toString()] || { count: 0, visitDates: [] };
      return {
        ...eng,
        workload: stats.count,
        visitDates: stats.visitDates
      };
    });

    return res.json(enrichedEngineers);
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
  const { engineerId, visitDate, remarks } = req.body;
  const { id } = req.params;

  if (!engineerId) {
    return res.status(400).json({ message: 'Engineer ID is required' });
  }

  try {
    const engineer = await User.findOne({ _id: engineerId, role: 'engineer' });
    if (!engineer) {
      return res.status(404).json({ message: 'Engineer not found or invalid role' });
    }

    if (visitDate) {
      const activeStatuses = ['Engineer Assigned', 'Visit Scheduled', 'Installation In Progress'];
      const currentAssignments = await ConnectionRequest.countDocuments({
        assignedEngineer: engineerId,
        status: { $in: activeStatuses },
        visitDate: visitDate
      });

      if (currentAssignments >= 4) {
        return res.status(400).json({ 
          message: 'This engineer is fully booked on the selected date. Please choose another engineer or another visit date.' 
        });
      }
    }

    const updatePayload = {
      assignedEngineer: engineerId,
      assignedBy:       req.user.userId,
      assignmentDate:   new Date(),
      status:           'Engineer Assigned'
    };

    if (visitDate) updatePayload.visitDate = visitDate;
    if (remarks)   updatePayload.installationRemarks = remarks;

    const updated = await ConnectionRequest.findByIdAndUpdate(
      id,
      updatePayload,
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