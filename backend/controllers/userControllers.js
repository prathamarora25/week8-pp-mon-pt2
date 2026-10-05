const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { SECRET } = require("../utils/config");

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
    },
    SECRET,
    {
      expiresIn: "1h",
    }
  );
};

const userData = (user, token) => ({
  username: user.username,
  name: user.name,
  phoneNumber: user.phoneNumber,
  role: user.role,
  token,
});

const signup = async (req, res) => {
  const { username, password, phoneNumber, name, role } = req.body;

  if (!username || !password || !phoneNumber || !name) {
    return res.status(400).json({
      error: "username, password, phoneNumber and name are required",
    });
  }

  if (role && !["user", "admin"].includes(role)) {
    return res.status(400).json({
      error: "Invalid role",
    });
  }

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        error: "Username already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: passwordHash,
      phoneNumber,
      name,
      role: role || "user",
    });

    const token = createToken(user);

    return res.status(201).json(userData(user, token));
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "username and password are required",
    });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        error: "Invalid username or password",
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      return res.status(400).json({
        error: "Invalid username or password",
      });
    }

    const token = createToken(user);

    return res.status(200).json(userData(user, token));
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = {
  signup,
  login,
};
