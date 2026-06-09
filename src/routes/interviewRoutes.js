const express = require("express");
const router = express.Router();

const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const {
  schedule,
  listByApplication,
  getAll,
  getMyInterviews,
  update,
  remove,
} = require("../controllers/interviewController");

router.post(
  "/applications/:applicationId",
  verifyToken,
  requireRole("admin", "recruiter", "hrd"),
  schedule
);

router.get(
  "/applications/:applicationId",
  verifyToken,
  requireRole("admin", "recruiter", "hrd"),
  listByApplication
);

router.get(
  "/my",
  verifyToken,
  requireRole("applicant", "user"),
  getMyInterviews
);

router.get(
  "/",
  verifyToken,
  requireRole("admin", "recruiter", "hrd"),
  getAll
);

router.put(
  "/:id",
  verifyToken,
  requireRole("admin", "recruiter", "hrd"),
  update
);

router.delete(
  "/:id",
  verifyToken,
  requireRole("admin", "recruiter", "hrd"),
  remove
);

module.exports = router;
