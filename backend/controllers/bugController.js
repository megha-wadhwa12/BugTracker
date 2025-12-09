const Bug = require("../models/Bug");

// CREATE BUG
const createBug = async (req, res) => {
  try {
    const bug = await Bug.create({
      title: req.body.title,
      description: req.body.description || "",
      priority: req.body.priority || "medium",
      status: req.body.status || "open",
      assignedTo: req.body.assignedTo || "",
      activity: [
        { message: "Bug created", timestamp: new Date() }
      ]
    });

    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL BUGS + FILTERS
const getBugs = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const bugs = await Bug.find(query).sort({ updatedAt: -1 });
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET SINGLE BUG
const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });

    res.json(bug);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE BUG (Best Version)
const updateBug = async (req, res) => {
  try {
    const prev = await Bug.findById(req.params.id);
    if (!prev) return res.status(404).json({ message: "Bug not found" });

    const changes = [];

    // STATUS CHANGE
    if ("status" in req.body && req.body.status !== prev.status) {
      changes.push(`Status changed from ${prev.status} → ${req.body.status}`);
    }

    // ASSIGNEE CHANGE
    if ("assignedTo" in req.body && req.body.assignedTo !== prev.assignedTo) {
      const oldA = prev.assignedTo || "Unassigned";
      const newA = req.body.assignedTo || "Unassigned";
      changes.push(`Assignee changed from ${oldA} → ${newA}`);
    }

    // PRIORITY CHANGE
    if ("priority" in req.body && req.body.priority !== prev.priority) {
      changes.push(`Priority changed from ${prev.priority} → ${req.body.priority}`);
    }

    // TITLE CHANGE
    if ("title" in req.body && req.body.title !== prev.title) {
      changes.push("Title updated");
    }

    // DESCRIPTION CHANGE
    if ("description" in req.body && req.body.description !== prev.description) {
      changes.push("Description updated");
    }

    // Update bug after computing changes
    const updated = await Bug.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Bug not found" });

    // Add activity entries
    if (changes.length > 0) {
      const entries = changes.map((msg) => ({
        message: msg,
        timestamp: new Date()
      }));

      updated.activity = [...(updated.activity || []), ...entries];
      await updated.save();
    }

    res.json(updated);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE BUG
const deleteBug = async (req, res) => {
  try {
    const deleted = await Bug.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Bug not found" });

    res.json({ message: "Bug deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  deleteBug,
};
