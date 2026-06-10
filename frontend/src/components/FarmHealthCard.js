import React from "react";

function FarmHealthCard({ health = 82 }) {
  const status =
    health > 75
      ? "Excellent Condition ✅"
      : health > 50
      ? "Good Condition 👍"
      : "Needs Attention ⚠️";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}
    >
      {/* Title */}
      <h3 style={{ color: "#166534", fontWeight: "600", marginBottom: "15px" }}>
        🌱 Farm Health
      </h3>

      {/* Circle */}
      <div
        style={{
          width: "110px",
          height: "110px",
          margin: "auto",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#22c55e,#4ade80)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "26px",
          fontWeight: "bold",
        }}
      >
        {health}%
      </div>

      {/* Status */}
      <p style={{ marginTop: "15px", color: "#374151", fontSize: "14px" }}>
        {status}
      </p>
    </div>
  );
}

export default FarmHealthCard;