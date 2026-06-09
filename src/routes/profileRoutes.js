const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { myProfile, upsertMyProfile } = require("../controllers/profileController");

router.get("/me", verifyToken, myProfile);
router.put("/me", verifyToken, upsertMyProfile);

module.exports = router;

