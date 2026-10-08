const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB error:", err.message));

app.get("/api", (req, res) => {
  res.json({ message: "Backend Running Successfully in CICD" });
});

app.listen(5000, () => console.log("Server running on port 5000"));