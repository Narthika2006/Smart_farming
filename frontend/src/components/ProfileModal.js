import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clearAuthSession, getAuthValue, updateAuthSession } from "../utils/authStorage";
import { getApiErrorMessage } from "../utils/apiError";
import { authService } from "../services/authService";
import { farmService } from "../services/farmService";

// ── Design tokens ─────────────────────────────────────────────────────────────
const card = {
  background: "#ffffff",
  border: "1px solid rgba(226,232,226,0.7)",
  borderRadius: 16,
  boxShadow: "0 6px 20px rgba(16,24,16,0.06)",
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 13,
  borderRadius: 10,
  border: "1px solid rgba(167,210,167,0.5)",
  background: "rgba(255,255,255,0.85)",
  color: "#1a3d1a",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function Avatar({ initials, size = 64 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #bbf7d0, #4ade80)",
      boxShadow: "0 3px 12px rgba(74,222,128,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: "#14532d",
    }}>
      {initials}
    </div>
  );
}

function FocusInput({ label, value, onChange, type = "text", placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 600, color: "#4a7c4a",
        textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5,
      }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          borderColor: focused ? "#4ade80" : "rgba(167,210,167,0.5)",
          boxShadow: focused ? "0 0 0 3px rgba(74,222,128,0.15)" : "none",
        }}
      />
    </div>
  );
}

function StatTile({ label, value, icon, color = "#16a34a" }) {
  return (
    <div style={{
      ...card, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#7a9e7a",
          textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color }}>
        {value}
      </span>
    </div>
  );
}

function MoistureBar({ pct }) {
  const color = pct < 30 ? "#ef4444" : pct < 45 ? "#f59e0b" : pct < 70 ? "#22c55e" : "#3b82f6";
  const label = pct < 30 ? "Critical" : pct < 45 ? "Dry" : pct < 70 ? "Healthy" : "Wet";
  return (
    <div style={{ ...card, padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#4a7c4a" }}>Avg. soil health</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: color,
            boxShadow: `0 0 5px ${color}`, display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}% — {label}</span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: "rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: color,
          borderRadius: 4, transition: "width 0.7s ease",
        }} />
      </div>
    </div>
  );
}

