const express = require("express");
const router = express.Router();
const { matchCandidatesForJob, matchJobsForUser } = require("../controllers/matchingController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.get("/job/:job_id", verifyToken, requireRole("recruiter", "admin"), matchCandidatesForJob);
router.get("/user", verifyToken, requireRole("applicant", "user"), matchJobsForUser);

module.exports = router;
