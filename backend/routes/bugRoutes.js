const router = require("express").Router();
const {authMiddleware} = require("./../middleware/authMiddleware");
const Bug = require("../models/Bug");

const {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  deleteBug,
} = require("./../controllers/bugController");

router.post("/", authMiddleware, createBug);

router.get("/", authMiddleware, getBugs);

router.get("/:id", authMiddleware, getBugById);

router.patch("/:id", authMiddleware, updateBug);

router.delete("/:id", authMiddleware, deleteBug);

module.exports = router;