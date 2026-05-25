const FarmRepository = require("../infrastructure/repositories/FarmRepository");
const CropRepository = require("../infrastructure/repositories/CropRepository");
const EnvironmentRepository = require("../infrastructure/repositories/EnvironmentRepository");
const IrrigationService = require("../application/services/IrrigationService");

const irrigationService = new IrrigationService(
  new FarmRepository(),
  new CropRepository(),
  new EnvironmentRepository()
);

/* ==========================================
   AUTO IRRIGATION DECISION
========================================== */
exports.autoIrrigation = async (req, res) => {
  try {
    const result = await irrigationService.autoDecision(req.body);
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Irrigation error" });
  }
};

/* ==========================================
   RUN IRRIGATION (Manual)
========================================== */
exports.runIrrigation = async (req, res) => {
  try {
    const result = await irrigationService.runManual(req.params.farmId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Irrigation failed" });
  }
};

/* ==========================================
   TOGGLE AUTO IRRIGATION
========================================== */
exports.toggleAuto = async (req, res) => {
  try {
    const result = await irrigationService.toggleAuto(req.params.farmId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Toggle failed" });
  }
};

/* ==========================================
   UPDATE INTERVAL
========================================== */
exports.updateInterval = async (req, res) => {
  try {
    const result = await irrigationService.updateInterval(
      req.params.farmId,
      req.body.interval
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Interval update failed" });
  }
};
