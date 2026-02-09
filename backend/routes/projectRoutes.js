const router = require("express").Router();
const Project = require("../models/Project");

const { authMiddleware } = require("./../middleware/authMiddleware");

const {
  getProjects,
  createProject,
  getProjectById,
  deleteProject,
  updateProject,
  archiveProject,
} = require("../controllers/projectController");

router.get("/", authMiddleware, getProjects);
router.post("/", authMiddleware, createProject);
router.get("/:id", authMiddleware, getProjectById);
router.patch("/:id", authMiddleware, updateProject);
router.patch("/:id/archive", authMiddleware, archiveProject);
router.delete("/:id", authMiddleware, deleteProject);

module.exports = router;
