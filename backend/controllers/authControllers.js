const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../lib/token");

// Login
const Login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  generateToken(user._id, res);
  res.status(200).json({ msg: "Loggin Successfully!" });
};

const SignUp = async (req, res) => {
  const { name, email, password } = req.body;
};
