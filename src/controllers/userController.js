const { findUserById } = require("../model/userModel");

exports.me = async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
};

