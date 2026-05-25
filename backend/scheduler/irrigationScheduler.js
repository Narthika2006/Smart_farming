const cron = require("node-cron");
const FarmRepository = require("../infrastructure/repositories/FarmRepository");
const AutoIrrigationService = require("../application/services/AutoIrrigationService");

const startIrrigationScheduler = () => {
  console.log("Irrigation Scheduler Started");
  const autoService = new AutoIrrigationService(new FarmRepository());

  cron.schedule("*/10 * * * *", async () => {
    console.log("Checking farms for auto irrigation...");
    try {
      await autoService.run();
    } catch (err) {
      console.error("Scheduler Error:", err);
    }
  });
};

module.exports = startIrrigationScheduler;
