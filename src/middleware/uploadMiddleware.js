const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const userId = req.user ? req.user.id : "unknown";
    cb(null, `${file.fieldname}_${userId}_${Date.now()}${ext}`);
  },
});

const cvFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Hanya file PDF, DOC, DOCX yang diizinkan untuk CV."));
};

const imageFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Hanya file JPG, PNG, WEBP yang diizinkan untuk gambar."));
};

exports.uploadCV = multer({
  storage,
  fileFilter: cvFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single("cv");

exports.uploadPhoto = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single("photo");

exports.uploadLogo = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single("logo");
