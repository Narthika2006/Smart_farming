function WeatherSection({ weatherData, farms = [], selectedFarmId, onSelectFarm }) {
  const temp = weatherData?.main?.temp;
  const humidity = weatherData?.main?.humidity;
  const condition = weatherData?.weather?.[0]?.main;

  let rainPrediction = "No rain expected";

  if (condition?.toLowerCase().includes("rain") || humidity > 80) {
    rainPrediction = "High chance of rainfall";
  } else if (humidity > 65) {
    rainPrediction = "Possible light rain";
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-900">Weather Overview</h3>
          <p className="text-sm text-gray-600">Forecast based on selected farm location.</p>
        </div>

        {farms.length > 0 && (
          <select
            value={selectedFarmId || ""}
            onChange={(e) => onSelectFarm?.(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {farms.map((farm) => (
              <option key={farm._id} value={farm._id}>
                {farm.cropType || farm.location || "Farm"}
              </option>
            ))}
          </select>
        )}
      </div>

      {!weatherData ? (
        <p className="text-sm text-gray-500 mt-4">Weather data unavailable.</p>
      ) : (
        <>
          <div className="space-y-2 text-gray-700 mt-4">
            <p>
              <strong>Temperature:</strong> {temp}°C
            </p>
            <p>
              <strong>Humidity:</strong> {humidity}%
            </p>
            <p>
              <strong>Condition:</strong> {condition}
            </p>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-100 text-blue-800">
            {rainPrediction}
          </div>
        </>
      )}
    </div>
  );
}

export default WeatherSection;
