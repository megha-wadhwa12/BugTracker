const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 min
  max: 10, // max 10 attempts
  message: "Too many attempts, try again later",
});

module.exports = authLimiter;