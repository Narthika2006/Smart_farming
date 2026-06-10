const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const farmRoutes = require("./routes/farmRoutes");
const irrigationRoutes = require("./routes/irrigationRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const aiRoutes = require("./routes/aiRoutes");
const alertRoutes = require("./routes/alertRoutes");
const startIrrigationScheduler = require("./scheduler/irrigationScheduler");

const app = express();

// CORS setup
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Database connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartfarm")
  .then(() => {
    console.log("MongoDB Connected");
    startIrrigationScheduler();
  })
  .catch((err) => {
    console.error("MongoDB Error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/irrigation", irrigationRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/alerts", alertRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("SmartFarm API Running...");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});