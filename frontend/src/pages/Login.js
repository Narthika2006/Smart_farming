import { useState } from "react";
import { getApiErrorMessage } from "../utils/apiError";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { setAuthSession } from "../utils/authStorage";
import { authService } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !form.password) return setError("All fields are required.");
    if (!emailRegex.test(form.email)) return setError("Enter a valid email address.");
    if (form.password.length < 6 || form.password.length > 20)
      return setError("Password must be between 6 and 20 characters.");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await authService.login(form);
      setAuthSession(
        { userId: res.userId, name: res.name, email: res.email, location: res.location },
        rememberMe
      );
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      setError(getApiErrorMessage(err, "Login failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-100 flex items-center justify-center px-4">
      <div className="bg-white/70 backdrop-blur-lg border border-emerald-100 shadow-2xl rounded-3xl w-full max-w-md p-8 transition-all">
        <h1 className="text-3xl font-extrabold text-emerald-700 text-center">Welcome Back 🌿</h1>
        <p className="text-gray-500 text-center mt-2">Log in to your Smart Farming dashboard</p>

        {error && (
          <div
            className="bg-red-100 text-red-700 mt-6 p-3 rounded-lg text-sm text-center animate-fade-in"
            role="alert" aria-live="assertive"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          <div className="relative">
            <Mail className="absolute left-4 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              data-testid="login-email"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-sm"
              autoComplete="email"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              data-testid="login-password"
              className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-sm"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-gray-500 hover:text-emerald-600 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-between text-sm items-center text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-emerald-700 hover:underline">Forgot password?</Link>
          </div>

          <button
            disabled={loading}
            data-testid="login-submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md transition disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign in"}
          </button>

          <p className="text-center text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-emerald-700 font-semibold hover:underline" id ="createnew">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
