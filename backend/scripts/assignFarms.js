// Usage: node scripts/assignFarms.js <farmerId>
// Assigns all farms with missing farmerId to the provided farmerId.

const mongoose = require("mongoose");
require("dotenv").config();

const Farm = require("../models/Farm");

async function main() {
  const farmerId = process.argv[2];
  if (!farmerId) {
    console.error("Missing farmerId. Usage: node scripts/assignFarms.js <farmerId>");
    process.exit(1);
  }

  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartfarm";
  await mongoose.connect(uri);

  const result = await Farm.updateMany(
    { $or: [{ farmerId: { $exists: false } }, { farmerId: null }, { farmerId: "" }] },
    { $set: { farmerId } }
  );

  console.log(`Updated ${result.modifiedCount} farms with farmerId=${farmerId}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
