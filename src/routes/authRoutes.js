const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");
const Profile = mongoose.model("UserProfile");

const router = express.Router();

/*
@type     -   POST
@route    -   /signup
@desc     -   Endpoint to singup with a new email and password
@access   -   public
*/
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  let token = null;
  try {
    const user = new User({ email, password });
    await user.save().then(async () => {
      token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
      const userProfile = new Profile({
        userId: user._id,
        firstName: "",
        lastName: "",
        email: email,
        dob: "",
      });
      await userProfile.save();
    });
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

/*
@type     -   POST
@route    -   /signup
@desc     -   Endpoint to sigin with an existing email and password
@access   -   public
*/
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).send({ error: "Must provide email and password" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send({ error: "Invalid email or password" });
  }
  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
    res.send({ token });
  } catch (err) {
    res.status(404).send({ error: "Invalid password" });
  }
});

module.exports = router;
