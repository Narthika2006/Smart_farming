const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: "Farm" },
  name: String,
  waterRequirement: Number
});

module.exports = mongoose.model("Crop", cropSchema);
