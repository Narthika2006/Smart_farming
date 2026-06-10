import { useState, useEffect } from "react";

function IrrigationPanel({ farm, status }) {
  const [irrigationOn, setIrrigationOn] = useState(false);

  useEffect(() => {
    if (!farm) return;

    // Auto recommendation logic
    if (farm.soilMoisture < 40) {
      setIrrigationOn(true);
    } else if (farm.soilMoisture > 70) {
      setIrrigationOn(false);
    }
  }, [farm]);

  if (!farm) return null;

  const toggleIrrigation = () => {
    setIrrigationOn((prev) => !prev);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="font-semibold mb-4">
        💧 Irrigation Control Panel
      </h3>

      <div className="space-y-2 text-gray-700">
        <p><strong>Farm:</strong> {farm.farmName}</p>
        <p><strong>Soil Moisture:</strong> {farm.soilMoisture}%</p>
        <p><strong>System Status:</strong> {status}</p>
      </div>

      {/* ON/OFF BUTTON */}
      <div className="mt-6 flex items-center justify-between">
        <span className="font-medium">
          Irrigation is {irrigationOn ? "ON" : "OFF"}
        </span>

        <button
          onClick={toggleIrrigation}
          className={`px-6 py-2 rounded-xl font-semibold text-white transition
            ${irrigationOn
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {irrigationOn ? "Turn OFF" : "Turn ON"}
        </button>
      </div>

      {/* Status Indicator */}
      <div className={`mt-4 p-3 rounded-lg text-center font-medium
        ${irrigationOn ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
        {irrigationOn
          ? "Water supply active"
          : "Irrigation system idle"}
      </div>
    </div>
  );
}

export default IrrigationPanel;