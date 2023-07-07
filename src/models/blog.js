const mongoose = require("mongoose");

// Defining the blog schema
const blogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: "any",
  },
  author: {
    type: String,
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  favorite: {
    type: Boolean,
    default: false
  }
});

// Creating the Blog model
mongoose.model("Blog", blogSchema);
