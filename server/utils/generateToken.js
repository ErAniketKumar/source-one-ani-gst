const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT token.
 * @param {string} id - User's MongoDB _id
 * @param {string} role - User's role (USER | ADMIN)
 * @returns {string} Signed JWT
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = { generateToken };
