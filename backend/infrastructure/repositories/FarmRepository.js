const FarmModel = require("../../models/Farm");

class FarmRepository {
  async findAll() {
    return FarmModel.find().sort({ createdAt: -1 });
  }

  async findByFarmerId(farmerId) {
    return FarmModel.find({ farmerId }).sort({ createdAt: -1 });
  }

  async findById(id) {
    return FarmModel.findById(id);
  }

  async create(data) {
    return FarmModel.create(data);
  }

  async updateById(id, data) {
    return FarmModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id) {
    return FarmModel.findByIdAndDelete(id);
  }

  async findAutoEnabled() {
    return FarmModel.find({ "autoIrrigation.enabled": true });
  }
}

module.exports = FarmRepository;
