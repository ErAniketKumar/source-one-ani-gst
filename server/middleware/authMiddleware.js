const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect — Verifies JWT token and attaches user to req.user
 * Rejects: missing token, invalid token, blocked users
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token. Access denied." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user fresh from DB (catches isBlocked changes post-login)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: "Your account has been blocked. Contact admin." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

/**
 * adminOnly — Must be used AFTER protect middleware.
 * Rejects any non-ADMIN role.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Admin access required." });
};

module.exports = { protect, adminOnly };
