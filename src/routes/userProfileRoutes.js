const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");
const checkUserExist = require("../middlewares/checkUser");

const Profile = mongoose.model("UserProfile");
const User = mongoose.model("User");
const Blog = mongoose.model("Blog");

const router = express.Router();

router.use(requireAuth);
router.use(checkUserExist);

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
  try {
    const userId = req.user._id;

    const user = await Profile.findOne({ userId: userId });
    if (!user) {
      throw new Error("User does not exist");
    }

    await Profile.deleteOne({ userId: userId });
    await User.deleteOne({ _id: userId });
    await Blog.deleteMany({ userId: userId });

    res.status(200).send("Deleted Successfully");
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

/*
@type     -   PUT
@route    -   /set-favorite-blog
@desc     -   it will set a blog as favorite or not based upon the
              blog id.
@access   -   private
*/
router.put("/set-favorite-blog", async (req, res) => {
  const userId = req.user._id; // User ID
  const blogId = req.body._id; // Blog ID

  try {
    const userProfile = await Profile.findOne({ userId: userId }); // Find user by ID

    if (!userProfile) {
      throw new Error("User Profile not found");
    }

    const blog = await Blog.findOne({ _id: blogId });

    if (!blog) {
      throw new Error("Blog not found");
    }

    //Adding or removing the blog to or from user's favorites array
    const favoritesIndex = userProfile.favorites.indexOf(blog._id);

    if (favoritesIndex!==-1) {
      // Blog is already in favorites, so remove it
      userProfile.favorites.splice(favoritesIndex, 1);
    } else {
      // Blog is not in favorites, so add it
      userProfile.favorites.push(blog._id);
    }
    
    await userProfile.save(); // Save the updated user
    
    //Updating the favorite status of the blog
    const isFavorite = userProfile.favorites.includes(blogId);
    await Blog.updateOne(
      { _id: blogId}, // Find the blog by ID
      { favorite: isFavorite } // Update the favorite field
    ).catch((err) => {
      res.status(500).send({ error: err.message });
    });
    
    const b = await Blog.findOne({ _id: blogId })
    res.status(200).json(b);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
})


module.exports = router;
