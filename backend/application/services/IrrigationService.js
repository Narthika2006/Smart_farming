class IrrigationService {
  constructor(farmRepository, cropRepository, environmentRepository) {
    this.farmRepository = farmRepository;
    this.cropRepository = cropRepository;
    this.environmentRepository = environmentRepository;
  }

  async autoDecision({ farmId, soilMoisture, temperature }) {
    let status = "OFF";
    let message = "Moisture sufficient";

    if (soilMoisture < 40) {
      status = "ON";
      message = "Low moisture detected. Irrigation started.";
    }

    if (soilMoisture > 60) {
      status = "OFF";
      message = "High moisture detected. Irrigation stopped.";
    }

    const crop = await this.cropRepository.findByFarmId(farmId);
    if (crop && soilMoisture < crop.waterRequirement) {
      status = "ON";
      message = `Crop requires water (Need ${crop.waterRequirement}%)`;
    }

    await this.environmentRepository.create({
      farm: farmId,
      moisture: soilMoisture,
      temperature,
    });

    await this.farmRepository.updateById(farmId, {
      soilMoisture,
    });

    return { irrigationStatus: status, message, moisture: soilMoisture };
  }

  async runManual(farmId) {
    const farm = await this.farmRepository.findById(farmId);
    if (!farm) {
      const err = new Error("Farm not found");
      err.status = 404;
      throw err;
    }

    farm.waterUsed += 20;
    farm.soilMoisture = Math.min((farm.soilMoisture || 0) + 10, 100);
    await farm.save();

    return { message: "Irrigation completed", waterUsed: farm.waterUsed };
  }

  async toggleAuto(farmId) {
    const farm = await this.farmRepository.findById(farmId);
    if (!farm) {
      const err = new Error("Farm not found");
      err.status = 404;
      throw err;
    }

    farm.autoIrrigation.enabled = !farm.autoIrrigation.enabled;
    await farm.save();
    return { enabled: farm.autoIrrigation.enabled };
  }

  async updateInterval(farmId, interval) {
    const farm = await this.farmRepository.findById(farmId);
    if (!farm) {
      const err = new Error("Farm not found");
      err.status = 404;
      throw err;
    }

    farm.autoIrrigation.interval = Number(interval);
    await farm.save();
    return { interval: farm.autoIrrigation.interval };
  }
}

module.exports = IrrigationService;
