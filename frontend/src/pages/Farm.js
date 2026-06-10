import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import AddFarmModal from "../components/AddFarmModal";
import { getApiErrorMessage } from "../utils/apiError";
import { CardSkeleton } from "../components/LoadingSkeleton";
import { farmService } from "../services/farmService";
import { clampPct, moistureStatus } from "../domain/farmDomain";

const soilConfig = {
  Clay: { emoji: "🟤", color: "#92400e", bg: "#fef3c7", suggestion: "Needs high water retention", min: 60, max: 80 },
  Sandy: { emoji: "🟡", color: "#a16207", bg: "#fefce8", suggestion: "Water frequently — low retention", min: 30, max: 50 },
  Loamy: { emoji: "🌿", color: "#166534", bg: "#f0fdf4", suggestion: "Ideal moisture balance", min: 50, max: 70 },
  Silty: { emoji: "💧", color: "#1e40af", bg: "#eff6ff", suggestion: "Moderate watering needed", min: 55, max: 75 },
  Peaty: { emoji: "🌑", color: "#374151", bg: "#f9fafb", suggestion: "High organic retention", min: 65, max: 85 },
  Chalky: { emoji: "⚪", color: "#6b7280", bg: "#f3f4f6", suggestion: "Alkaline — well-draining", min: 30, max: 45 },
};

// ── Shared styled primitives ──────────────────────────────────────────────────
const cardBase = {
  background: "#ffffff",
  border: "1px solid rgba(226,232,226,0.7)",
  borderRadius: 16,
  boxShadow: "0 6px 20px rgba(16, 24, 16, 0.06)",
};

function Toast({ notice, onDismiss }) {
  if (!notice?.message) return null;
  const isOk = notice.type === "success";
  return (
    <div
      className="mb-5 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm"
      role={isOk ? "status" : "alert"}
      style={{
        background: isOk ? "rgba(220,252,231,0.85)" : "rgba(254,226,226,0.85)",
        border: `1px solid ${isOk ? "rgba(134,239,172,0.5)" : "rgba(252,165,165,0.5)"}`,
        color: isOk ? "#15803d" : "#b91c1c",
      }}
    >
      <span className="flex items-center gap-2">{isOk ? "✓" : "⚠"} {notice.message}</span>
      <button
        onClick={onDismiss}
        style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.6, fontSize: 16, lineHeight: 1 }}
      >✕</button>
    </div>
  );
}

function MoistureGauge({ value, min, max }) {
  const pct = clampPct(value);
  const st = moistureStatus(pct);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span style={{ fontSize: 11, color: "#7a9e7a", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Soil moisture
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: st.dot, boxShadow: `0 0 4px ${st.dot}` }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: st.color }}>{pct}%</span>
        </div>
      </div>
      <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: st.dot }}
        />
        {min !== undefined && (
          <div className="absolute top-0 bottom-0 w-px" style={{ left: `${min}%`, background: "rgba(0,0,0,0.2)" }} />
        )}
        {max !== undefined && (
          <div className="absolute top-0 bottom-0 w-px" style={{ left: `${max}%`, background: "rgba(0,0,0,0.2)" }} />
        )}
      </div>
      {min !== undefined && max !== undefined && (
        <div className="flex justify-between mt-0.5">
          <span style={{ fontSize: 10, color: "#bbb" }}>0</span>
          <span style={{ fontSize: 10, color: "#9ca3af" }}>Ideal: {min}–{max}%</span>
          <span style={{ fontSize: 10, color: "#bbb" }}>100</span>
        </div>
      )}
    </div>
  );
}

