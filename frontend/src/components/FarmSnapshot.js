function FarmSnapshot({ farm }) {
  if (!farm) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="font-bold text-green-800 mb-4">
        📍 Active Farm Snapshot
      </h2>

      <p>🌾 Crop: {farm.cropType}</p>
      <p>📍 Location: {farm.location}</p>
      <p>💧 Moisture: {farm.soilMoisture}%</p>
      <p>🧱 Soil: {farm.soilType}</p>
    </div>
  );
}

export default FarmSnapshot;