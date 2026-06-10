function FarmingAdvice({ weather, farm }) {
  if (!weather || !farm) return null;

  const temp = weather.main?.temp || 0;

  let advice = "Conditions normal.";

  if (temp > 35)
    advice = "High temperature detected. Irrigate in evening.";
  else if (farm.soilMoisture < 40)
    advice = "Soil is dry. Water crops soon.";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="font-bold text-green-800 mb-4">
        🌱 Today's Advice
      </h2>

      <p className="text-gray-700">{advice}</p>
    </div>
  );
}

export default FarmingAdvice;