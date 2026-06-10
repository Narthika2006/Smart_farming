function FarmStatusSummary({ farms }) {
  const total = farms.length;

  const critical = farms.filter(
    (f) => f.soilMoisture < 40
  ).length;

  return (
    <div className="bg-green-700 text-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold">
        🌾 Smart Farming Dashboard
      </h2>

      <p className="mt-2 text-green-100">
        {total} Farm(s) Monitored • {critical} Need Irrigation
      </p>
    </div>
  );
}

export default FarmStatusSummary;