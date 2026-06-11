const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/categoryController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Publik: lihat kategori
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

// Admin only: CRUD
router.post("/", verifyToken, requireRole("admin"), ctrl.create);
router.put("/:id", verifyToken, requireRole("admin"), ctrl.update);
router.delete("/:id", verifyToken, requireRole("admin"), ctrl.remove);

module.exports = router;
