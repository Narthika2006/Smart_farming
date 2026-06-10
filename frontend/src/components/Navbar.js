import { getAuthValue } from "../utils/authStorage";

function Navbar() {
  const name = getAuthValue("name");

  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-green-700">Smart Farmer Dashboard</h1>
      <div className="text-gray-700">
        Welcome, <span className="font-semibold">{name || "Farmer"}</span>
      </div>
    </div>
  );
}

export default Navbar;
