const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,

  farmName: String,
  location: String,
  farmSize: String,
  cropType: String,
});

module.exports = mongoose.model("User", UserSchema);