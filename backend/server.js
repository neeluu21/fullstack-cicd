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

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, trim: true },
  course: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Student = mongoose.model("Student", studentSchema);

app.get("/api", (req, res) => {
  res.json({ message: "Backend Running Successfully in CICD" });
});

app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({ status: "ok", database: connected ? "Connected" : "Disconnected" });
});

app.get("/api/students", async (req, res) => {
  try {
    res.json(await Student.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.json({ saved: true, data: student });
  } catch (err) {
    const msg = err.code === 11000 ? "Roll number already exists" : err.message;
    res.status(400).json({ saved: false, error: msg });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ saved: true, data: student });
  } catch (err) {
    const msg = err.code === 11000 ? "Roll number already exists" : err.message;
    res.status(400).json({ saved: false, error: msg });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ deleted: false, error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
