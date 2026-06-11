const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/jobController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Publik: lihat lowongan (bisa filter via query: category_id, location, job_type, keyword)
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

// Admin/company/recruiter: buat, edit, hapus lowongan
router.post("/", verifyToken, requireRole("admin", "company", "recruiter"), ctrl.create);
router.put("/:id", verifyToken, requireRole("admin", "company", "recruiter"), ctrl.update);
router.delete("/:id", verifyToken, requireRole("admin", "company", "recruiter"), ctrl.remove);

module.exports = router;
