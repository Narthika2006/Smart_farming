import { useState, useMemo, useEffect, useRef } from "react";
import { Bell } from "lucide-react";

const fonts = { fontFamily: "'DM Sans', sans-serif" };

const typeConfig = {
  warning: {
    icon: "⚠️",
    color: "#d97706",
    bg: "rgba(255,251,235,0.9)",
    border: "rgba(251,191,36,0.3)",
    dot: "#f59e0b",
  },
  danger: {
    icon: "🚨",
    color: "#dc2626",
    bg: "rgba(254,242,242,0.9)",
    border: "rgba(252,165,165,0.3)",
    dot: "#ef4444",
  },
  info: {
    icon: "ℹ️",
    color: "#2563eb",
    bg: "rgba(239,246,255,0.9)",
    border: "rgba(147,197,253,0.3)",
    dot: "#3b82f6",
  },
};

function NotificationBell({ farms = [], weather }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const notifications = useMemo(() => {
    const alerts = [];
    farms.forEach((farm) => {
      const label = farm.cropType || farm.location || farm.farmName || "a farm";
      if (farm.soilMoisture < 40) {
        alerts.push({
          id: farm._id + "low",
          message: `Low moisture in ${label}`,
          detail: `${farm.soilMoisture}% — below the 40% threshold`,
          type: "warning",
        });
      }
      if (farm.soilMoisture > 70) {
        alerts.push({
          id: farm._id + "high",
          message: `Over-irrigation risk in ${label}`,
          detail: `${farm.soilMoisture}% — above the 70% threshold`,
          type: "danger",
        });
      }
    });
    if (weather?.main?.temp > 35) {
      alerts.push({
        id: "temp",
        message: "High temperature alert",
        detail: `${Math.round(weather.main.temp)}°C — consider increasing watering`,
        type: "danger",
      });
    }
    if (weather?.main?.humidity < 30) {
      alerts.push({
        id: "humidity",
        message: "Low humidity detected",
        detail: `${weather.main.humidity}% — crops may need extra water`,
        type: "warning",
      });
    }
    return alerts;
  }, [farms, weather]);

  const count = notifications.length;
  const hasDanger = notifications.some((n) => n.type === "danger");

  return (
    <div ref={ref} style={{ position: "relative", ...fonts }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label={`Alerts (${count})`}
        aria-expanded={open}
        style={{
          position: "relative",
          width: 38, height: 38,
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: open ? "rgba(22,163,74,0.1)" : "rgba(255,255,255,0.7)",
          border: `1px solid ${open ? "rgba(134,239,172,0.5)" : "rgba(167,210,167,0.35)"}`,
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
          boxShadow: "0 1px 4px rgba(34,85,34,0.06)",
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = "rgba(240,253,244,0.9)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "rgba(255,255,255,0.7)"; }}
      >
        <Bell size={17} color={open ? "#16a34a" : "#4a7c4a"} strokeWidth={1.8} />

        {/* Badge */}
        {count > 0 && (
          <span style={{
            position: "absolute", top: -5, right: -5,
            minWidth: 18, height: 18,
            background: hasDanger
              ? "linear-gradient(135deg,#ef4444,#dc2626)"
              : "linear-gradient(135deg,#f59e0b,#d97706)",
            color: "#fff", fontSize: 10, fontWeight: 700,
            borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px",
            border: "2px solid #fff",
            boxShadow: hasDanger
              ? "0 2px 6px rgba(239,68,68,0.4)"
              : "0 2px 6px rgba(245,158,11,0.4)",
            animation: hasDanger ? "pulse-ring 2s ease-in-out infinite" : "none",
          }}>
            {count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute", right: 0, top: "calc(100% + 10px)",
            width: 320, zIndex: 50,
            background: "linear-gradient(160deg, #f4fbf4 0%, #ffffff 60%, #f0f9f0 100%)",
            border: "1px solid rgba(167,210,167,0.4)",
            borderRadius: 20,
            boxShadow: "0 16px 48px rgba(0,60,0,0.14), 0 2px 12px rgba(0,0,0,0.07)",
            overflow: "hidden",
            animation: "slideDown 0.18s ease-out",
          }}
        >
          {/* Top accent */}
          <div style={{ height: 3, background: "linear-gradient(90deg,#16a34a,#4ade80,#86efac)" }} />

          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 16px 12px",
            borderBottom: "1px solid rgba(167,210,167,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a3d1a",
                fontFamily: "'DM Serif Display', serif" }}>Alerts</span>
              {count > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
                  background: hasDanger ? "rgba(254,226,226,0.8)" : "rgba(255,251,235,0.8)",
                  color: hasDanger ? "#dc2626" : "#d97706",
                  border: `1px solid ${hasDanger ? "rgba(252,165,165,0.4)" : "rgba(251,191,36,0.3)"}`,
                }}>
                  {count} active
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#7a9e7a", fontSize: 15, lineHeight: 1, padding: 2,
              }}
              aria-label="Close"
            >✕</button>
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {count === 0 ? (
              <div style={{ padding: "28px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                <p style={{ fontSize: 13, color: "#7a9e7a", margin: 0, fontWeight: 500 }}>
                  All systems normal
                </p>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "3px 0 0" }}>
                  No active alerts across your farms
                </p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const cfg = typeConfig[n.type] || typeConfig.info;
                return (
                  <div
                    key={n.id}
                    style={{
                      padding: "12px 16px",
                      borderBottom: i < notifications.length - 1
                        ? "1px solid rgba(167,210,167,0.15)" : "none",
                      background: "transparent",
                      transition: "background 0.12s",
                      display: "flex", gap: 10, alignItems: "flex-start",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(240,253,244,0.6)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Icon bubble */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 15,
                    }}>
                      {cfg.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: cfg.color, margin: "0 0 2px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {n.message}
                      </p>
                      {n.detail && (
                        <p style={{ fontSize: 11, color: "#7a9e7a", margin: 0, lineHeight: 1.4 }}>
                          {n.detail}
                        </p>
                      )}
                    </div>

                    {/* Dot indicator */}
                    <span style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: cfg.dot, flexShrink: 0, marginTop: 4,
                      boxShadow: `0 0 5px ${cfg.dot}`,
                    }} />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {count > 0 && (
            <div style={{
              padding: "10px 16px",
              borderTop: "1px solid rgba(167,210,167,0.2)",
              display: "flex", justifyContent: "center",
            }}>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                {count} alert{count !== 1 ? "s" : ""} across your farms
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%,100% { box-shadow: 0 2px 6px rgba(239,68,68,0.4); }
          50%      { box-shadow: 0 2px 10px rgba(239,68,68,0.7); }
        }
      `}</style>
    </div>
  );
}

export default NotificationBell;