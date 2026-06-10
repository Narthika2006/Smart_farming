const express = require("express");
const AlertService = require("../application/services/AlertService");

const router = express.Router();
const alertService = new AlertService(
  process.env.EMAIL_USER,
  process.env.EMAIL_PASS
);

router.post("/email", async (req, res) => {
  try {
    const result = await alertService.sendEmail(req.body?.message || "");
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Email failed" });
  }
});

module.exports = router;
