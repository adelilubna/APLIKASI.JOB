const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/jobController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Publik: lihat lowongan
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

// Admin: CRUD penuh
router.post("/", verifyToken, requireRole("admin"), ctrl.create);
router.put("/:id", verifyToken, requireRole("admin"), ctrl.update);
router.delete("/:id", verifyToken, requireRole("admin"), ctrl.remove);

module.exports = router;