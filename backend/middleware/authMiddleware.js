const jwt = require("jsonwebtoken");
const User = require("./../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("error: ", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { authMiddleware }