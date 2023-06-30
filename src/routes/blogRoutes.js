const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");
const checkUserExist = require("../middlewares/checkUser");
const checkProfileExist = require("../middlewares/checkProfile");

const Blog = mongoose.model("Blog");
const Profile = mongoose.model("UserProfile");

const router = express.Router();

router.use(requireAuth);
router.use(checkUserExist);

/*
@type     -   GET
@route    -   /blog
@desc     -   It will return a single "blog" which has been created by any the users
@access   -   private
*/
router.get("/blog", async (req, res) => {
  const blogId = req.query.id;
  await Blog.find({ _id: blogId })
    .then((blogs) => {
      if (blogs.length > 0) {
        res.status(200).send(blogs);
      } else {
        res.status(200).json({ message: "No records found" });
      }
    })
    .catch((err) => {
      res.status(404).send({ error: err.message });
    });
});

/*
@type     -   GET
@route    -   /blogs-all-user
@desc     -   It will return all "blogs" which has been created by all the users
@access   -   private
*/
router.get("/blogs-all-user", async (req, res) => {
  await Blog.find()
    .then((blogs) => {
      if (blogs.length > 0) {
        res.status(200).send(blogs);
      } else {
        res.status(200).json({ message: "No records found" });
      }
    })
    .catch((err) => {
      res.status(404).send({ error: err.message });
    });
});

/*
@type     -   GET
@route    -   /blogs-by-user
@desc     -   It will return all "blogs" which has been created by a specific user
              user id will be provided as req.query in the URL
@access   -   private
*/
router.get("/blogs-by-user", async (req, res) => {
  await Blog.find({ userId: req.user._id })
    .then((blogs) => {
      if (blogs.length > 0) {
        res.status(200).send(blogs);
      } else {
        res.status(200).json({ message: "No records found" });
      }
    })
    .catch((err) => {
      res.status(404).send({ error: err.message });
    });
});

/*
@type     -   POST
@route    -   /add-blog
@desc     -   It will add a new blog created by the user to the collection.
@access   -   private
*/
router.post("/add-blog", checkProfileExist, async (req, res) => {
  const { title, content, category } = req.body;
  let name = null;
  await Profile.findOne({ userId: req.user._id }, { firstName: 1, lastName: 1 })
    .then((UserName) => {
      name = `${UserName.firstName} ${UserName.lastName}`;
    })
    .catch((err) => {
      res.status(404).send({ error: err.message });
    });

  const blog = new Blog({
    title,
    content,
    category,
    userId: req.user._id,
    author: name,
    creationDate: new Date(),
  });

  await blog
    .save()
    .then((savedBlog) => {
      res.status(200).send(savedBlog);
    })
    .catch((err) => {
      res.status(422).send({ error: err.message });
    });
});

/*
@type     -   DELETE
@route    -   /delete-blog
@desc     -   It will delete only that "blog" which has been created by a user.
              Must provide _id of the user model
@access   -   private
*/
router.delete("/delete-blog", checkProfileExist, async (req, res) => {
  await Blog.findOne({
    $and: [{ _id: req.query.id }, { userId: req.user._id }],
  })
    .then((blog) => {
      if (blog) {
        return Blog.deleteOne({ _id: req.query.id });
      } else {
        throw new Error("Blog not found");
      }
    })
    .then(() => {
      res.status(200).send("Deleted Successfully");
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
});

/*
@type     -   PUT
@route    -   /update-blog
@desc     -   It will update only that "blog" which has been created by a user.
              Must provide _id of the user model
@access   -   private
*/
router.put("/update-blog", checkProfileExist, async (req, res) => {
  const { title, content } = req.body;
  const blogId = req.query.id;

  await Blog.findOne({
    $and: [{ _id: blogId }, { userId: req.user._id }],
  })
    .then((blog) => {
      if (blog) {
        return Blog.updateOne(
          { _id: blogId },
          { title: title, content: content }
        );
      } else {
        throw new Error("Blog not found");
      }
    })
    .then(() => {
      return Blog.findOne({ _id: blogId });
    })
    .then((blog) => {
      res.status(200).json(blog);
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
});

/*
@type     -   GET
@route    -   /search-blog
@desc     -   it will search all the blogs based upon the
              title or category provided.
@access   -   private
*/
router.get("/search-blog", async (req, res) => {
  const searchTerm = req.query.search;
  await Blog.find({
    $or: [
      { title: { $regex: searchTerm, $options: "i" } },
      { category: { $regex: searchTerm, $options: "i" } },
    ],
  })
    .then((blogs) => {
      if (blogs) {
        res.status(200).json(blogs);
      } else {
        throw new Error("Blogs not found");
      }
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
});

module.exports = router;
