const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Defining the user schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Middleware function executed before saving the user
userSchema.pre("save", function (next) {
  const user = this;

  // Checking if the password is modified
  if (!user.isModified("password")) {
    return next();
  }

  // Generating a salt and hashing the password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }

      // Setting the hashed password
      user.password = hash;
      next();
    });
  });
});

// Method to compare passwords
userSchema.methods.comparePassword = function (userPassword) {
  const user = this;

  return new Promise((resolve, reject) => {
    // Comparing the provided password with the stored hashed password
    bcrypt
      .compare(userPassword, user.password)
      .then((isCompared) => {
        if (isCompared) {
          return resolve(isCompared);
        } else {
          return reject(!isCompared);
        }
      })
      .catch((err) => res.send(err.message));
  });
};

// Creating the User model
mongoose.model("User", userSchema);
