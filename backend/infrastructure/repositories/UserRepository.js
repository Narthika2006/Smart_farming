const UserModel = require("../../models/User");

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

class UserRepository {
  async findByEmail(email) {
    if (!email) return null;
    const trimmed = String(email).trim();
    return UserModel.findOne({
      email: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" },
    });
  }

  async findById(id) {
    return UserModel.findById(id);
  }

  async create(data) {
    return UserModel.create(data);
  }

  async updateById(id, data) {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }
}

module.exports = UserRepository;
