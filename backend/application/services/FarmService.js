class FarmService {
  constructor(farmRepository) {
    this.farmRepository = farmRepository;
  }

  async listFarms(farmerId) {
    if (!farmerId) return [];
    return this.farmRepository.findByFarmerId(farmerId);
  }

  async createFarm(data) {
    return this.farmRepository.create(data);
  }

  async updateFarm(id, data) {
    return this.farmRepository.updateById(id, data);
  }

  async deleteFarm(id) {
    return this.farmRepository.deleteById(id);
  }
}

module.exports = FarmService;
