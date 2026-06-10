// Usage: node scripts/normalizeUserEmails.js
// Trims and lowercases all user emails in the database.

const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

async function main() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartfarm";
  await mongoose.connect(uri);

  const users = await User.find({}, { email: 1 });
  let updated = 0;

  for (const u of users) {
    const email = u.email;
    const normalized = email ? String(email).trim().toLowerCase() : email;
    if (email !== normalized) {
      await User.updateOne({ _id: u._id }, { $set: { email: normalized } });
      updated += 1;
    }
  }

  console.log(`Normalized emails for ${updated} users.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
