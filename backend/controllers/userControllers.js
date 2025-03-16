const User = require("../models/User");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    const user = await User.findOne({ username }).select("-password");
    if (!user)
      return res.status(404).json({ message: "This user doesn't exist" });
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal Server Error: Can't Find this User" });
  }
};

const followUnfollowUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (id === req.user._id)
      return res
        .status(400)
        .json({ message: "Can't follow or unfollow yourself" });

    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ message: "This user doesn't exist" });
    const CurrentUser = req.user;

    const isFollowing = await User.exists({ _id: req.user._id, following: id });
    if (isFollowing) {
      // unfollow
      await User.findByIdAndUpdate(CurrentUser._id, {
        $pull: { following: id },
      });
      await User.findByIdAndUpdate(id, {
        $pull: { followers: CurrentUser._id },
      });
      return res.status(200).json({ message: "User unfollowed Successfully" });
    } else {
      // follow
      await User.findByIdAndUpdate(CurrentUser._id, {
        $push: { following: id },
      });
      await User.findByIdAndUpdate(id, {
        $push: { followers: CurrentUser._id },
      });
      // todo: Send a notification to the followed user
      const notification = new Notification({
        from: CurrentUser._id,
        to: id,
        type: "follow",
      });

      await notification.save();

      return res.status(200).json(CurrentUser._id);
    }
  } catch (error) {
    console.error("Error in followUnfollowUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    const user = req.user;
    const usersFollowedByMe = user.following;

    const users = await User.aggregate([
      {
        $match: { _id: { $nin: usersFollowedByMe, $ne: user._id } },
      },
      { $sample: { size: 10 } },
      { $project: { password: 0 } },
    ]);
    res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ Message: "Server Error: Can't get Suggested Users!!" });
  }
};

const updateProfile = async (req, res) => {
  const user = req.user;
  const { username, fullName, email, bio, link, currentPassword, newPassword } =
    req.body;
  let { profileImg, coverImg } = req.body;
  try {
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const passwordsExisting = currentPassword && newPassword;
    let hashedNewPassword;
    if (passwordsExisting) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid current password" });
      }
      hashedNewPassword = await bcrypt.hash(newPassword, 10);
    }

    // if there is a profile image, upload it
    let profileUploadResults;
    if (profileImg) {
      // if there is a profile img already => delete it
      if (user.profileImg) {
        const profileImgID = user.profileImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(profileImgID);
      }
      profileUploadResults = await cloudinary.uploader.upload(profileImg);
    }

    // if there is a cover image, upload it
    let coverUploadResults;
    if (coverImg) {
      // if there is a cover img already => delete it
      if (user.coverImg) {
        const coverImgID = user.coverImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(coverImgID);
      }
      coverUploadResults = await cloudinary.uploader.upload(coverImg);
    }

    // update the user info
    (user.username = username || user.username),
      (user.fullName = fullName || user.fullName),
      (user.email = email || user.email),
      (user.bio = bio || user.bio),
      (user.link = link || user.link),
      (user.profileImg = profileUploadResults.secure_url || user.profileImg),
      (user.coverImg = coverUploadResults.secure_url || user.coverImg),
      (user.password = passwordsExisting ? hashedNewPassword : user.password),
      await User.save();
    user.password = null;
    return res
      .status(200)
      .json({ message: "Profile updated successfully", user: user });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: Can't update the user profile",
    });
  }
};

module.exports = { getUserProfile, followUnfollowUser, getSuggestedUsers };
