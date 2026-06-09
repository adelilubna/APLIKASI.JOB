const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { me } = require("../controllers/userController");

router.get("/me", verifyToken, me);

module.exports = router;

