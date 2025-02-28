const generateToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.SECRET_KEY);
  res.cookie("token", token, { httpOnly: true, maxAge: "3d" });
};

module.exports = generateToken;
