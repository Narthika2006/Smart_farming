import React, { useMemo } from "react";

function AlertPanel({ farm }) {
  const alerts = useMemo(() => {
    if (!farm) return [];

    const list = [];

    if (farm.soilMoisture < 40) {
      list.push({ msg: "Soil moisture is LOW - Irrigation required", type: "warning" });
    }

    if (farm.soilMoisture > 70) {
      list.push({ msg: "Soil moisture HIGH - Stop watering", type: "info" });
    }

    if (farm.waterLevel < 20) {
      list.push({ msg: "Water tank level CRITICAL - Refill needed", type: "danger" });
    }

    return list;
  }, [farm]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow">
      <h3 className="text-green-900 font-semibold mb-3">Smart Alerts</h3>

      {alerts.length === 0 ? (
        <p className="text-gray-600 text-sm">All systems operating normally</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <AlertItem key={index} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertItem({ alert }) {
  const colors = {
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    info: "bg-blue-50 text-blue-700 border border-blue-100",
    danger: "bg-red-50 text-red-700 border border-red-100",
  };

  return (
    <div className={`p-3 rounded-xl text-sm font-medium ${colors[alert.type]}`}>
      {alert.msg}
    </div>
  );
}

export default AlertPanel;
