const bcrypt = require("bcrypt");
const generateToken = require("../../utils/generateToken");

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /* =====================================================
     REGISTER USER
  ===================================================== */
  async register(data) {
    const { name, email, password, phone, location } = data;

    if (!name || !email || !password) {
      const error = new Error("Name, email and password are required");
      error.status = 400;
      throw error;
    }

    if (password.length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.status = 400;
      throw error;
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      const error = new Error("User already exists");
      error.status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
    });

    const token = generateToken(user._id);

    return {
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
      },
    };
  }

  /* =====================================================
     LOGIN USER
  ===================================================== */
  async login(data) {
    const { email, password } = data;

    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.status = 400;
      throw error;
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    const token = generateToken(user._id);

    return {
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
      },
    };
  }

  /* =====================================================
     GET PROFILE
  ===================================================== */
  async getProfile(id) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    return user;
  }

  /* =====================================================
     UPDATE PROFILE
  ===================================================== */
  async updateProfile(id, data) {
    const allowedFields = ["name", "phone", "location"];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    const user = await this.userRepository.updateById(id, updateData);

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    return {
      message: "Profile updated successfully",
      user,
    };
  }
}

module.exports = AuthService;