const express = require("express");
const router = express.Router();
const { addToShortlist, getShortlist, removeFromShortlist } = require("../controllers/shortlistController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.post("/", verifyToken, requireRole("recruiter", "admin"), addToShortlist);
router.get("/", verifyToken, requireRole("recruiter", "admin"), getShortlist);
router.delete("/:id", verifyToken, requireRole("recruiter", "admin"), removeFromShortlist);

module.exports = router;
