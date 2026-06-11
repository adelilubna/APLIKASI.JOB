const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../model/index");

const ALLOWED_ROLES = new Set(["admin", "applicant", "company", "recruiter"]);

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, msg: "Email & password wajib diisi." });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, msg: "Email sudah terdaftar." });
    }

    const selectedRole = role || "applicant";
    if (!ALLOWED_ROLES.has(selectedRole)) {
      return res.status(400).json({
        success: false,
        msg: `Role tidak valid. Pilihan: ${[...ALLOWED_ROLES].join(", ")}`,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: passwordHash, role: selectedRole });

    res.status(201).json({ success: true, message: "Registrasi berhasil!", userId: user.id, role: user.role });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, msg: "Email & password wajib diisi." });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, msg: "User tidak ditemukan." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, msg: "Password salah." });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, msg: "JWT_SECRET belum diset di .env" });
    }

    const payload = { id: user.id, role: user.role, company_id: user.company_id || null };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, role: user.role, company_id: user.company_id },
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};
