const EnvironmentModel = require("../../models/EnvironmentData");

class EnvironmentRepository {
  async create(data) {
    return EnvironmentModel.create(data);
  }
}

module.exports = EnvironmentRepository;
