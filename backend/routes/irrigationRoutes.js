const express = require("express");
const router = express.Router();

const {
  runIrrigation,
  toggleAuto,
  updateInterval,
} = require("../controllers/irrigationController");

/* RUN IRRIGATION (Manual) */
router.post("/run/:farmId", runIrrigation);

/* TOGGLE AUTO IRRIGATION */
router.put("/:farmId/toggle", toggleAuto);

/* UPDATE INTERVAL */
router.put("/:farmId/interval", updateInterval);

module.exports = router;
