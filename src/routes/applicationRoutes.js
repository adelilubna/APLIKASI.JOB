const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/applicationController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", ctrl.getAll);
router.post("/", requireRole("user", "applicant", "admin"), ctrl.create);

router.get("/job/:job_id", requireRole("admin", "recruiter"), ctrl.getByJob);
router.patch("/:id/status", requireRole("admin", "recruiter"), ctrl.updateStatus);

router.get("/:id", ctrl.getById);
router.delete("/:id", requireRole("admin"), ctrl.remove);

module.exports = router;
