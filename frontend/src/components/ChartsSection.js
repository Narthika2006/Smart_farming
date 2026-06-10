import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

function ChartsSection() {

  const data = [
    { day: "Mon", moisture: 45, temperature: 28 },
    { day: "Tue", moisture: 40, temperature: 30 },
    { day: "Wed", moisture: 38, temperature: 32 },
    { day: "Thu", moisture: 50, temperature: 27 },
    { day: "Fri", moisture: 55, temperature: 25 },
    { day: "Sat", moisture: 48, temperature: 29 },
    { day: "Sun", moisture: 60, temperature: 26 }
  ];

  return (
    <div className="backdrop-blur-lg bg-white/40 border border-white/30 shadow-xl rounded-2xl p-6
">
      <h2 className="text-xl font-bold mb-6">Farm Analytics</h2>

      <div className="grid grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="moisture" stroke="#16a34a" />
          </LineChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="temperature" stroke="#ef4444" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ChartsSection;
