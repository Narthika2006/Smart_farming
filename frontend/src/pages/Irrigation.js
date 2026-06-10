import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getApiErrorMessage } from "../utils/apiError";
import { CardSkeleton, PanelSkeleton } from "../components/LoadingSkeleton";
import { farmService } from "../services/farmService";
import { irrigationService } from "../services/irrigationService";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

const DEFAULT_INTERVAL_MINUTES = 10;
const MIN_INTERVAL = 1;
const MAX_INTERVAL = 1440;

// ── Design tokens ─────────────────────────────────────────────────────────────
const card = {
  background: "#ffffff",
  border: "1px solid rgba(226,232,226,0.7)",
  borderRadius: 16,
  boxShadow: "0 6px 20px rgba(16,24,16,0.06)",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function moistureInfo(v) {
  if (v < 30) return { label: "Critical", color: "#dc2626", bg: "#fef2f2", dot: "#ef4444", bar: "#ef4444" };
  if (v < 45) return { label: "Dry",      color: "#d97706", bg: "#fffbeb", dot: "#f59e0b", bar: "#f59e0b" };
  if (v < 70) return { label: "Optimal",  color: "#16a34a", bg: "#f0fdf4", dot: "#22c55e", bar: "#22c55e" };
  return           { label: "Wet",       color: "#2563eb", bg: "#eff6ff", dot: "#3b82f6", bar: "#3b82f6" };
}

function formatInterval(mins) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Toast({ notice, onDismiss }) {
  if (!notice?.message) return null;
  const ok = notice.type === "success";
  return (
    <div
      className="mb-5 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm"
      role={ok ? "status" : "alert"}
      style={{
        background: ok ? "rgba(220,252,231,0.85)" : "rgba(254,226,226,0.85)",
        border: `1px solid ${ok ? "rgba(134,239,172,0.5)" : "rgba(252,165,165,0.5)"}`,
        color: ok ? "#15803d" : "#b91c1c",
      }}
    >
      <span className="flex items-center gap-2">{ok ? "✓" : "⚠"} {notice.message}</span>
      <button onClick={onDismiss}
        style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.55, fontSize: 16 }}>✕</button>
    </div>
  );
}

function ToggleSwitch({ enabled, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-label={enabled ? "Turn off auto irrigation" : "Turn on auto irrigation"}
      style={{
        position: "relative", width: 44, height: 24, borderRadius: 12,
        background: enabled ? "linear-gradient(135deg,#16a34a,#15803d)" : "rgba(0,0,0,0.12)",
        border: "none", cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.25s", flexShrink: 0,
        boxShadow: enabled ? "0 2px 8px rgba(22,163,74,0.4)" : "none",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: enabled ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left 0.22s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function MoistureBar({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  const info = moistureInfo(pct);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#7a9e7a", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Soil moisture
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: info.dot,
            boxShadow: `0 0 5px ${info.dot}`, display: "inline-block" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: info.color }}>{pct}%</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
            background: info.bg, color: info.color,
          }}>{info.label}</span>
        </div>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: info.bar,
          borderRadius: 3, transition: "width 0.6s" }} />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, color }) {
  return (
    <div style={{
      flex: 1, padding: "10px 12px", borderRadius: 12,
      background: "rgba(240,253,244,0.6)", border: "1px solid rgba(134,239,172,0.25)",
    }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: "#7a9e7a", textTransform: "uppercase",
        letterSpacing: "0.07em", margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 700, color: color || "#1a3d1a", margin: 0 }}>
        {value}
        {sub && <span style={{ fontSize: 12, fontWeight: 400, color: "#7a9e7a", marginLeft: 3 }}>{sub}</span>}
      </p>
    </div>
  );
}

// Custom recharts tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      ...card, padding: "10px 14px", fontSize: 13,
      boxShadow: "0 4px 20px rgba(34,85,34,0.12)",
    }}>
      <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#1a3d1a" }}>{label}</p>
      <p style={{ margin: 0, color: "#2563eb" }}>💧 {payload[0].value} L</p>
    </div>
  );
}

