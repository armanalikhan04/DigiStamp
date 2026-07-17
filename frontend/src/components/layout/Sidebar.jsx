import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6 shadow-lg">

      {/* Logo */}
      <h2 className="text-3xl font-bold text-blue-400 mb-10">
        DigiStamp
      </h2>

      {/* Navigation */}
      <nav className="flex flex-col gap-3">

        <Link
          to="/dashboard"
          className="p-3 rounded-lg hover:bg-slate-700 transition"
        >
          🏠 Dashboard
        </Link>

        <Link
          to="/create-deal"
          className="p-3 rounded-lg hover:bg-slate-700 transition"
        >
          📄 Create Deal
        </Link>

        <Link
          to="/verify"
          className="p-3 rounded-lg hover:bg-slate-700 transition"
        >
          🔍 Verify Agreement
        </Link>

        <Link
          to="/verification"
          className="p-3 rounded-lg hover:bg-slate-700 transition"
        >
          🛡 Identity Verification
        </Link>

        <button
          className="text-left p-3 rounded-lg hover:bg-red-600 transition"
        >
          🚪 Logout
        </button>

      </nav>

    </aside>
  );
}

export default Sidebar;