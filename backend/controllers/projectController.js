const Project = require("../models/Project");
const mongoose = require("mongoose");

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    })
      .populate("owner", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const existing = await Project.findOne({
      name,
      owner: req.user._id,
      isArchived: false,
    });

    if (existing) {
      return res.status(409).json({
        message: "Project with same name already exists",
      });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProjectById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      members: req.user._id,
    }).populate("owner", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to delete this project",
      });
    }

    await Project.findByIdAndDelete(projectId);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const project = await Project.findById(projectId);

    if (!project || project.isArchived) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to update this project",
      });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const archiveProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const project = await Project.findById(projectId);

    if (!project || project.isArchived) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to archive this project",
      });
    }

    project.isArchived = true;
    await project.save();

    res.status(200).json({ message: "Project archived successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  deleteProject,
  updateProject,
  archiveProject,
};
