const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());

mongoose
  .connect(process.env.MONGO_URL || "mongodb://localhost:27017/studentdb")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/api", (req, res) => {
  res.json({
    message: "Backend Running Successfully",
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
