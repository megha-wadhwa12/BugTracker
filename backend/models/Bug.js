const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    priority: { type: String, default: "medium" },
    status: { type: String, default: "open" },
    assignedTo: { type: String, default: "" },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    activity: [
      {
        message: String,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Bug", bugSchema);