// ── IrrigationCard ────────────────────────────────────────────────────────────
function IrrigationCard({ farm, isSaving, intervalValue, onIntervalChange, onToggle, onSaveInterval, onRunNow }) {
  const autoOn = farm.autoIrrigation?.enabled;
  const lastRun = farm.autoIrrigation?.lastRun
    ? new Date(farm.autoIrrigation.lastRun).toLocaleString()
    : "Never";

  return (
    <div
      style={{ ...card, display: "flex", flexDirection: "column", gap: 0, transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(34,85,34,0.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 20px rgba(34,85,34,0.06)"; }}
    >
      {/* Top accent */}
      <div style={{
        height: 3, borderRadius: "20px 20px 0 0",
        background: autoOn
          ? "linear-gradient(90deg,#16a34a,#4ade80)"
          : "linear-gradient(90deg,#9ca3af,transparent)",
        transition: "background 0.4s",
      }} />

      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1a3d1a", margin: 0,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {farm.cropType || "Unnamed farm"}
            </h2>
            <p style={{ fontSize: 12, color: "#7a9e7a", margin: "3px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
              <span>📍</span> {farm.location || "Location unknown"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: autoOn ? "#16a34a" : "#9ca3af" }}>
              {autoOn ? "Auto on" : "Auto off"}
            </span>
            <ToggleSwitch enabled={autoOn} onChange={() => onToggle(farm)} disabled={isSaving} />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 8 }}>
          <Stat label="Water used" value={farm.waterUsed || 0} sub="L" color="#2563eb" />
          <Stat label="Interval" value={formatInterval(intervalValue)} color="#7c3aed" />
        </div>

        {/* Moisture */}
        <MoistureBar value={farm.soilMoisture || 0} />

        {/* Last run */}
        <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
          <span>🕐</span> Last run: {lastRun}
        </p>

        {/* Schedule interval */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#4a7c4a", textTransform: "uppercase",
            letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
            Schedule interval (minutes)
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              min={MIN_INTERVAL}
              max={MAX_INTERVAL}
              value={intervalValue}
              onChange={(e) => onIntervalChange(farm._id, e.target.value)}
              style={{
                flex: 1, padding: "8px 11px", fontSize: 13, borderRadius: 10,
                border: "1px solid rgba(167,210,167,0.5)", background: "rgba(255,255,255,0.9)",
                color: "#1a3d1a", outline: "none", fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => onSaveInterval(farm._id)}
              disabled={isSaving}
              style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff",
                border: "none", cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.6 : 1, fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
              }}
            >
              Save
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: "5px 0 0" }}>
            Recommended: 5–60 min for most crops
          </p>
        </div>

        {/* Run now */}
        <button
          onClick={() => onRunNow(farm._id)}
          disabled={isSaving}
          style={{
            width: "100%", padding: "10px", borderRadius: 12, fontSize: 13, fontWeight: 600,
            background: isSaving ? "rgba(59,130,246,0.4)" : "linear-gradient(135deg,#3b82f6,#2563eb)",
            color: "#fff", border: "none",
            cursor: isSaving ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            boxShadow: isSaving ? "none" : "0 3px 12px rgba(59,130,246,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            transition: "opacity 0.2s",
          }}
        >
          {isSaving ? (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" style={{ animation: "spin 0.7s linear infinite" }}>
                <circle cx="6.5" cy="6.5" r="5" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none"/>
                <path d="M6.5 1.5A5 5 0 0 1 11.5 6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
              Running…
            </>
          ) : (
            <><span>💧</span> Run irrigation now</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function Irrigation() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingFarmId, setSavingFarmId] = useState(null);
  const [intervalDrafts, setIntervalDrafts] = useState({});
  const [notice, setNotice] = useState({ type: "", message: "" });

  const fetchFarms = async () => {
    try {
      setError("");
      const resData = await farmService.list();
      const data = Array.isArray(resData) ? resData : [];
      setFarms(data);
      setIntervalDrafts((prev) => {
        const next = { ...prev };
        data.forEach((farm) => {
          if (next[farm._id] === undefined)
            next[farm._id] = farm.autoIrrigation?.interval ?? DEFAULT_INTERVAL_MINUTES;
        });
        return next;
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load irrigation settings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFarms(); }, []);

  const toggleAuto = async (farm) => {
    try {
      setSavingFarmId(farm._id);
      await irrigationService.toggleAuto(farm._id);
      setNotice({ type: "success", message: `Auto irrigation ${farm.autoIrrigation?.enabled ? "disabled" : "enabled"}.` });
      await fetchFarms();
    } catch (err) {
      setNotice({ type: "error", message: getApiErrorMessage(err, "Error updating irrigation.") });
    } finally { setSavingFarmId(null); }
  };

  const updateInterval = async (farmId) => {
    const num = Number(intervalDrafts[farmId]);
    if (isNaN(num)) { setNotice({ type: "error", message: "Interval must be a number." }); return; }
    if (num < MIN_INTERVAL || num > MAX_INTERVAL) {
      setNotice({ type: "error", message: `Interval must be ${MIN_INTERVAL}–${MAX_INTERVAL} minutes.` }); return;
    }
    try {
      setSavingFarmId(farmId);
      await irrigationService.updateInterval(farmId, num);
      setNotice({ type: "success", message: "Schedule updated." });
      await fetchFarms();
    } catch (err) {
      setNotice({ type: "error", message: getApiErrorMessage(err, "Error updating interval.") });
    } finally { setSavingFarmId(null); }
  };

  const runIrrigation = async (farmId) => {
    try {
      setSavingFarmId(farmId);
      await irrigationService.runNow(farmId);
      setNotice({ type: "success", message: "Irrigation started." });
      await fetchFarms();
    } catch (err) {
      setNotice({ type: "error", message: getApiErrorMessage(err, "Irrigation failed.") });
    } finally { setSavingFarmId(null); }
  };

  const chartData = useMemo(
    () => farms.map((f) => ({ name: f.cropType || "Farm", water: f.waterUsed || 0 })),
    [farms]
  );

  const totalWater = useMemo(() => farms.reduce((s, f) => s + (f.waterUsed || 0), 0), [farms]);
  const activeAuto = useMemo(() => farms.filter((f) => f.autoIrrigation?.enabled).length, [farms]);
  const avgMoisture = useMemo(() => farms.length
    ? Math.round(farms.reduce((s, f) => s + (f.soilMoisture || 0), 0) / farms.length)
    : 0, [farms]);

  return (
    <DashboardLayout farms={farms}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div>

        {/* Page header */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between",
          alignItems: "flex-start", gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a3d1a", margin: 0 }}>
              Irrigation Control
            </h1>
            <p style={{ fontSize: 13, color: "#7a9e7a", margin: "4px 0 0" }}>
              Monitor moisture and automate schedules for each farm.
            </p>
          </div>
          <button
            onClick={fetchFarms}
            style={{
              padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: "rgba(255,255,255,0.8)", color: "#4a7c4a",
              border: "1px solid rgba(167,210,167,0.45)", cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 1px 6px rgba(34,85,34,0.07)",
            }}
          >
            ↻ Refresh
          </button>
        </div>

        <Toast notice={notice} onDismiss={() => setNotice({ type: "", message: "" })} />

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : error ? (
          <div style={{ ...card, padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
            <p style={{ color: "#b91c1c", fontSize: 14, margin: "0 0 14px" }}>{error}</p>
            <button onClick={fetchFarms} style={{
              padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "rgba(239,68,68,0.08)", color: "#dc2626",
              border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer",
            }}>Retry</button>
          </div>
        ) : farms.length === 0 ? (
          <div style={{ ...card, padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💧</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a3d1a", margin: "0 0 6px" }}>
              No farms to irrigate
            </h2>
            <p style={{ fontSize: 13, color: "#7a9e7a", margin: 0 }}>Add a farm to configure irrigation schedules.</p>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total water used", value: totalWater.toLocaleString(), sub: "L", color: "#2563eb" },
                { label: "Auto irrigation on", value: activeAuto, sub: `/ ${farms.length} farms`, color: "#16a34a" },
                { label: "Avg. moisture", value: avgMoisture, sub: "%", color: "#d97706" },
              ].map((s) => (
                <div key={s.label} style={{
                  ...card, padding: "14px 18px",
                  display: "flex", flexDirection: "column", gap: 4,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#7a9e7a", textTransform: "uppercase",
                    letterSpacing: "0.07em", margin: 0 }}>{s.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>
                    {s.value}
                    <span style={{ fontSize: 13, fontWeight: 400, color: "#9ca3af", marginLeft: 3 }}>{s.sub}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Farm cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {farms.map((farm) => (
                <IrrigationCard
                  key={farm._id}
                  farm={farm}
                  isSaving={savingFarmId === farm._id}
                  intervalValue={intervalDrafts[farm._id] ?? DEFAULT_INTERVAL_MINUTES}
                  onIntervalChange={(id, val) => setIntervalDrafts((p) => ({ ...p, [id]: val }))}
                  onToggle={toggleAuto}
                  onSaveInterval={updateInterval}
                  onRunNow={runIrrigation}
                />
              ))}
            </div>

            {/* Water usage chart */}
            <div style={{ ...card, padding: "24px 28px", marginTop: 32 }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a3d1a", margin: 0 }}>
                  Water Usage Analytics
                </h2>
                <p style={{ fontSize: 13, color: "#7a9e7a", margin: "4px 0 0" }}>
                  Total water used per farm since last reset
                </p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="10%" stopColor="#3b82f6" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2.5}
                    fill="url(#waterGrad)" dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {loading && <div style={{ marginTop: 32 }}><PanelSkeleton /></div>}
      </div>
    </DashboardLayout>
  );
}

export default Irrigation;
