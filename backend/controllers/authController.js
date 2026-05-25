const UserRepository = require("../infrastructure/repositories/UserRepository");
const AuthService = require("../application/services/AuthService");

const authService = new AuthService(new UserRepository());

/* =====================================================
   REGISTER USER
===================================================== */
exports.register = async (req, res) => {
  try {
    const payload = await authService.register(req.body);
    res.status(201).json(payload);

  } catch (err) {
    console.error("Register error:", err);
    res.status(err.status || 500).json({ message: err.message || "Registration failed" });
  }
};


/* =====================================================
   LOGIN USER (NO JWT)
===================================================== */
exports.login = async (req, res) => {
  try {
    const payload = await authService.login(req.body);
    res.json(payload);

  } catch (err) {
    console.error("Login error:", err);
    res.status(err.status || 500).json({ message: err.message || "Login failed" });
  }
};


/* =====================================================
   GET PROFILE
===================================================== */
exports.getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.params.id);
    res.json(user);

  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(err.status || 500).json({ message: err.message || "Failed to fetch profile" });
  }
};


/* =====================================================
   UPDATE PROFILE
===================================================== */
exports.updateProfile = async (req, res) => {
  try {
    const user = await authService.updateProfile(req.params.id, req.body);
    res.json(user);

  } catch (err) {
    console.error("Update error:", err);
    res.status(err.status || 500).json({ message: err.message || "Update failed" });
  }
};
