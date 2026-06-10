import { useEffect, useRef, useState } from "react";
import { getAuthValue } from "../utils/authStorage";
import { getApiErrorMessage } from "../utils/apiError";
import { farmService } from "../services/farmService";

const SOIL_DATA = {
  Clay:   { moisture: 65, emoji: "🟤", desc: "Dense, water-retentive" },
  Sandy:  { moisture: 30, emoji: "🟡", desc: "Loose, drains quickly" },
  Loamy:  { moisture: 50, emoji: "🌿", desc: "Balanced, nutrient-rich" },
  Silty:  { moisture: 55, emoji: "💧", desc: "Smooth, holds moisture" },
  Peaty:  { moisture: 70, emoji: "🌑", desc: "Dark, high organic matter" },
  Chalky: { moisture: 35, emoji: "⚪", desc: "Alkaline, well-draining" },
};

function MoistureBar({ value, recommended }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  const color =
    pct < 30 ? "#ef4444" : pct < 45 ? "#f59e0b" : pct < 70 ? "#22c55e" : "#3b82f6";
  return (
    <div className="mt-2">
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(0,0,0,0.07)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
        {recommended && (
          <div
            className="absolute top-0 bottom-0 w-0.5 rounded-full"
            style={{ left: `${recommended}%`, background: "rgba(0,0,0,0.25)" }}
          />
        )}
      </div>
      {recommended && (
        <div className="flex justify-between mt-0.5">
          <span style={{ fontSize: 10, color: "#9ca3af" }}>0%</span>
          <span style={{ fontSize: 10, color: "#6b7280" }}>
            Recommended: {recommended}%
          </span>
          <span style={{ fontSize: 10, color: "#9ca3af" }}>100%</span>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label
        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: "#4a7c4a", letterSpacing: "0.07em" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs flex items-center gap-1" style={{ color: "#dc2626" }}>
          <span>⚠</span> {error}
        </p>
      )}
      {!error && hint && (
        <p className="mt-1 text-xs" style={{ color: "#9ca3af" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 14,
  borderRadius: 10,
  border: "1px solid rgba(167,210,167,0.5)",
  background: "rgba(255,255,255,0.8)",
  color: "#1a3d1a",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  fontFamily: "inherit",
};

function StyledInput(props) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        borderColor: props["aria-invalid"]
          ? "#fca5a5"
          : focused
          ? "#4ade80"
          : "rgba(167,210,167,0.5)",
        boxShadow: focused ? "0 0 0 3px rgba(74,222,128,0.15)" : "none",
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

function StyledSelect({ children, error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...inputStyle,
        appearance: "none",
        backgroundImage:
          `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234a7c4a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 32,
        borderColor: error ? "#fca5a5" : focused ? "#4ade80" : "rgba(167,210,167,0.5)",
        boxShadow: focused ? "0 0 0 3px rgba(74,222,128,0.15)" : "none",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
}

function AddFarmModal({ isOpen, onClose, onFarmAdded, onFarmUpdated, mode = "add", initialFarm = null }) {
  const [form, setForm] = useState({
    location: "", cropType: "", soilType: "", soilMoisture: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const locationRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => locationRef.current?.focus(), 80);
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initialFarm) {
      setForm({
        location: initialFarm.location || "",
        cropType: initialFarm.cropType || "",
        soilType: initialFarm.soilType || "",
        soilMoisture:
          initialFarm.soilMoisture === undefined || initialFarm.soilMoisture === null
            ? ""
            : String(initialFarm.soilMoisture),
      });
      setErrors({});
      setMessage("");
      setMessageType("");
      return;
    }
    setForm({ location: "", cropType: "", soilType: "", soilMoisture: "" });
    setErrors({});
    setMessage("");
    setMessageType("");
  }, [isOpen, mode, initialFarm]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSoilChange = (soil) => {
    setForm((prev) => {
      const next = { ...prev, soilType: soil };
      if (!prev.soilMoisture && SOIL_DATA[soil]) {
        next.soilMoisture = String(SOIL_DATA[soil].moisture);
      }
      return next;
    });
    setErrors((p) => ({ ...p, soilType: "" }));
  };

  const validateForm = () => {
    const e = {};
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.cropType.trim()) e.cropType = "Crop type is required";
    if (!form.soilType) e.soilType = "Please select a soil type";
    const m = Number(form.soilMoisture);
    if (form.soilMoisture === "") e.soilMoisture = "Soil moisture is required";
    else if (isNaN(m)) e.soilMoisture = "Must be a number";
    else if (m < 0) e.soilMoisture = "Cannot be below 0%";
    else if (m > 100) e.soilMoisture = "Cannot exceed 100%";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;
    try {
      setIsSubmitting(true);
      if (mode === "edit" && initialFarm?._id) {
        await farmService.update(initialFarm._id, {
          ...form,
          soilMoisture: Number(form.soilMoisture),
        });
        setMessage("Farm updated successfully.");
        setMessageType("success");
        onFarmUpdated?.();
        setTimeout(() => { setMessage(""); onClose(); }, 1200);
      } else {
        const farmerId = getAuthValue("userId");
        await farmService.create({ farmerId, ...form, soilMoisture: Number(form.soilMoisture) });
        setMessage("Farm added successfully.");
        setMessageType("success");
        onFarmAdded();
        setForm({ location: "", cropType: "", soilType: "", soilMoisture: "" });
        setTimeout(() => { setMessage(""); onClose(); }, 1800);
      }
    } catch (err) {
      setMessage(
        getApiErrorMessage(
          err,
          mode === "edit" ? "Error updating farm. Please try again." : "Error adding farm. Please try again."
        )
      );
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const recommended = form.soilType ? SOIL_DATA[form.soilType]?.moisture : null;
  const selectedSoil = form.soilType ? SOIL_DATA[form.soilType] : null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4 z-50"
      style={{ background: "rgba(10,30,10,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md relative bg-white rounded-2xl shadow border border-green-100"
        style={{
          overflow: "hidden",
        }}
        data-testid="add-farm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-farm-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 bg-green-50 text-green-700 border border-green-100"
              >
                🌾
              </div>
              <div>
                <h2
                  id="add-farm-title"
                  className="text-xl font-bold"
                  style={{ color: "#1a3d1a" }}
                >
                  {mode === "edit" ? "Edit Farm" : "Add Smart Farm"}
                </h2>
                <p className="text-xs" style={{ color: "#7a9e7a" }}>
                  {mode === "edit" ? "Update farm details and baseline" : "Set up a new farm location and baseline"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(0,0,0,0.05)",
                color: "#7a9e7a",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Toast message */}
          {message && (
            <div
              className="mb-4 px-4 py-3 rounded-2xl text-sm flex items-center gap-2"
              role={messageType === "success" ? "status" : "alert"}
              style={{
                background: messageType === "success" ? "rgba(220,252,231,0.9)" : "rgba(254,226,226,0.9)",
                color: messageType === "success" ? "#15803d" : "#b91c1c",
                border: `1px solid ${messageType === "success" ? "rgba(134,239,172,0.5)" : "rgba(252,165,165,0.5)"}`,
              }}
            >
              {messageType === "success" ? "✓" : "⚠"} {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Location */}
              <Field label="Farm location" hint="e.g. Pollachi, Tamil Nadu" error={errors.location}>
                <StyledInput
                  name="location"
                  value={form.location}
                  placeholder="Enter farm location"
                  onChange={handleChange}
                  ref={locationRef}
                  maxLength={60}
                  data-testid="farm-location"
                  aria-invalid={Boolean(errors.location)}
                />
              </Field>

              {/* Crop type */}
              <Field label="Crop type" error={errors.cropType}>
                <StyledInput
                  name="cropType"
                  value={form.cropType}
                  placeholder="e.g. Rice, Wheat, Cotton"
                  onChange={handleChange}
                  maxLength={40}
                  data-testid="farm-crop-type"
                  aria-invalid={Boolean(errors.cropType)}
                />
              </Field>

              {/* Soil type */}
              <Field label="Soil type" error={errors.soilType}>
                <StyledSelect
                  value={form.soilType}
                  onChange={(e) => handleSoilChange(e.target.value)}
                  error={errors.soilType}
                  data-testid="farm-soil-type"
                  aria-invalid={Boolean(errors.soilType)}
                >
                  <option value="">Select a soil type…</option>
                  {Object.entries(SOIL_DATA).map(([soil, data]) => (
                    <option key={soil} value={soil}>
                      {data.emoji} {soil} — {data.desc}
                    </option>
                  ))}
                </StyledSelect>

                {/* Soil suggestion chip */}
                {selectedSoil && (
                  <div
                    className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{
                      background: "rgba(220,252,231,0.6)",
                      border: "1px solid rgba(134,239,172,0.4)",
                    }}
                  >
                    <span className="text-xs" style={{ color: "#166534" }}>
                      Suggested moisture for <strong>{form.soilType}</strong>:{" "}
                      <strong>{recommended}%</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, soilMoisture: String(recommended) }))}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: "#16a34a",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </Field>

              {/* Soil moisture */}
              <Field label="Soil moisture (%)" hint="Enter a value between 0 and 100" error={errors.soilMoisture}>
                <StyledInput
                  type="number"
                  name="soilMoisture"
                  value={form.soilMoisture}
                  placeholder="0 – 100"
                  min="0"
                  max="100"
                  onChange={handleChange}
                  data-testid="farm-soil-moisture"
                  aria-invalid={Boolean(errors.soilMoisture)}
                />
                <MoistureBar value={form.soilMoisture} recommended={recommended} />
              </Field>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  color: "#4a7c4a",
                  border: "1px solid rgba(167,210,167,0.4)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="farm-submit"
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: isSubmitting
                    ? "#86efac"
                    : "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "#fff",
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: isSubmitting ? "none" : "0 4px 14px rgba(22,163,74,0.35)",
                  fontFamily: "inherit",
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: "spin 0.7s linear infinite" }}>
                      <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
                      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {mode === "edit" ? "Saving changes…" : "Adding farm…"}
                  </span>
                ) : (
                  mode === "edit" ? "Save Changes" : "Add Farm"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default AddFarmModal;
