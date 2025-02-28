const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../lib/token");

// Login
const Login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  generateToken(user._id, res);
  res.status(200).json({ msg: "Loggin Successfully!" });
};

// Sign Up
const SignUp = async (req, res) => {
  const { username, fullName, email, password } = req.body;
  console.log(username, fullName, email, password);
  try {
    if (!username || !fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }
    const newUser = await User.create({
      username,
      fullName,
      email,
      password: hashedPassword,
    });
    generateToken(newUser._id, res);
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

// Logout
const Logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: new Date(0),
    });
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error: Error in Logout" });
  }
};

// Get the Logged In user
const checkAuth = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error: Error in checkAuth" });
  }
};

module.exports = {
  SignUp,
  Login,
  Logout,
  checkAuth,
};
