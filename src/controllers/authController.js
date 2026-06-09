const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../model/index");

const ALLOWED_ROLES = new Set(["admin", "applicant", "company", "recruiter", "hrd", "user"]);

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email & password wajib diisi" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ msg: "Email sudah terdaftar" });
    }

    const selectedRole = role || "user";
    if (!ALLOWED_ROLES.has(selectedRole)) {
      return res.status(400).json({ msg: "Role tidak valid" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: passwordHash, role: selectedRole });

    res.status(201).json({ message: "User registered!", userId: user.id });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email & password wajib diisi" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.password) {
      return res.status(500).json({ msg: "Password di DB kosong" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Wrong password" });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: "JWT_SECRET belum diset di .env" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
