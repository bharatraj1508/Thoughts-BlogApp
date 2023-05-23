const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");

const Blog = mongoose.model("Blog");

const router = express.Router();

router.use(requireAuth);

/*
@type     -   GET
@route    -   /blogs-all-user
@desc     -   It will return all "blogs" which has been created by all the users
@access   -   private
*/
router.get("/blogs-all-user", (req, res) => {
  Blog.find()
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
router.get("/blogs-by-user", (req, res) => {
  Blog.find({ userId: req.user._id })
    .then((blogs) => {
      if (blogs.length > 0) {
        res.status(200).send(blogs);
      } else {
        res.status(404).json({ message: "No records found" });
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
router.post("/add-blog", (req, res) => {
  const { title, content } = req.body;
  const blog = new Blog({ title, content, userId: req.user._id });

  blog
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
router.delete("/delete-blog", (req, res) => {
  Blog.findOne({ _id: req.query.id })
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
router.put("/update-blog", (req, res) => {
  const { title, content } = req.body;
  const blogId = req.query.id;

  Blog.findOne({ _id: blogId })
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

module.exports = router;
