import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function MoistureTrend({ farm }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!farm) return;

    // Simulate live moisture updates
    const interval = setInterval(() => {
      setData((prev) => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          moisture:
            farm.soilMoisture +
            Math.floor(Math.random() * 5 - 2),
        };

        const updated = [...prev, newPoint];
        return updated.slice(-10); // keep last 10 points
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [farm]);

  if (!farm) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mt-6">
      <h3 className="font-semibold mb-4">
        📊 Soil Moisture Trend
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="moisture"
            stroke="#16a34a"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MoistureTrend;