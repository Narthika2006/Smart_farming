const bcrypt = require("bcryptjs");

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  normalizeEmail(email) {
    if (!email) return email;
    return String(email).trim().toLowerCase();
  }

  async register({ name, email, phone, password }) {
    const normalizedEmail = this.normalizeEmail(email);
    if (!name || !email || !phone || !password) {
      const err = new Error("All fields required");
      err.status = 400;
      throw err;
    }

    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      const err = new Error("Email already registered");
      err.status = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      location: "",
    });

    return {
      message: "Account created successfully",
      userId: user._id,
      name: user.name,
      email: user.email,
      location: user.location || "",
    };
  }

  async login({ email, password }) {
    const normalizedEmail = this.normalizeEmail(email);
    if (!email || !password) {
      const err = new Error("All fields required");
      err.status = 400;
      throw err;
    }

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      const err = new Error("User not found");
      err.status = 400;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error("Invalid password");
      err.status = 400;
      throw err;
    }

    return {
      message: "Login Successful",
      userId: user._id,
      name: user.name,
      email: user.email,
      location: user.location || "",
    };
  }

  async getProfile(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    const { password, ...safe } = user.toObject();
    return safe;
  }

  async updateProfile(id, { name, location, phone }) {
    const updated = await this.userRepository.updateById(
      id,
      { name, location, phone }
    );
    if (!updated) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    const { password, ...safe } = updated.toObject();
    return safe;
  }
}

module.exports = AuthService;
