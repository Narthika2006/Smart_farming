const express = require("express");
const router = express.Router();

const {
  getFarms,
  addFarm,
  deleteFarm,
  updateFarm,
} = require("../controllers/farmController");

/* GET all farms */
router.get("/", getFarms);

/* ADD farm */
router.post("/", addFarm);

/* UPDATE farm */
router.put("/:id", updateFarm);

/* DELETE farm */
router.delete("/:id", deleteFarm);

module.exports = router;
