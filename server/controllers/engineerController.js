// controllers/engineerController.js

const ConnectionRequest = require('../models/ConnectionRequest');

/**
 * GET /api/engineer/jobs
 * Fetch all connection requests assigned to the logged-in engineer.
 */
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await ConnectionRequest
      .find({ assignedEngineer: req.user.userId })
      .sort({ assignmentDate: -1 });

    return res.json(jobs);
  } catch (error) {
    console.error('❌ Engineer jobs fetch error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch assigned jobs' });
  }
};

/**
 * PUT /api/engineer/jobs/:id/status
 * Update job status. Accepted statuses:
 *   Visit Scheduled | Installation In Progress | Meter Installed | Completed
 * When completing, also saves meterSerialNumber, installationDate, installationRemarks.
 */
exports.updateJobStatus = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    visitDate,
    meterSerialNumber,
    installationDate,
    installationRemarks
  } = req.body;

  const ALLOWED = [
    'Visit Scheduled',
    'Installation In Progress',
    'Meter Installed',
    'Completed'
  ];

  if (!status || !ALLOWED.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Allowed: ${ALLOWED.join(', ')}`
    });
  }

  try {
    const job = await ConnectionRequest.findOne({
      _id: id,
      assignedEngineer: req.user.userId   // engineer can only update their own jobs
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or not assigned to you' });
    }

    job.status = status;

    if (visitDate)            job.visitDate            = new Date(visitDate);
    if (meterSerialNumber)    job.meterSerialNumber    = meterSerialNumber;
    if (installationDate)     job.installationDate     = new Date(installationDate);
    if (installationRemarks)  job.installationRemarks  = installationRemarks;

    if (status === 'Completed') {
      job.completionDate = new Date();
    }

    await job.save();

    console.log(
      `🔧 Engineer ${req.user.email} updated job ${id} → ${status}`
    );
    return res.json({ message: `Job updated to "${status}"`, job });
  } catch (error) {
    console.error('❌ Update job status error:', error.message);
    return res.status(500).json({ message: 'Failed to update job status' });
  }
};
