const jwt = require("jsonwebtoken");
const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.SECRET_KEY, {
    expiresIn: "3d",
  });
  res.cookie("jwt", token, {
    httpOnly: true, //XSS
    maxAge: 1000 * 60 * 60 * 24 * 3,
    sameSite: "strict", //CSRF
    secure: process.env.NODE_ENV !== "development",
  });
};

module.exports = generateToken;
