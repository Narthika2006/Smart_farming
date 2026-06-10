function FarmCondition({ farm, weather }) {
  if (!farm) return null;

  const moisture = farm.soilMoisture || 0;
  const temp = weather?.main?.temp || 0;

  /* ===== Moisture Status ===== */
  let status = "";
  let barColor = "";

  if (moisture < 40) {
    status = "Low Moisture - Irrigation Required";
    barColor = "bg-red-500";
  } else if (moisture > 70) {
    status = "High Moisture - Stop Irrigation";
    barColor = "bg-blue-500";
  } else {
    status = "Moisture Level Stable";
    barColor = "bg-green-500";
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <h3 className="font-semibold mb-4">
        🌱 Current Farm Condition
      </h3>

      <div className="space-y-3 text-gray-700">
        <p><strong>Farm:</strong> {farm.farmName}</p>
        <p><strong>Crop:</strong> {farm.cropType}</p>
        <p><strong>Temperature:</strong> {temp}°C</p>
      </div>

      {/* ===== Moisture Progress Bar ===== */}
      <div className="mt-5">
        <p className="text-sm mb-2 font-medium">
          Soil Moisture: {moisture}%
        </p>

        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
          <div
            className={`${barColor} h-4 transition-all duration-500`}
            style={{ width: `${moisture}%` }}
          />
        </div>
      </div>

      {/* ===== Status Message ===== */}
      <div className="mt-4 p-3 rounded-lg bg-gray-100 text-gray-800">
        {status}
      </div>
    </div>
  );
}

export default FarmCondition;