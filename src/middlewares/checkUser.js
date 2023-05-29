const checkUserExist = (req, res, next) => {
  if (!req.user) {
    return res.status(404).send({ error: "User does not exist anymore." });
  }
  next();
};

module.exports = checkUserExist;
