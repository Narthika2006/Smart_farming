// Usage: node scripts/findUserByEmail.js <email>
// Prints a matching user (if found) using case-insensitive, trimmed email match.

const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Missing email. Usage: node scripts/findUserByEmail.js <email>");
    process.exit(1);
  }

  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartfarm";
  await mongoose.connect(uri);

  const trimmed = String(email).trim();
  const user = await User.findOne({
    email: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" },
  });

  if (!user) {
    console.log("No user found for email:", trimmed);
  } else {
    console.log("Found user:");
    console.log({ id: user._id.toString(), email: user.email, name: user.name, phone: user.phone });
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
