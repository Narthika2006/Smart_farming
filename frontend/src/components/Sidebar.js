function Sidebar() {
  return (
    <div className="backdrop-blur-lg bg-white/40 border border-white/30 shadow-xl rounded-2xl p-6
">
      <h2 className="text-2xl font-bold mb-8">🌱 Menu</h2>

      <ul className="space-y-4">
        <li className="hover:text-green-200 cursor-pointer">Dashboard</li>
        <li className="hover:text-green-200 cursor-pointer">My Farms</li>
        <li className="hover:text-green-200 cursor-pointer">Weather</li>
        <li className="hover:text-green-200 cursor-pointer">Reports</li>
        <li className="hover:text-green-200 cursor-pointer">Settings</li>
      </ul>
    </div>
  );
}

export default Sidebar;
