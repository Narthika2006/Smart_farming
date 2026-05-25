const soilRules = {
  Clay: { min: 60, max: 80 },
  Sandy: { min: 30, max: 50 },
  Loamy: { min: 50, max: 70 },
  Silty: { min: 55, max: 75 },
};

class AutoIrrigationService {
  constructor(farmRepository) {
    this.farmRepository = farmRepository;
  }

  async run() {
    const farms = await this.farmRepository.findAutoEnabled();

    for (const farm of farms) {
      const soil = soilRules[farm.soilType];
      if (!soil) continue;

      const now = new Date();
      const lastRun = farm.autoIrrigation.lastRun || new Date(0);
      const intervalMs = farm.autoIrrigation.interval * 60 * 1000;

      if (now - lastRun < intervalMs) continue;

      if ((farm.soilMoisture || 0) < soil.min) {
        const added = soil.min - (farm.soilMoisture || 0);
        farm.soilMoisture += added;
        farm.waterUsed += added * 2;
        farm.autoIrrigation.lastRun = now;
        await farm.save();
        console.log(`Auto irrigated farm ${farm._id}`);
      }
    }
  }
}

module.exports = AutoIrrigationService;