// ── ProfileModal ───────────────────────────────────────────────────────────────
function ProfileModal({ isOpen, onClose }) {
  const [profile, setProfile] = useState({});
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", location: "" });

  const fetchProfile = async () => {
    try {
      const userId = getAuthValue("userId");
      const data = await authService.getProfile(userId);
      setProfile(data);
      setForm({ name: data.name || "", phone: data.phone || "", location: data.location || "" });
    } catch (err) { console.error(err); }
  };

  const fetchFarms = async () => {
    try {
      const data = await farmService.list();
      setFarms(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([fetchProfile(), fetchFarms()]).finally(() => setLoading(false));

    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const totalFarms = farms.length;
  const avgMoisture = useMemo(() =>
    farms.length ? Math.round(farms.reduce((s, f) => s + (f.soilMoisture || 0), 0) / farms.length) : 0,
    [farms]);
  const alerts = useMemo(() =>
    farms.filter((f) => f.soilMoisture < 40 || f.soilMoisture > 70).length, [farms]);

  const initials = useMemo(() => {
    const parts = (profile?.name || "U").trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (profile?.name || "U").charAt(0).toUpperCase();
  }, [profile?.name]);

  const handleLogout = () => { clearAuthSession(); window.location.href = "/"; };

  const handleSave = async () => {
    if (!form.name.trim()) { setSaveError("Name is required."); return; }
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) {
      setSaveError("Phone number must be 10 digits."); return;
    }
    try {
      setSaving(true); setSaveError("");
      const userId = getAuthValue("userId");
      const updated = await authService.updateProfile(userId, {
        name: form.name.trim(), phone: form.phone.trim(), location: form.location.trim(),
      });
      setProfile(updated);
      updateAuthSession({ name: updated.name, location: updated.location, email: updated.email });
      setIsEditing(false);
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "Unable to update profile."));
    } finally { setSaving(false); }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(10,30,10,0.45)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onMouseDown={onClose}
          >
            <motion.div
              initial={{ scale: 0.96, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 24, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-md overflow-hidden bg-white rounded-2xl shadow border border-green-100"
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-title"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 id="profile-title" style={{ fontSize: 20, fontWeight: 700, color: "#1a3d1a",
                      margin: 0 }}>
                      My Profile
                    </h2>
                    <p style={{ fontSize: 12, color: "#7a9e7a", margin: "3px 0 0" }}>
                      Account details and farm overview
                    </p>
                  </div>
                  <button onClick={onClose} aria-label="Close"
                    style={{
                      width: 32, height: 32, borderRadius: 10, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      background: "rgba(0,0,0,0.05)", border: "none",
                      cursor: "pointer", color: "#7a9e7a", fontSize: 15,
                    }}>✕</button>
                </div>

                {loading ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "#7a9e7a", fontSize: 14 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
                    Loading profile…
                  </div>
                ) : (
                  <>
                    {/* Identity card */}
                    <div style={{
                      ...card,
                      padding: "16px 18px",
                      display: "flex", alignItems: "center", gap: 14,
                    }}>
                      <Avatar initials={initials} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "#1a3d1a", margin: 0,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {profile.name || "Farmer"}
                        </p>
                        <p style={{ fontSize: 12, color: "#7a9e7a", margin: "3px 0 5px",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {profile.email || "—"}
                        </p>
                        {profile.location && (
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20,
                            background: "rgba(220,252,231,0.7)", color: "#15803d",
                            border: "1px solid rgba(134,239,172,0.4)",
                          }}>
                            📍 {profile.location}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => { setIsEditing((p) => !p); setSaveError(""); }}
                        style={{
                          fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8,
                          background: isEditing ? "rgba(0,0,0,0.06)" : "rgba(22,163,74,0.1)",
                          color: isEditing ? "#6b7280" : "#16a34a",
                          border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                        }}
                      >
                        {isEditing ? "Cancel" : "Edit"}
                      </button>
                    </div>

                    {/* Edit form */}
                    <AnimatePresence>
                      {isEditing && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{
                            display: "flex", flexDirection: "column", gap: 12,
                            padding: 16, borderRadius: 16,
                            background: "rgba(240,253,244,0.55)",
                            border: "1px solid rgba(134,239,172,0.3)",
                          }}>
                            {saveError && (
                              <div style={{
                                padding: "9px 12px", borderRadius: 10, fontSize: 12,
                                background: "rgba(254,226,226,0.85)", color: "#b91c1c",
                                border: "1px solid rgba(252,165,165,0.5)",
                                display: "flex", alignItems: "center", gap: 6,
                              }} role="alert">
                                <span>⚠</span> {saveError}
                              </div>
                            )}
                            <FocusInput label="Full name" value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            <FocusInput label="Phone" type="tel" value={form.phone}
                              placeholder="10-digit mobile number"
                              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            <FocusInput label="Location" value={form.location}
                              placeholder="City or district"
                              onChange={(e) => setForm({ ...form, location: e.target.value })} />
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              style={{
                                width: "100%", padding: "10px", borderRadius: 12,
                                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                                background: saving ? "#86efac" : "linear-gradient(135deg,#16a34a,#15803d)",
                                color: "#fff", border: "none",
                                cursor: saving ? "not-allowed" : "pointer",
                                boxShadow: saving ? "none" : "0 4px 14px rgba(22,163,74,0.35)",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                              }}
                            >
                              {saving ? (
                                <>
                                  <svg width="13" height="13" viewBox="0 0 13 13" style={{ animation: "spin 0.7s linear infinite" }}>
                                    <circle cx="6.5" cy="6.5" r="5" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none"/>
                                    <path d="M6.5 1.5A5 5 0 0 1 11.5 6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/>
                                  </svg>
                                  Saving…
                                </>
                              ) : "Save changes"}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Stats */}
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#7a9e7a",
                        textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>
                        Farm overview
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <StatTile label="Total farms" value={totalFarms} icon="🌾" color="#16a34a" />
                        <StatTile label="Avg. moisture" value={`${avgMoisture}%`} icon="💧" color="#2563eb" />
                        <StatTile label="Active alerts" value={alerts}
                          icon={alerts > 0 ? "⚠️" : "✅"}
                          color={alerts > 0 ? "#d97706" : "#16a34a"} />
                        <StatTile label="AI assistant" value="Active" icon="🤖" color="#7c3aed" />
                      </div>
                    </div>

                    {/* Soil health bar */}
                    <MoistureBar pct={avgMoisture} />

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%", padding: "10px", borderRadius: 14,
                        fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                        background: "rgba(239,68,68,0.07)", color: "#dc2626",
                        border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.13)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.07)"}
                    >
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export default ProfileModal;
