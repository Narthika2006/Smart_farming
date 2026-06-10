import { useState } from "react";
import { getApiErrorMessage } from "../utils/apiError";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, Loader2, User, Mail, Phone, Lock } from "lucide-react";
import { authService } from "../services/authService";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });

  const getStrength = (password) => {
    let score = 0;
    if (password.length > 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength(form.password);
  const strengthColors = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
  const strengthLabel = ["Weak", "Fair", "Good", "Strong"][strength - 1] || "Very weak";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    if (!emailRegex.test(form.email)) return setError("Enter a valid email address.");
    if (!phoneRegex.test(form.phone)) return setError("Phone number must be 10 digits.");
    if (form.password.length < 6) return setError("Password too short.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");

    try {
      setLoading(true);
      await authService.register(form);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-lime-100 px-4">
        <div className="bg-white/80 p-10 rounded-3xl shadow-2xl text-center backdrop-blur-md animate-fade-in">
          <CheckCircle size={72} className="text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-emerald-700">Account Created!</h2>
          <p className="text-gray-600 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-100 flex items-center justify-center px-4">
      <div className="bg-white/70 backdrop-blur-lg border border-emerald-100 shadow-2xl rounded-3xl w-full max-w-xl p-8 transition-all">
        <h1 className="text-3xl font-extrabold text-emerald-700 text-center">Create Account</h1>
        <p className="text-gray-500 text-center mt-2">Start managing your Smart Farm today</p>

        {error && (
          <div className="bg-red-100 text-red-700 mt-6 p-3 rounded-lg text-sm text-center animate-fade-in" aria-live="assertive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          {[
            { icon: User, id:"name",type: "text", name: "name", placeholder: "Full Name" },
            { icon: Mail, type: "email", name: "email", placeholder: "Email address" },
            { icon: Phone, type: "tel", name: "phone", placeholder: "10-digit phone number" },
          ].map((field) => (
            <div key={field.name} className="relative">
              <field.icon className="absolute left-4 top-3 text-gray-400" size={18} />
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                data-testid={`register-${field.name}`}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-sm"
                required
              />
            </div>
          ))}

          <div className="relative">
            <Lock className="absolute left-4 top-3 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              data-testid="register-password"
              className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-gray-500 hover:text-emerald-600 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {form.password && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(strength / 4) * 100}%`,
                      backgroundColor: strengthColors[strength - 1] || "#e5e7eb",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Strength: {strengthLabel}</p>
              </div>
            )}
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              data-testid="register-confirm-password"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-sm"
              required
            />
          </div>

          <button
            disabled={loading}
            data-testid="register-submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md transition disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
          </button>

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <Link to="/" className="text-emerald-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
