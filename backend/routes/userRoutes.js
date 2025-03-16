const express = require("express");
const {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUsers,
  updateProfile,
} = require("../controllers/userControllers");
const authenticate = require("../middlewares/authenticate");

const router = express.Router();

router.get("/profile/:username", authenticate, getUserProfile);

router.get("/suggested", authenticate, getSuggestedUsers);

router.post("/follow/:id", authenticate, followUnfollowUser);

router.patch("/update-profile", authenticate, updateProfile);

module.exports = router;
