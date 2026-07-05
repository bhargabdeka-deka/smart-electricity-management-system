// routes/EngineerRoutes.js

const express = require('express');
const router  = express.Router();
const { verifyToken, isEngineer } = require('../middleware/authMiddleware');
const { getMyJobs, updateJobStatus } = require('../controllers/engineerController');

/**
 * GET /api/engineer/jobs
 * Returns all connection requests assigned to the logged-in engineer.
 */
router.get('/jobs', verifyToken, isEngineer, getMyJobs);

/**
 * PUT /api/engineer/jobs/:id/status
 * Updates job status and optionally saves installation details.
 */
router.put('/jobs/:id/status', verifyToken, isEngineer, updateJobStatus);

module.exports = router;