// ── FarmCard ──────────────────────────────────────────────────────────────────
function FarmCard({ farm, onDelete, onEdit }) {
  const [moisture, setMoisture] = useState(farm.soilMoisture || 0);
  const [notice, setNotice] = useState({ type: "", message: "" });

  useEffect(() => {
    setMoisture(farm.soilMoisture || 0);
  }, [farm]);

  const activeSoilType = farm.soilType;
  const soil = soilConfig[activeSoilType] || {};
  const displayedMoisture = moisture;
  const st = moistureStatus(displayedMoisture);

  const getRecommendation = () => {
    if (!soil.min) return null;
    if (displayedMoisture < soil.min) return `Irrigate +${soil.min - displayedMoisture}% to reach optimal`;
    if (displayedMoisture > soil.max) return "Well-watered — irrigation not needed";
    return "Moisture is optimal for this soil";
  };

  const rec = getRecommendation();

  return (
    <div
      style={{ ...cardBase, display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(34,85,34,0.11)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 20px rgba(34,85,34,0.06)";
      }}
    >
      {/* Card top accent */}
      <div style={{ height: 3, borderRadius: "20px 20px 0 0", background: `linear-gradient(90deg, ${soil.color || "#16a34a"}, transparent)` }} />

      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1a3d1a",
              margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {farm.cropType || "Unnamed crop"}
            </h2>
            <p style={{ fontSize: 12, color: "#7a9e7a", margin: "3px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
              <span>📍</span> {farm.location || "—"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => { setNotice({ type: "", message: "" }); onEdit?.(); }}
              style={{
                fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
                background: "rgba(22,163,74,0.1)",
                color: "#16a34a",
                border: "none", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Edit
            </button>
          </div>
        </div>

        {/* Soil badge + status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          {activeSoilType ? (
            <span style={{
              fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
              background: soil.bg || "#f9fafb", color: soil.color || "#374151",
              border: `1px solid ${soil.color || "#d1d5db"}22`,
            }}>
              {soil.emoji} {activeSoilType}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: "#9ca3af" }}>No soil type</span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
            background: st.bg, color: st.color,
          }}>
            {st.label}
          </span>
        </div>

        {/* Moisture gauge */}
        <MoistureGauge value={displayedMoisture} min={soil.min} max={soil.max} />

        {/* Suggestion */}
        {soil.suggestion && (
          <p style={{ fontSize: 12, color: "#5a7a5a", margin: 0, padding: "6px 10px",
            background: "rgba(240,253,244,0.7)", borderRadius: 8, borderLeft: "2px solid #86efac" }}>
            {soil.suggestion}
          </p>
        )}

        {/* Irrigation recommendation */}
        {rec && (
          <p style={{ fontSize: 12, color: "#2563eb", margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
            <span>💧</span> {rec}
          </p>
        )}

        {/* Toast */}
        {notice.message && (
          <Toast notice={notice} onDismiss={() => setNotice({ type: "", message: "" })} />
        )}

        {/* Delete */}
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onDelete}
            style={{
              fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8,
              background: "rgba(239,68,68,0.08)", color: "#dc2626",
              border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
          >
            🗑 Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm dialog ─────────────────────────────────────────────────────
function DeleteDialog({ target, onCancel, onConfirm }) {
  if (!target) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4 z-50"
      style={{ background: "rgba(10,30,10,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={onCancel}
    >
      <div
        style={{ ...cardBase, width: "100%", maxWidth: 400, padding: 28 }}
        onMouseDown={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "#fef2f2",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>
          🗑
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a3d1a", margin: "0 0 6px" }}>
          Remove this farm?
        </h3>
        <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: "#374151" }}>
            {target.cropType || target.location || "This farm"}
          </strong>{" "}
          will be permanently deleted. This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "9px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: "rgba(0,0,0,0.05)", color: "#4a7c4a",
              border: "1px solid rgba(167,210,167,0.4)", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Keep farm
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "9px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 3px 10px rgba(239,68,68,0.3)",
            }}
          >
            Yes, delete
          </button>
        </div>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: "12px 0 0" }}>Press Esc to close</p>
      </div>
    </div>
  );
}

// ── Farm page ─────────────────────────────────────────────────────────────────
function Farm() {
  const [farms, setFarms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortKey, setSortKey] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const fetchFarms = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await farmService.list();
      setFarms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load farms."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFarms(); }, []);

  useEffect(() => {
    if (!deleteTarget) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setDeleteTarget(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteTarget]);

  const deleteFarm = async (id) => {
    if (!id) return;
    try {
      await farmService.remove(id);
      setFarms((prev) => prev.filter((f) => f._id !== id));
      setNotice({ type: "success", message: "Farm removed successfully." });
    } catch (err) {
      setNotice({ type: "error", message: getApiErrorMessage(err, "Unable to delete farm.") });
    }
  };

  const filteredFarms = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let next = farms;
    if (needle) {
      next = next.filter((f) =>
        [f.cropType, f.location, f.soilType].filter(Boolean).join(" ").toLowerCase().includes(needle)
      );
    }
    if (filterStatus !== "All") {
      next = next.filter((f) => moistureStatus(clampPct(Number(f.soilMoisture || 0))).label === filterStatus);
    }
    if (sortKey === "moisture") {
      next = [...next].sort((a, b) => Number(b.soilMoisture || 0) - Number(a.soilMoisture || 0));
    } else if (sortKey === "location") {
      next = [...next].sort((a, b) => (a.location || "").localeCompare(b.location || ""));
    } else {
      next = [...next].sort((a, b) => (a.cropType || "").localeCompare(b.cropType || ""));
    }
    return next;
  }, [farms, query, filterStatus, sortKey]);

  const stats = useMemo(() => {
    if (!farms.length) return null;
    const avg = Math.round(
      farms.reduce((sum, f) => sum + clampPct(Number(f.soilMoisture || 0)), 0) / farms.length
    );
    const counts = farms.reduce((acc, f) => {
      const label = moistureStatus(clampPct(Number(f.soilMoisture || 0))).label;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    return { avg, counts };
  }, [farms]);

  return (
    <DashboardLayout farms={farms}>
      <div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-green-900">Farms</h1>
            <p className="text-gray-600 mt-1">
              {farms.length} farm{farms.length !== 1 ? "s" : ""} · Search by crop, location, or soil type
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-3 flex-wrap">
            <div className="relative min-w-[180px] flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search farms…"
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-green-100 text-sm text-green-900 bg-white"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">🔍</span>
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl border border-green-200 text-green-800 bg-green-50 hover:bg-green-100 text-sm font-semibold"
            >
              Add Farm
            </button>
            <button
              onClick={fetchFarms}
              className="px-4 py-2 rounded-xl border border-green-200 text-green-800 bg-white hover:bg-green-50 text-sm font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-2xl shadow">
              <p className="text-sm text-gray-500">Total farms</p>
              <p className="text-2xl font-semibold text-green-900">{farms.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow">
              <p className="text-sm text-gray-500">Average moisture</p>
              <p className="text-2xl font-semibold text-green-900">{stats.avg}%</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow">
              <p className="text-sm text-gray-500">Needs attention</p>
              <p className="text-2xl font-semibold text-red-600">
                {(stats.counts.Critical || 0) + (stats.counts.Dry || 0)}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-4 mt-4 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {["All", "Critical", "Dry", "Optimal", "Wet"].map((label) => (
              <button
                key={label}
                onClick={() => setFilterStatus(label)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  filterStatus === label
                    ? "bg-green-50 text-green-800 border-green-200"
                    : "bg-white text-gray-500 border-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort by</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="px-3 py-2 rounded-xl border border-green-100 text-sm text-green-900 bg-white"
            >
              <option value="name">Crop name</option>
              <option value="location">Location</option>
              <option value="moisture">Moisture</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <Toast notice={notice} onDismiss={() => setNotice({ type: "", message: "" })} />
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-5 mt-4">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-2xl shadow text-center mt-4">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchFarms}
              className="px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        ) : farms.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center mt-4">
            <div className="text-4xl mb-3">🌱</div>
            <h2 className="text-lg font-semibold text-green-900 mb-1">No farms yet</h2>
            <p className="text-gray-600 text-sm mb-5">Add your first farm to start monitoring.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2 rounded-xl border border-green-200 text-green-800 bg-green-50 hover:bg-green-100 text-sm font-semibold"
            >
              Add your first farm
            </button>
          </div>
        ) : filteredFarms.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow text-center mt-4">
            <div className="text-2xl mb-2">🔍</div>
            <h2 className="text-base font-semibold text-green-900 mb-1">No results for "{query}"</h2>
            <p className="text-gray-600 text-sm">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {filteredFarms.map((farm) => (
              <FarmCard
                key={farm._id}
                farm={farm}
                onDelete={() => setDeleteTarget(farm)}
                onEdit={() => setEditTarget(farm)}
              />
            ))}
          </div>
        )}
      </div>

      <AddFarmModal
        isOpen={showModal || Boolean(editTarget)}
        mode={editTarget ? "edit" : "add"}
        initialFarm={editTarget}
        onClose={() => { setShowModal(false); setEditTarget(null); }}
        onFarmAdded={fetchFarms}
        onFarmUpdated={fetchFarms}
      />

      <DeleteDialog
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { deleteFarm(deleteTarget?._id); setDeleteTarget(null); }}
      />
    </DashboardLayout>
  );
}

export default Farm;

