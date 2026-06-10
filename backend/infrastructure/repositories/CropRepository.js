const CropModel = require("../../models/Crop");

class CropRepository {
  async findByFarmId(farmId) {
    return CropModel.findOne({ farm: farmId });
  }
}

module.exports = CropRepository;
