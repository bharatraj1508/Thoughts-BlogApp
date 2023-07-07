const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
  },
  favorites: [{
    type: String
  }]
});

// Creating the Blog model
mongoose.model("UserProfile", profileSchema);
