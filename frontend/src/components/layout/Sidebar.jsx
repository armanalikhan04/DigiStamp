import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">

      <h2 className="text-2xl font-bold mb-10">
        DigiStamp
      </h2>

      <nav className="flex flex-col gap-4">

        <Link
          to="/dashboard"
          className="hover:bg-slate-700 p-3 rounded-lg"
        >
          🏠 Dashboard
        </Link>

        <Link
          to="/create"
          className="hover:bg-slate-700 p-3 rounded-lg"
        >
          📄 Create Deal
        </Link>

        <Link
          to="/verify"
          className="hover:bg-slate-700 p-3 rounded-lg"
        >
          🔍 Verify Agreement
        </Link>

                <Link to="/verification">
                    🛡 Identity Verification
                            </Link>

        <button
          className="text-left hover:bg-red-600 p-3 rounded-lg"
        >
          🚪 Logout
        </button>

      </nav>

    </aside>
  );
}

export default Sidebar;