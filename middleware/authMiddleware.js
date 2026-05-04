const jwt = require("jsonwebtoken");
const User = require("../models/User");

const revokedTokens = new Set();

function revokeToken(token) {
  revokedTokens.add(token);
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: token missing." });
  }

  if (revokedTokens.has(token)) {
    return res.status(401).json({ message: "Unauthorized: token revoked." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found." });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid token." });
  }
}

module.exports = { authMiddleware, revokeToken };
