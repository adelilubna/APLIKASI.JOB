const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/profileController");
const { verifyToken } = require("../middleware/authMiddleware");
const { uploadCV, uploadPhoto } = require("../middleware/uploadMiddleware");

router.get("/me", verifyToken, ctrl.myProfile);
router.put("/me", verifyToken, ctrl.upsertMyProfile);

// Upload CV: POST /api/profiles/me/cv  (multipart/form-data, field: cv)
router.post("/me/cv", verifyToken, uploadCV, ctrl.uploadCV);

// Upload foto profil: POST /api/profiles/me/photo  (multipart/form-data, field: photo)
router.post("/me/photo", verifyToken, uploadPhoto, ctrl.uploadPhoto);

module.exports = router;
