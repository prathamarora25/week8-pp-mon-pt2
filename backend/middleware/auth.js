const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const { SECRET } = require("../utils/config");

// Protects routes: needs "Authorization: Bearer <token>"
const requireAuth = async (req, res, next) => {
  const authorization = req.get("Authorization");
  const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  let decodedToken;
  try {
    // throws if the token is invalid, tampered with or expired
    decodedToken = jwt.verify(match[1], SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // createToken() in userControllers signs { id: user._id }
  if (!decodedToken.id || !mongoose.Types.ObjectId.isValid(decodedToken.id)) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const user = await User.findById(decodedToken.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
