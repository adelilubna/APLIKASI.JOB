const { User } = require("../model/index");

exports.me = async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: ["id", "email", "role"] });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
};
