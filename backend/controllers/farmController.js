const FarmRepository = require("../infrastructure/repositories/FarmRepository");
const FarmService = require("../application/services/FarmService");

const farmService = new FarmService(new FarmRepository());

/* ---------------- GET FARMS ---------------- */
exports.getFarms = async (req, res) => {
  try {
    const { farmerId } = req.query;
    if (!farmerId) {
      return res.status(400).json({ message: "farmerId is required" });
    }
    const farms = await farmService.listFarms(farmerId);
    res.json(farms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- ADD FARM ---------------- */
exports.addFarm = async (req, res) => {
  try {
    if (!req.body?.farmerId) {
      return res.status(400).json({ message: "farmerId is required" });
    }
    const savedFarm = await farmService.createFarm(req.body);
    res.status(201).json(savedFarm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ---------------- UPDATE FARM ---------------- */
exports.updateFarm = async (req, res) => {
  try {
    const updatedFarm = await farmService.updateFarm(req.params.id, req.body);
    if (!updatedFarm) {
      return res.status(404).json({ message: "Farm not found" });
    }
    res.json(updatedFarm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ---------------- DELETE FARM ---------------- */
exports.deleteFarm = async (req, res) => {
  try {
    await farmService.deleteFarm(req.params.id);
    res.json({ message: "Farm deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
