const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const port = process.env.PORT || 7001;
const connectDB = require("./config/db");

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

app.get("/", (req, res) => {
  res.send("Hello User, Welcome to Bug Tracker");
});

app.use("/bugs", require("./routes/bugRoutes"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/projects", require("./routes/projectRoutes"));

app.listen(port, () => console.log(`Server running on port ${port}`));
