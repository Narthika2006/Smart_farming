const mongoose = require("mongoose");

const envSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: "Farm" },
  moisture: Number,
  temperature: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EnvironmentData", envSchema);
