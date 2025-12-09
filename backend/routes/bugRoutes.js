const router = require("express").Router();
const Bug = require("../models/Bug");

const {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  deleteBug,
} = require("./../controllers/bugController");

router.post("/", createBug);

router.get("/", getBugs);

router.get("/:id", getBugById);

router.patch("/:id", updateBug);

router.delete("/:id", deleteBug);

module.exports = router;
