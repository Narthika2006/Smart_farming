import { useState, useEffect } from "react";

function SimpleIrrigationPanel({ farm }) {
  const [irrigationOn, setIrrigationOn] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [moisture, setMoisture] = useState(farm?.soilMoisture || 0);
  const [alert, setAlert] = useState("");

  const MAX_THRESHOLD = 70; // stop irrigation at 70%

  /* ===== Simulate Moisture Increase When Irrigation ON ===== */
  useEffect(() => {
    if (!irrigationOn) return;

    const interval = setInterval(() => {
      setMoisture((prev) => {
        const newMoisture = prev + 2;

        if (newMoisture >= MAX_THRESHOLD) {
          setAlert("Moisture threshold reached!");

          if (autoMode) {
            setIrrigationOn(false);
            setAlert("Auto Mode: Irrigation Stopped at Safe Level");
          }

          return MAX_THRESHOLD;
        }

        return newMoisture;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [irrigationOn, autoMode]);

  /* ===== Manual Toggle ===== */
  const toggleIrrigation = () => {
    setAlert("");
    setIrrigationOn((prev) => !prev);
  };

  if (!farm) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="font-semibold mb-4">
        💧 Smart Irrigation System
      </h3>

      <p className="mb-2">
        <strong>Current Moisture:</strong> {moisture}%
      </p>

      {/* Auto Mode Toggle */}
      <div className="flex items-center justify-between mt-4">
        <span className="font-medium">Auto Mode</span>
        <button
          onClick={() => setAutoMode(!autoMode)}
          className={`px-4 py-1 rounded-full text-sm font-semibold transition
            ${autoMode ? "bg-green-600 text-white" : "bg-gray-300 text-gray-700"}`}
        >
          {autoMode ? "Enabled" : "Disabled"}
        </button>
      </div>

      {/* Irrigation Button */}
      <div className="mt-6 flex items-center justify-between">
        <span className="font-medium">
          Irrigation is {irrigationOn ? "ON" : "OFF"}
        </span>

        <button
          onClick={toggleIrrigation}
          className={`px-6 py-2 rounded-xl font-semibold text-white transition
            ${irrigationOn
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {irrigationOn ? "Turn OFF" : "Turn ON"}
        </button>
      </div>

      {/* Status Alert */}
      {alert && (
        <div className="mt-5 p-3 rounded-lg bg-yellow-100 text-yellow-800 font-medium text-center">
          🚨 {alert}
        </div>
      )}
    </div>
  );
}

export default SimpleIrrigationPanel;