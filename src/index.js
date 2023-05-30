// Importing required models
require("./models/user");
require("./models/blog");
require("./models/userProfile");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const requireAuth = require("./middlewares/requireAuth");
const cors = require('cors')

const app = express();

//Middleware for allowing cross-origin HTTP requests
app.use(cors())

// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Registering authentication routes
app.use(authRoutes);

// Registering blog routes
app.use(blogRoutes);

// Registering user profile routes
app.use(userProfileRoutes);

// MongoDB connection URI
const mongoUri =
  "mongodb+srv://bharatraj07:Snappy150897@cluster0.6va19gp.mongodb.net/Thoughts-BlogApp";

// Connecting to MongoDB
mongoose.connect(mongoUri);

// Event handler for successful MongoDB connection
mongoose.connection.on("connected", () => {
  console.log("Connected to mongo instance");
});

// Event handler for MongoDB connection error
mongoose.connection.on("error", (err) => {
  console.error("Error connecting to mongo", err);
});

// Example protected route
app.get("/", requireAuth, (req, res) => {
  res.send(`Your email: ${req.user.email}`);
});

// Starting the server
app.listen(3000, () => {
  console.log("listening on port 3000");
});
