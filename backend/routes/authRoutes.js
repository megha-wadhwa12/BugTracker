const express = require("express");
const router = express.Router();

const { signUpUser, loginUser } = require("./../controllers/authController");
const authLimiter = require("../utils/rate-limiter");

router.post('/signup', authLimiter, signUpUser);
router.post('/login', authLimiter, loginUser);

module.exports = router;
