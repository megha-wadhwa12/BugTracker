const router = require("express").Router();
const Project = require("../models/Project");

const { authMiddleware } = require("./../middleware/authMiddleware");

const {
  getProjects,
  createProject,
  getProjectById

} = require("../controllers/projectController");

router.get("/", authMiddleware, getProjects);
router.post("/", authMiddleware, createProject);
router.get("/:id", authMiddleware, getProjectById);

module.exports = router;