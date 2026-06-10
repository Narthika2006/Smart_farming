import { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import WeatherSection from "../components/WeatherSection";
import MoistureTrend from "../components/MoisutureTrend";
import FarmCondition from "../components/dashboard/FarmCondition";
import SimpleIrrigationPanel from "../components/dashboard/SimpleIrrigationPanel";
import { getApiErrorMessage } from "../utils/apiError";
import { CardSkeleton, PanelSkeleton } from "../components/LoadingSkeleton";
import { farmService } from "../services/farmService";
import { weatherService } from "../services/weatherService";
import { clampPct, moistureLabel } from "../domain/farmDomain";

function Dashboard() {
  const [weatherData, setWeatherData] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFarms = async () => {
    try {
      const farmData = await farmService.list();
      const list = Array.isArray(farmData) ? farmData : [];

      setFarms(list);
      setLastUpdated(new Date());

      if (!selectedFarmId && list.length > 0) {
        setSelectedFarmId(list[0]._id);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load farms."));
    }
  };

  const fetchWeather = async (location) => {
    if (!location) {
      setWeatherData(null);
      return;
    }

    try {
      setWeatherLoading(true);

      const data = await weatherService.getByCity(location);

      setWeatherData(data || null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load weather."));
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setError("");
      await fetchFarms();
      setLoading(false);
    };

    load();

    const interval = setInterval(load, 15000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedFarmId || farms.length === 0) return;

    const farm = farms.find((f) => f._id === selectedFarmId) || farms[0];

    fetchWeather(farm?.location);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFarmId, farms]);

  const activeFarm = useMemo(() => {
    if (!farms.length) return null;

    return farms.find((f) => f._id === selectedFarmId) || farms[0];
  }, [farms, selectedFarmId]);

  const irrigationStatus = useMemo(() => {
    if (!activeFarm) return "No Farm";

    const moisture = activeFarm.soilMoisture ?? 0;

    if (moisture < 40) return "ON";
    if (moisture > 70) return "OFF";

    return "STABLE";
  }, [activeFarm]);

  const summary = useMemo(() => {
    const totalFarms = farms.length;

    const avgMoisture = totalFarms
      ? Math.round(
          farms.reduce(
            (sum, farm) => sum + clampPct(farm.soilMoisture || 0),
            0
          ) / totalFarms
        )
      : 0;

    const totalWater = farms.reduce(
      (sum, farm) => sum + (farm.waterUsed || 0),
      0
    );

    const counts = farms.reduce(
      (acc, farm) => {
        const label = moistureLabel(clampPct(farm.soilMoisture || 0));
        acc[label] += 1;
        return acc;
      },
      {
        Critical: 0,
        Dry: 0,
        Optimal: 0,
        Wet: 0,
      }
    );

    return {
      totalFarms,
      avgMoisture,
      totalWater,
      counts,
    };
  }, [farms]);

  if (loading) {
    return (
      <DashboardLayout farms={farms} weather={weatherData}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <PanelSkeleton />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <PanelSkeleton />
          <PanelSkeleton />
        </div>

        <div className="mt-6">
          <PanelSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout farms={farms} weather={weatherData}>
        <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-2xl text-center">
          <h2 className="text-xl font-semibold mb-2">
            Dashboard unavailable
          </h2>

          <p className="mb-4">{error}</p>

          <button
            onClick={() => {
              setLoading(true);
              setError("");

              fetchFarms().finally(() => setLoading(false));
            }}
            className="px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!activeFarm) {
    return (
      <DashboardLayout farms={farms} weather={weatherData}>
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <h2 className="text-xl font-semibold mb-2">No farms available</h2>
          <p className="text-gray-600">Add a farm to start monitoring.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout farms={farms} weather={weatherData}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-green-900">Farm Overview</h1>

          <p className="text-gray-600 mt-1">
            Keep track of moisture, irrigation status, and water usage.
          </p>

          {activeFarm && (
            <span className="inline-flex items-center gap-2 mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-800 border border-green-100">
              Active farm:{" "}
              {activeFarm.cropType || activeFarm.location || "Unnamed"}
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-3 flex-wrap">
          <select
            value={selectedFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-green-100 text-sm text-green-900 bg-white"
          >
            {farms.map((farm) => (
              <option key={farm._id} value={farm._id}>
                {farm.cropType || farm.location || "Unnamed farm"}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setRefreshing(true);
              setError("");

              fetchFarms().finally(() => setRefreshing(false));
            }}
            className="px-4 py-2 rounded-xl border border-green-200 text-green-800 bg-green-50 hover:bg-green-100 text-sm font-semibold"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <div className="text-xs text-gray-500">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : ""}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-sm text-gray-500">Total farms</p>
          <p className="text-2xl font-semibold text-green-900">
            {summary.totalFarms}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-sm text-gray-500">Average moisture</p>
          <p className="text-2xl font-semibold text-green-900">
            {summary.avgMoisture}%
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-sm text-gray-500">Total water used</p>
          <p className="text-2xl font-semibold text-green-900">
            {summary.totalWater} L
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-sm text-gray-500">Needs attention</p>
          <p className="text-2xl font-semibold text-red-600">
            {summary.counts.Critical + summary.counts.Dry}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <FarmCondition farm={activeFarm} weather={weatherData} />
        <SimpleIrrigationPanel farm={activeFarm} status={irrigationStatus} />
      </div>

      <div className="mt-6">
        {weatherLoading ? (
          <PanelSkeleton />
        ) : (
          <WeatherSection
            weatherData={weatherData}
            farms={farms}
            selectedFarmId={selectedFarmId}
            onSelectFarm={setSelectedFarmId}
          />
        )}
      </div>

      <div className="mt-6">
        <MoistureTrend farm={activeFarm} />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;