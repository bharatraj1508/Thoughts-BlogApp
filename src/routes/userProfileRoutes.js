const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");

const Profile = mongoose.model("UserProfile");
const User = mongoose.model("User");

const router = express.Router();

router.use(requireAuth);

/*
@type     -   GET
@route    -   /get-profile-info
@desc     -   It will return the user profile information
              based upon the logged in user
@access   -   private
*/
router.get("/get-profile-info", async (req, res) => {
  await Profile.findOne({ userId: req.user._id })
    .then((user) => {
      if (user) {
        res.status(200).send(user);
      } else {
        throw new Error("User does not exist");
      }
    })
    .catch((err) => {
      res.status(422).send({ error: err.message });
    });
});

/*
@type     -   POST
@route    -   /add-profile-info
@desc     -   It will add the user profile information
              based upon the logged in user
@access   -   private
*/
router.post("/add-profile-info", async (req, res) => {
  const { first, last, dob } = req.body;

  await Profile.findOne({ userId: req.user._id })
    .then((user) => {
      if (user) {
        throw new Error("User already Exist");
      } else {
        const user = new Profile({
          userId: req.user._id,
          firstName: first,
          lastName: last,
          email: req.user.email,
          dob: dob,
        });

        user
          .save()
          .then((savedUser) => {
            res.status(200).json(savedUser);
          })
          .catch((err) => res.status(422).send({ error: err.message }));
      }
    })
    .catch((err) => res.status(422).send({ error: err.message }));
});

/*
@type     -   PUT
@route    -   /update-profile-info
@desc     -   It will update the user profile information
              based upon the logged in user
@access   -   private
*/
router.put("/update-profile-info", async (req, res) => {
  const { first, last, dob, email } = req.body;

  await Profile.findOne({ userId: req.user._id })
    .then((user) => {
      if (user) {
        return Profile.updateOne(
          { userId: req.user._id },
          { firstName: first, lastName: last, email: email, dob: dob }
        );
      } else {
        throw new Error("User does not exist");
      }
    })
    .then(() => {
      return User.updateOne({ _id: req.user._id }, { email: email });
    })
    .then(() => {
      return Profile.findOne({ userId: req.user._id });
    })
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => res.status(422).send({ error: err.message }));
});

/*
@type     -   DELETE
@route    -   /delete-profile-info
@desc     -   It will delete the user profile information
              based upon the logged in user
@access   -   private
*/
router.delete("/delete-profile-info", async (req, res) => {
  const userId = req.user._id;

  await Profile.findOne({ userId: userId })
    .then((user) => {
      if (user) {
        return Profile.deleteOne({ userId: userId });
      } else {
        throw new Error("User does not exist");
      }
    })
    .then(() => {
      return User.deleteOne({ _id: userId });
    })
    .then(() => {
      res.status(200).send("Deleted Successfully");
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
});

module.exports = router;
