const mongoose = require("mongoose");
const Profile = mongoose.model("UserProfile");

const checkProfileExist = async (req, res, next) => {
  const userProfile = await Profile.findOne({ userId: req.user._id });
  console.log(userProfile);
  if (!userProfile) {
    return res.status(500).send({ error: "User must have profile first." });
  }
  next();
};

module.exports = checkProfileExist;
