const express = require("express");
const router = express.Router();
const { authMiddleware } = require("./../middleware/authMiddleware");
const User = require("./../models/User");

const {
  signUpUser,
  loginUser,
  userProfile,
} = require("./../controllers/authController");
const authLimiter = require("../utils/rate-limiter");

router.post("/signup", authLimiter, signUpUser);
router.post("/login", authLimiter, loginUser);
router.get("/profile", authMiddleware, userProfile);

module.exports = router;
