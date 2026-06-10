export const clampPct = (v) => Math.min(100, Math.max(0, v));

export const moistureLabel = (v) => {
  if (v < 30) return "Critical";
  if (v < 45) return "Dry";
  if (v < 70) return "Optimal";
  return "Wet";
};

export const moistureStatus = (v) => {
  if (v < 30) return { label: "Critical", color: "#dc2626", bg: "#fef2f2", dot: "#ef4444" };
  if (v < 45) return { label: "Dry", color: "#d97706", bg: "#fffbeb", dot: "#f59e0b" };
  if (v < 70) return { label: "Optimal", color: "#16a34a", bg: "#f0fdf4", dot: "#22c55e" };
  return { label: "Wet", color: "#2563eb", bg: "#eff6ff", dot: "#3b82f6" };
};
