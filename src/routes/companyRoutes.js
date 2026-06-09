const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/companyController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Semua endpoint butuh token
router.use(verifyToken);

// Admin bisa semua; User terbatas (hanya read)
router.get("/", ctrl.getAll); // admin: semua | user: milik sendiri (jika punya)
router.get("/:id", ctrl.getById);
router.post("/", requireRole("admin"), ctrl.create);
router.put("/:id", requireRole("admin"), ctrl.update);
router.delete("/:id", requireRole("admin"), ctrl.remove);

module.exports = router;