const express = require("express");
const {
  Login,
  SignUp,
  Logout,
  checkAuth,
} = require("../controllers/authControllers");
const authenticate = require("../middlewares/authenticate");

const router = express.Router();

// login
router.post("/sign-in", Login);

// sign-up
router.post("/sign-up", SignUp);

// logout
router.get("/logout", Logout);

// check auth
router.get("/checkAuth", authenticate, checkAuth);

module.exports = router;
