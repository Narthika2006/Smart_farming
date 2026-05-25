const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema({
  farmerId: String,
  location: String,
  cropType: String,
  soilType: String,
  soilMoisture: Number,

  autoIrrigation: {
    enabled: { type: Boolean, default: false },
    interval: { type: Number, default: 10 },
    lastRun: { type: Date },
  },

  waterUsed: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Farm", farmSchema);
