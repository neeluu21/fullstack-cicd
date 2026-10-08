const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB error:", err.message));

const configSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});
const Config = mongoose.model("Config", configSchema);

app.get("/api", (req, res) => {
  res.json({ message: "Backend Running Successfully in CICD" });
});

app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({ status: "ok", database: connected ? "Connected" : "Disconnected" });
});

// Get all saved configs
app.get("/api/config", async (req, res) => {
  try {
    const configs = await Config.find().sort({ createdAt: -1 });
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save a new config
app.post("/api/config", async (req, res) => {
  try {
    const { name, value, enabled } = req.body;
    if (!name || !value) {
      return res.status(400).json({ saved: false, error: "Name and value are required" });
    }
    const config = await Config.create({ name, value, enabled });
    res.json({ saved: true, data: config });
  } catch (err) {
    res.status(500).json({ saved: false, error: err.message });
  }
});

// Delete a config
app.delete("/api/config/:id", async (req, res) => {
  try {
    await Config.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ deleted: false, error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));