const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/companyController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { uploadLogo } = require("../middleware/uploadMiddleware");

// Publik: lihat perusahaan
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

// Company/admin: buat perusahaan baru
router.post("/", verifyToken, requireRole("admin", "company"), uploadLogo, ctrl.create);

// Company/recruiter/admin: update perusahaan (cek ownership di controller)
router.put("/:id", verifyToken, requireRole("admin", "company", "recruiter"), uploadLogo, ctrl.update);

// Admin only: hapus, verifikasi, assign recruiter
router.delete("/:id", verifyToken, requireRole("admin"), ctrl.remove);
router.patch("/:id/verify", verifyToken, requireRole("admin"), ctrl.verify);
router.post("/:id/assign-recruiter", verifyToken, requireRole("admin"), ctrl.assignRecruiter);

module.exports = router;
