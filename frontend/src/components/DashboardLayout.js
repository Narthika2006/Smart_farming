import { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, LayoutDashboard, Sprout, Droplets } from "lucide-react";

import ProfileModal from "./ProfileModal";
import NotificationBell from "./NotificationBell";
import { getAuthValue } from "../utils/authStorage";

function DashboardLayout({ children, farms = [], weather }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.includes("farms")) return "Farm Management";
    if (location.pathname.includes("irrigation")) return "Irrigation Control";
    return "Dashboard Overview";
  };

  const initials = useMemo(() => {
    const name = getAuthValue("name") || "User";
    return name.charAt(0).toUpperCase();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-green-900 text-white transition-all duration-300 flex flex-col shadow-2xl relative`}
      >
        <div className="p-5 text-xl font-bold border-b border-green-700 tracking-wide">
          {sidebarOpen ? "SmartFarm" : "SF"}
        </div>

        <nav className="flex-1 mt-6 space-y-2 px-2">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            to="/dashboard"
            open={sidebarOpen}
          />

          <SidebarItem icon={<Sprout size={20} />} label="Farms" to="/farms" open={sidebarOpen} />

          <SidebarItem
            icon={<Droplets size={20} />}
            label="Irrigation"
            to="/irrigation"
            open={sidebarOpen}
          />
        </nav>

        <div className="p-4 text-xs text-green-300 border-t border-green-700">
          {sidebarOpen && "SmartFarm v1.0"}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Menu />
              </button>

              <div>
                <h1 className="text-xl font-semibold text-gray-800">{getTitle()}</h1>
                <p className="text-xs text-gray-500">Monitor and manage your farms efficiently</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell farms={farms} weather={weather} />

              <button
                onClick={() => setShowProfile(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition text-sm font-semibold text-green-800 shadow"
                aria-label="Open profile"
              >
                {initials}
              </button>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">{children}</main>
      </div>

      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}

function SidebarItem({ icon, label, to, open }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 p-3 rounded-xl transition-all duration-200
        ${isActive ? "bg-green-700 shadow-lg" : "hover:bg-green-800/70"}`
      }
    >
      {icon}

      {open && <span>{label}</span>}

      {!open && (
        <span className="absolute left-20 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
          {label}
        </span>
      )}
    </NavLink>
  );
}

export default DashboardLayout;
