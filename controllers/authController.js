const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { revokeToken } = require("../middleware/authMiddleware");

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email, and password are required." });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = createToken(user._id);
    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user." });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = createToken(user._id);
    return res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login." });
  }
}

function logout(req, res) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (token) {
    revokeToken(token);
  }

  return res.json({ message: "Logout successful." });
}

function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { register, login, logout, me };
