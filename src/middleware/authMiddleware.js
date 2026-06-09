const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) return res.status(403).json({ msg: "No token provided" });

  const parts = String(authHeader).split(" ");
  const bearer = parts.length === 2 ? parts[1] : null;
  if (!bearer) return res.status(401).json({ msg: "Invalid Authorization header" });

  jwt.verify(bearer, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "Unauthorized" });

    req.user = decoded;
    next();
  });
};

exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ msg: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ msg: "Forbidden" });
    next();
  };
};