function StatsCards({ farms = [], weather }) {

  const totalFarms = farms.length;

  const activeCrops = farms.filter(farm => farm.cropType).length;

  const avgSoilMoisture =
    farms.length > 0
      ? Math.round(
          farms.reduce((sum, farm) => sum + farm.soilMoisture, 0) /
            farms.length
        )
      : 0;

  const temperature = weather?.main?.temp || 0;

  const stats = [
    { title: "Total Farms", value: totalFarms },
    { title: "Active Crops", value: activeCrops },
    { title: "Avg Soil Moisture", value: `${avgSoilMoisture}%` },
    { title: "Temperature", value: `${temperature}°C` }
  ];
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {stats.map((item, index) => (
        <div
          key={index}
          className="backdrop-blur-lg bg-white/40 border border-white/30 shadow-xl rounded-2xl p-6 transition hover:scale-105 duration-300"
        >
          <h3 className="text-gray-500">{item.title}</h3>
          <p className="text-3xl font-bold mt-2">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
